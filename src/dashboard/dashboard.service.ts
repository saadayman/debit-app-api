import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { addDays, endOfMonth, format, subMonths } from 'date-fns';
import { installmentDueInMonth } from '../installments/installment-schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RecurringService } from '../recurring/recurring.service';
import { SavingsService, VALUATION_CURRENCY } from '../savings/savings.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private recurring: RecurringService,
    private savings: SavingsService,
  ) {}

  async summary(userId: string, month?: string, salaryIncomeId?: string) {
    // Materialize any due recurring expenses so the numbers are current.
    await this.recurring.generateDueExpenses(userId);

    const now = new Date();
    // Build the month in UTC so month comparisons don't drift by a day.
    const requestedMonthStart = month
      ? new Date(`${month}-01T00:00:00.000Z`)
      : new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

    const salary = salaryIncomeId
      ? await this.prisma.income.findFirst({
          where: { id: salaryIncomeId, userId, source: 'SALARY' },
          include: { job: true },
        })
      : null;
    if (salaryIncomeId && !salary) {
      throw new BadRequestException('Unknown salary payment');
    }
    const nextSalary = salary
      ? await this.prisma.income.findFirst({
          where: {
            userId,
            source: 'SALARY',
            date: { gt: salary.date },
          },
          orderBy: { date: 'asc' },
          select: { date: true },
        })
      : null;
    const monthStart = salary
      ? new Date(
          Date.UTC(salary.date.getUTCFullYear(), salary.date.getUTCMonth(), 1),
        )
      : requestedMonthStart;
    const monthEnd = endOfMonth(monthStart);

    // A salary cycle is an explicit relationship, not a calculated date range.
    // This lets a July salary include purchases made in August.
    const expenseScope = salary
      ? { salaryIncomeId: salary.id }
      : { date: { gte: monthStart, lte: monthEnd } };
    const incomeScope = salary
      ? {
          OR: [
            { id: salary.id },
            {
              source: { not: 'SALARY' as const },
              date: {
                gte: salary.date,
                ...(nextSalary ? { lt: nextSalary.date } : {}),
              },
            },
          ],
        }
      : { date: { gte: monthStart, lte: monthEnd } };

    const [
      incomeAgg,
      expenseAgg,
      debts,
      installments,
      overallBudget,
      upcoming,
      byCategory,
      categories,
      recentIncome,
      recentExpenses,
      recentPayments,
      paidInstallmentExpenses,
      savingsTotal,
    ] = await Promise.all([
      this.prisma.income.aggregate({
        where: { userId, ...incomeScope },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { userId, ...expenseScope },
        _sum: { amount: true },
      }),
      this.prisma.debt.findMany({
        where: { userId },
        include: { payments: true },
      }),
      this.prisma.installment.findMany({
        where: { userId },
        include: { _count: { select: { expenses: true } } },
      }),
      this.prisma.budget.findFirst({
        where: { userId, month: monthStart, categoryId: null },
      }),
      this.prisma.recurringPayment.findMany({
        where: { userId, active: true, nextDueDate: { lte: addDays(now, 7) } },
        include: { category: true },
        orderBy: { nextDueDate: 'asc' },
        take: 10,
      }),
      this.prisma.expense.groupBy({
        by: ['categoryId'],
        where: { userId, ...expenseScope },
        _sum: { amount: true },
      }),
      this.prisma.category.findMany({
        where: { OR: [{ isDefault: true, userId: null }, { userId }] },
      }),
      this.prisma.income.findMany({
        where: { userId, ...incomeScope },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      this.prisma.expense.findMany({
        where: { userId, ...expenseScope },
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      salary
        ? Promise.resolve<
            Prisma.DebtPaymentGetPayload<{ include: { debt: true } }>[]
          >([])
        : this.prisma.debtPayment.findMany({
            where: { debt: { userId } },
            include: { debt: true },
            orderBy: { date: 'desc' },
            take: 10,
          }),
      this.prisma.expense.findMany({
        where: {
          userId,
          ...expenseScope,
          installmentId: { not: null },
        },
        select: { installmentId: true },
      }),
      this.savings.total(userId),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount ?? 0);
    const totalExpenses = Number(expenseAgg._sum.amount ?? 0);

    // Money I owe and money owed to me live in the same table but are opposites:
    // one is a liability, the other an asset. Never mix them.
    const summarise = (list: typeof debts) =>
      list.map((d) => {
        const paid = d.payments.reduce((s, p) => s + Number(p.amount), 0);
        return { remaining: Math.max(Number(d.originalAmount) - paid, 0) };
      });

    const debtSummaries = summarise(
      debts.filter((d) => d.direction === 'OWED_BY_ME'),
    );
    const activeDebts = debtSummaries.filter((d) => d.remaining > 0);

    const receivableSummaries = summarise(
      debts.filter((d) => d.direction === 'OWED_TO_ME'),
    );
    const activeReceivables = receivableSummaries.filter(
      (r) => r.remaining > 0,
    );

    // Installment progress mirrors InstallmentsService.withComputed:
    // paid = downPayment + paidInstallments * monthlyAmount, capped at total.
    const paidInstallmentIds = new Set(
      paidInstallmentExpenses.map((expense) => expense.installmentId),
    );
    const installmentSummaries = installments.map((i) => {
      const total = Number(i.totalPrice);
      const paidInstallments = i.paidInstallments + (i._count?.expenses ?? 0);
      const paid = Math.min(
        Number(i.downPayment) + paidInstallments * Number(i.monthlyAmount),
        total,
      );
      const active = paidInstallments < i.totalInstallments;
      // Only installments actually running in the viewed month are owed then.
      const dueThisMonth =
        installmentDueInMonth({ ...i, paidInstallments }, monthStart, now) &&
        !paidInstallmentIds.has(i.id);
      return {
        remaining: Math.max(total - paid, 0),
        monthly: dueThisMonth ? Number(i.monthlyAmount) : 0,
        active,
      };
    });
    const activeInstallments = installmentSummaries.filter((i) => i.active);
    // Keep unpaid installment commitments visible for planning, but do not
    // reduce the current balance until their payment expense is recorded.
    const installmentMonthly = installmentSummaries.reduce(
      (s, i) => s + i.monthly,
      0,
    );

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const expensesByCategory = byCategory
      .map((g) => {
        const cat = categoryMap.get(g.categoryId);
        return {
          categoryId: g.categoryId,
          name: cat?.name ?? 'Unknown',
          nameAr: cat?.nameAr ?? null,
          color: cat?.color ?? null,
          icon: cat?.icon ?? null,
          total: Number(g._sum.amount ?? 0),
        };
      })
      .sort((a, b) => b.total - a.total);

    const incomeVsExpenses = salary
      ? await this.salaryTrend(userId, salary.date)
      : await this.monthlyTrend(userId, monthStart);

    const recent = [
      ...recentIncome.map((i) => ({
        id: i.id,
        type: 'income' as const,
        amount: Number(i.amount),
        date: i.date,
        label: i.description || i.source,
      })),
      ...recentExpenses.map((e) => ({
        id: e.id,
        type: 'expense' as const,
        amount: Number(e.amount),
        date: e.date,
        label: e.description || e.category.name,
        categoryName: e.category.name,
        categoryNameAr: e.category.nameAr,
        categoryColor: e.category.color,
      })),
      ...recentPayments
        .filter((payment) => !payment.incomeId)
        .map((p) => ({
          id: p.id,
          type: 'debtPayment' as const,
          amount: Number(p.amount),
          date: p.date,
          label: p.debt.name,
        })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    const budgetAmount = overallBudget ? Number(overallBudget.amount) : null;

    return {
      month: format(monthStart, 'yyyy-MM'),
      period: salary
        ? {
            type: 'salary' as const,
            salaryIncomeId: salary.id,
            salaryDate: salary.date,
            salaryName: salary.job?.name || salary.description || null,
          }
        : { type: 'month' as const },
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        installmentsMonthly: installmentMonthly,
        balance: totalIncome - totalExpenses,
      },
      debts: {
        activeCount: activeDebts.length,
        totalRemaining: debtSummaries.reduce((s, d) => s + d.remaining, 0),
      },
      receivables: {
        activeCount: activeReceivables.length,
        totalRemaining: receivableSummaries.reduce(
          (s, r) => s + r.remaining,
          0,
        ),
      },
      installments: {
        activeCount: activeInstallments.length,
        totalRemaining: installmentSummaries.reduce(
          (s, i) => s + i.remaining,
          0,
        ),
        monthlyCommitment: installmentMonthly,
      },
      savings: {
        total: savingsTotal,
        currency: VALUATION_CURRENCY,
      },
      budget: overallBudget
        ? {
            amount: budgetAmount,
            spent: totalExpenses,
            remaining: (budgetAmount ?? 0) - totalExpenses,
            percentUsed:
              budgetAmount && budgetAmount > 0
                ? (totalExpenses / budgetAmount) * 100
                : 0,
          }
        : null,
      upcomingPayments: upcoming,
      expensesByCategory,
      incomeVsExpenses,
      recentTransactions: recent,
    };
  }

  /** Income and spending totals for the selected salary and five before it. */
  private async salaryTrend(userId: string, selectedSalaryDate: Date) {
    const salaries = await this.prisma.income.findMany({
      where: {
        userId,
        source: 'SALARY',
        date: { lte: selectedSalaryDate },
      },
      orderBy: { date: 'desc' },
      take: 6,
    });
    const ordered = salaries.reverse();
    if (ordered.length === 0) return [];

    const spending = await this.prisma.expense.groupBy({
      by: ['salaryIncomeId'],
      where: {
        userId,
        salaryIncomeId: { in: ordered.map((salary) => salary.id) },
      },
      _sum: { amount: true },
    });
    const spendingBySalary = new Map(
      spending.map((row) => [row.salaryIncomeId, Number(row._sum.amount ?? 0)]),
    );

    const nextSalary = await this.prisma.income.findFirst({
      where: {
        userId,
        source: 'SALARY',
        date: { gt: selectedSalaryDate },
      },
      orderBy: { date: 'asc' },
      select: { date: true },
    });
    const extraIncome = await this.prisma.income.findMany({
      where: {
        userId,
        source: { not: 'SALARY' },
        date: {
          gte: ordered[0].date,
          ...(nextSalary ? { lt: nextSalary.date } : {}),
        },
      },
      orderBy: { date: 'asc' },
    });
    const extraBySalary = new Map<string, number>();
    for (const income of extraIncome) {
      const cycle = [...ordered]
        .reverse()
        .find((salary) => salary.date <= income.date);
      if (cycle) {
        extraBySalary.set(
          cycle.id,
          (extraBySalary.get(cycle.id) ?? 0) + Number(income.amount),
        );
      }
    }

    return ordered.map((salary) => ({
      month: format(salary.date, 'yyyy-MM'),
      salaryDate: salary.date,
      income: Number(salary.amount) + (extraBySalary.get(salary.id) ?? 0),
      expenses: spendingBySalary.get(salary.id) ?? 0,
    }));
  }

  /** Income and expense totals for the 6 months ending at monthStart. */
  private async monthlyTrend(userId: string, monthStart: Date) {
    const months = Array.from({ length: 6 }, (_, i) =>
      subMonths(monthStart, 5 - i),
    );
    return Promise.all(
      months.map(async (m) => {
        const [inc, exp] = await Promise.all([
          this.prisma.income.aggregate({
            where: { userId, date: { gte: m, lte: endOfMonth(m) } },
            _sum: { amount: true },
          }),
          this.prisma.expense.aggregate({
            where: { userId, date: { gte: m, lte: endOfMonth(m) } },
            _sum: { amount: true },
          }),
        ]);
        return {
          month: format(m, 'yyyy-MM'),
          income: Number(inc._sum.amount ?? 0),
          expenses: Number(exp._sum.amount ?? 0),
        };
      }),
    );
  }
}
