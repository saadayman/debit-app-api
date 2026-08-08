import { Injectable } from '@nestjs/common';
import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  startOfMonth,
} from 'date-fns';
import { nextPayday } from '../jobs/jobs.service';
import { CarsService } from '../cars/cars.service';
import { GoldPriceService } from '../prices/gold-price.service';
import { PrismaService } from '../prisma/prisma.service';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  type:
    | 'budget_exceeded'
    | 'budget_near'
    | 'low_balance'
    | 'upcoming_recurring'
    | 'upcoming_salary'
    | 'debt_due'
    | 'receivable_due'
    | 'gold_moved'
    | 'maintenance_due'
    | 'maintenance_soon';
  severity: AlertSeverity;
  /** Structured data the client renders + translates */
  data: Record<string, unknown>;
}

const LOW_BALANCE_RATIO = 0.15; // warn when < 15% of monthly income remains
const BUDGET_NEAR_PCT = 85; // warn when a budget passes this % used
const UPCOMING_DAYS = 7;
const GOLD_MOVE_PCT = 3; // notify on a daily move of at least this %

@Injectable()
export class AlertsService {
  constructor(
    private prisma: PrismaService,
    private goldPrice: GoldPriceService,
    private cars: CarsService,
  ) {}

  async list(userId: string): Promise<{ alerts: Alert[] }> {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [
      incomeAgg,
      expenseAgg,
      budgets,
      spentByCategory,
      recurring,
      debts,
      jobs,
      vehicles,
    ] = await Promise.all([
      this.prisma.income.aggregate({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      this.prisma.budget.findMany({
        where: { userId, month: monthStart },
        include: { category: true },
      }),
      this.prisma.expense.groupBy({
        by: ['categoryId'],
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      this.prisma.recurringPayment.findMany({
        where: {
          userId,
          active: true,
          nextDueDate: { gte: now, lte: addDays(now, UPCOMING_DAYS) },
        },
        include: { category: true },
        orderBy: { nextDueDate: 'asc' },
      }),
      this.prisma.debt.findMany({
        where: {
          userId,
          dueDate: { gte: now, lte: addDays(now, 14) },
        },
      }),
      this.prisma.job.findMany({
        where: { userId, active: true, payDayOfMonth: { not: null } },
      }),
      this.cars.list(userId),
    ]);

    const alerts: Alert[] = [];
    const totalIncome = Number(incomeAgg._sum.amount ?? 0);
    const totalExpenses = Number(expenseAgg._sum.amount ?? 0);

    const spentMap = new Map(
      spentByCategory.map((g) => [g.categoryId, Number(g._sum.amount ?? 0)]),
    );

    // Budgets exceeded / near limit
    for (const b of budgets) {
      const amount = Number(b.amount);
      const spent = b.categoryId
        ? (spentMap.get(b.categoryId) ?? 0)
        : totalExpenses;
      if (amount <= 0) continue;
      const pct = (spent / amount) * 100;
      const label = b.category?.name ?? null;
      if (spent > amount) {
        alerts.push({
          id: `budget_exceeded_${b.id}`,
          type: 'budget_exceeded',
          severity: 'critical',
          data: {
            category: label,
            over: round2(spent - amount),
            amount,
            spent,
          },
        });
      } else if (pct >= BUDGET_NEAR_PCT) {
        alerts.push({
          id: `budget_near_${b.id}`,
          type: 'budget_near',
          severity: 'warning',
          data: { category: label, percent: Math.round(pct) },
        });
      }
    }

    // Low remaining balance for the month
    const balance = totalIncome - totalExpenses;
    if (totalIncome > 0 && balance < totalIncome * LOW_BALANCE_RATIO) {
      alerts.push({
        id: 'low_balance',
        type: 'low_balance',
        severity: balance < 0 ? 'critical' : 'warning',
        data: { balance: round2(balance) },
      });
    }

    // Upcoming recurring payments
    for (const rp of recurring) {
      alerts.push({
        id: `upcoming_recurring_${rp.id}`,
        type: 'upcoming_recurring',
        severity: 'info',
        data: {
          name: rp.name,
          amount: Number(rp.amount),
          days: Math.max(differenceInCalendarDays(rp.nextDueDate, now), 0),
          date: rp.nextDueDate.toISOString(),
        },
      });
    }

    // Debts due soon. A due date on money owed *to* me is a collection
    // reminder, not a payment I have to make.
    for (const d of debts) {
      if (!d.dueDate) continue;
      const owedToMe = d.direction === 'OWED_TO_ME';
      alerts.push({
        id: `${owedToMe ? 'receivable' : 'debt'}_due_${d.id}`,
        type: owedToMe ? 'receivable_due' : 'debt_due',
        severity: owedToMe ? 'info' : 'warning',
        data: {
          name: owedToMe ? (d.counterparty ?? d.name) : d.name,
          amount: d.monthlyPayment != null ? Number(d.monthlyPayment) : 0,
          days: Math.max(differenceInCalendarDays(d.dueDate, now), 0),
          date: d.dueDate.toISOString(),
        },
      });
    }

    // Upcoming salary for jobs with a fixed pay day, unless it already landed
    // this month.
    if (jobs.length > 0) {
      const paidThisMonth = await this.prisma.income.findMany({
        where: {
          userId,
          date: { gte: monthStart, lte: monthEnd },
          jobId: { in: jobs.map((j) => j.id) },
        },
        select: { jobId: true },
      });
      const paidJobIds = new Set(paidThisMonth.map((i) => i.jobId));
      for (const job of jobs) {
        if (job.payDayOfMonth == null || paidJobIds.has(job.id)) continue;
        const due = nextPayday(job.payDayOfMonth, now);
        const days = differenceInCalendarDays(due, now);
        if (days >= 0 && days <= UPCOMING_DAYS) {
          alerts.push({
            id: `upcoming_salary_${job.id}`,
            type: 'upcoming_salary',
            severity: 'info',
            data: {
              name: job.name,
              amount: Number(job.expectedAmount ?? 0),
              days,
              date: due.toISOString(),
            },
          });
        }
      }
    }

    // Gold price daily movement
    const movement = await this.goldPrice.getDailyMovement();
    if (movement && Math.abs(movement.percentChange) >= GOLD_MOVE_PCT) {
      alerts.push({
        id: 'gold_moved',
        type: 'gold_moved',
        severity: 'info',
        data: {
          direction: movement.direction,
          percent: Math.abs(movement.percentChange),
          perGram24k: movement.perGram24kJod,
        },
      });
    }

    // Mileage-based car maintenance. CarsService first applies any scheduled
    // commute mileage through today, so alerts use the latest estimate.
    for (const vehicle of vehicles) {
      for (const item of vehicle.maintenanceItems) {
        if (!item.active || item.status === 'OK') continue;
        alerts.push({
          id: `maintenance_${item.status.toLowerCase()}_${item.id}`,
          type:
            item.status === 'OVERDUE' ? 'maintenance_due' : 'maintenance_soon',
          severity: item.status === 'OVERDUE' ? 'critical' : 'warning',
          data: {
            name: item.name,
            car: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            remainingKm: Math.max(Number(item.remainingKm), 0),
            overdueKm: Math.max(-Number(item.remainingKm), 0),
          },
        });
      }
    }

    const order: AlertSeverity[] = ['critical', 'warning', 'info'];
    alerts.sort(
      (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity),
    );

    return { alerts };
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
