import { Injectable } from '@nestjs/common';
import {
  endOfMonth,
  format,
  getDaysInMonth,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { installmentDueInMonth } from '../installments/installment-schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SavingsService } from '../savings/savings.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private savings: SavingsService,
  ) {}

  async overview(userId: string, month?: string) {
    const now = new Date();
    const monthStart = month
      ? new Date(`${month}-01T00:00:00.000Z`)
      : startOfMonth(now);
    const monthEnd = endOfMonth(monthStart);
    const daysInMonth = getDaysInMonth(monthStart);
    const isCurrentMonth =
      monthStart.getUTCFullYear() === now.getFullYear() &&
      monthStart.getUTCMonth() === now.getMonth();
    // For a past month there is no "so far": every day counts toward the
    // average and there is nothing left to project.
    const daysElapsed = isCurrentMonth
      ? Math.max(now.getDate(), 1)
      : daysInMonth;
    const daysRemaining = isCurrentMonth
      ? Math.max(daysInMonth - now.getDate(), 0)
      : 0;

    const [
      incomeAgg,
      expenseAgg,
      byCategory,
      categories,
      debts,
      installments,
      paidInstallmentExpenses,
      savingsTotal,
    ] = await Promise.all([
      this.prisma.income.aggregate({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      this.prisma.expense.groupBy({
        by: ['categoryId'],
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      this.prisma.category.findMany({
        where: { OR: [{ isDefault: true, userId: null }, { userId }] },
      }),
      this.prisma.debt.findMany({
        where: { userId },
        include: { payments: true },
      }),
      this.prisma.installment.findMany({
        where: { userId },
        include: { _count: { select: { expenses: true } } },
      }),
      this.prisma.expense.findMany({
        where: {
          userId,
          date: { gte: monthStart, lte: monthEnd },
          installmentId: { not: null },
        },
        select: { installmentId: true },
      }),
      this.savings.total(userId),
    ]);

    const income = Number(incomeAgg._sum.amount ?? 0);
    const expenses = Number(expenseAgg._sum.amount ?? 0);

    // Only money I owe is a liability; money owed to me is an asset.
    const owedByMe = debts.filter((d) => d.direction === 'OWED_BY_ME');
    const owedToMe = debts.filter((d) => d.direction === 'OWED_TO_ME');

    const remainingOf = (d: (typeof debts)[number]) => {
      const paid = d.payments.reduce((p, x) => p + Number(x.amount), 0);
      return Math.max(Number(d.originalAmount) - paid, 0);
    };

    const debtRemaining = owedByMe.reduce((s, d) => s + remainingOf(d), 0);
    const receivableRemaining = owedToMe.reduce(
      (s, d) => s + remainingOf(d),
      0,
    );
    const debtMonthly = owedByMe.reduce(
      (s, d) =>
        remainingOf(d) > 0 && d.monthlyPayment != null
          ? s + Number(d.monthlyPayment)
          : s,
      0,
    );
    const paidInstallmentIds = new Set(
      paidInstallmentExpenses.map((expense) => expense.installmentId),
    );
    // Only unpaid installments running in the viewed month remain obligations.
    const installmentMonthly = installments.reduce((s, i) => {
      const paidInstallments = i.paidInstallments + (i._count?.expenses ?? 0);
      return installmentDueInMonth(
        { ...i, paidInstallments },
        monthStart,
        now,
      ) && !paidInstallmentIds.has(i.id)
        ? s + Number(i.monthlyAmount)
        : s;
    }, 0);
    const installmentRemaining = installments.reduce((s, i) => {
      const total = Number(i.totalPrice);
      const paidInstallments = i.paidInstallments + (i._count?.expenses ?? 0);
      const paid = Math.min(
        Number(i.downPayment) + paidInstallments * Number(i.monthlyAmount),
        total,
      );
      return s + Math.max(total - paid, 0);
    }, 0);
    const obligationsMonthly = debtMonthly + installmentMonthly;

    // Category breakdown (this month)
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const topCategories = byCategory
      .map((g) => {
        const cat = categoryMap.get(g.categoryId);
        return {
          categoryId: g.categoryId,
          name: cat?.name ?? 'Unknown',
          nameAr: cat?.nameAr ?? null,
          color: cat?.color ?? null,
          total: Number(g._sum.amount ?? 0),
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    // Spending trend — last 6 months of expenses
    const trend = await this.spendingTrend(userId, monthStart);
    const avgMonthlySpending =
      trend.reduce((s, m) => s + m.expenses, 0) / (trend.length || 1);
    const avgDailySpending = expenses / daysElapsed;

    // Predicted end-of-month balance: what's left now, minus projected spend
    // over the remaining days at the current daily rate.
    const currentNet = income - expenses - obligationsMonthly;
    const predictedEndOfMonthBalance =
      currentNet - avgDailySpending * daysRemaining;

    return {
      month: format(monthStart, 'yyyy-MM'),
      income,
      expenses,
      avgDailySpending: round2(avgDailySpending),
      avgMonthlySpending: round2(avgMonthlySpending),
      savingsRate:
        income > 0 ? round2(((income - expenses) / income) * 100) : null,
      debtToIncomeRatio:
        income > 0 ? round2((obligationsMonthly / income) * 100) : null,
      obligationsMonthly: round2(obligationsMonthly),
      predictedEndOfMonthBalance: round2(predictedEndOfMonthBalance),
      netWorth: round2(
        savingsTotal +
          receivableRemaining -
          debtRemaining -
          installmentRemaining,
      ),
      netWorthParts: {
        savings: round2(savingsTotal),
        // What people still owe me counts toward what I'm worth.
        receivables: round2(receivableRemaining),
        debtRemaining: round2(debtRemaining),
        installmentRemaining: round2(installmentRemaining),
      },
      topCategories,
      spendingTrend: trend,
    };
  }

  private async spendingTrend(userId: string, monthStart: Date) {
    const months = Array.from({ length: 6 }, (_, i) =>
      subMonths(monthStart, 5 - i),
    );
    return Promise.all(
      months.map(async (m) => {
        const agg = await this.prisma.expense.aggregate({
          where: { userId, date: { gte: m, lte: endOfMonth(m) } },
          _sum: { amount: true },
        });
        return {
          month: format(m, 'yyyy-MM'),
          expenses: Number(agg._sum.amount ?? 0),
        };
      }),
    );
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
