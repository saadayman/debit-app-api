import { Injectable } from '@nestjs/common';
import { Frequency } from '@prisma/client';
import { addDays, addMonths, addWeeks, addYears } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';

function step(date: Date, frequency: Frequency, times: number): Date {
  switch (frequency) {
    case 'DAILY':
      return addDays(date, times);
    case 'WEEKLY':
      return addWeeks(date, times);
    case 'MONTHLY':
      return addMonths(date, times);
    case 'YEARLY':
      return addYears(date, times);
  }
}

export type CalendarEventType =
  | 'salary'
  | 'income'
  | 'expectedSalary'
  | 'recurring'
  | 'debt'
  | 'receivable'
  | 'installment';

export interface CalendarEvent {
  date: string; // YYYY-MM-DD
  type: CalendarEventType;
  label: string;
  amount: number;
}

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  private iso(d: Date): string {
    // Stored dates are UTC midnight; format in UTC to avoid a timezone day-shift.
    return d.toISOString().slice(0, 10);
  }

  /** All occurrences of a recurring payment that fall within [start, end]. */
  private recurringOccurrences(
    nextDueDate: Date,
    frequency: Frequency,
    interval: number,
    start: Date,
    end: Date,
  ): Date[] {
    const out: Date[] = [];
    let d = new Date(nextDueDate);
    let guard = 0;
    // Walk back to just before the window, then forward through it.
    while (d > end && guard < 2000) {
      d = step(d, frequency, -interval);
      guard++;
    }
    while (d >= start && guard < 4000) {
      d = step(d, frequency, -interval);
      guard++;
    }
    d = step(d, frequency, interval);
    while (d <= end && guard < 6000) {
      if (d >= start) out.push(new Date(d));
      d = step(d, frequency, interval);
      guard++;
    }
    return out;
  }

  async month(userId: string, month?: string) {
    const now = new Date();
    const year = month ? Number(month.slice(0, 4)) : now.getFullYear();
    const monthIdx = month ? Number(month.slice(5, 7)) - 1 : now.getMonth();
    const monthStart = new Date(Date.UTC(year, monthIdx, 1));
    const monthEnd = new Date(Date.UTC(year, monthIdx + 1, 0, 23, 59, 59, 999));
    const monthKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;

    const [incomes, recurring, debts, installments, jobs] = await Promise.all([
      this.prisma.income.findMany({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
      }),
      this.prisma.recurringPayment.findMany({
        where: { userId, active: true },
        include: { category: true },
      }),
      this.prisma.debt.findMany({
        where: { userId, dueDate: { gte: monthStart, lte: monthEnd } },
      }),
      this.prisma.installment.findMany({
        where: { userId },
        include: { _count: { select: { expenses: true } } },
      }),
      this.prisma.job.findMany({
        where: { userId, active: true, payDayOfMonth: { not: null } },
      }),
    ]);

    const events: CalendarEvent[] = [];

    for (const inc of incomes) {
      events.push({
        date: this.iso(inc.date),
        type: inc.source === 'SALARY' ? 'salary' : 'income',
        label: inc.description || inc.source,
        amount: Number(inc.amount),
      });
    }

    for (const rp of recurring) {
      const occurrences = this.recurringOccurrences(
        rp.nextDueDate,
        rp.frequency,
        rp.intervalCount,
        monthStart,
        monthEnd,
      );
      for (const occ of occurrences) {
        events.push({
          date: this.iso(occ),
          type: 'recurring',
          label: rp.name,
          amount: Number(rp.amount),
        });
      }
    }

    for (const debt of debts) {
      if (!debt.dueDate) continue;
      const owedToMe = debt.direction === 'OWED_TO_ME';
      events.push({
        date: this.iso(debt.dueDate),
        type: owedToMe ? 'receivable' : 'debt',
        label: owedToMe ? (debt.counterparty ?? debt.name) : debt.name,
        amount: debt.monthlyPayment != null ? Number(debt.monthlyPayment) : 0,
      });
    }

    // Installments: monthly due on their start day-of-month, while still active.
    const lastDay = monthEnd.getUTCDate();
    for (const inst of installments) {
      const paidInstallments =
        inst.paidInstallments + (inst._count?.expenses ?? 0);
      if (paidInstallments >= inst.totalInstallments) continue;
      // Skip months before the installment started.
      const startMonth = new Date(
        Date.UTC(
          inst.startDate.getUTCFullYear(),
          inst.startDate.getUTCMonth(),
          1,
        ),
      );
      if (startMonth > monthStart) continue;
      const day = Math.min(inst.startDate.getUTCDate(), lastDay);
      const due = new Date(Date.UTC(year, monthIdx, day));
      events.push({
        date: this.iso(due),
        type: 'installment',
        label: inst.name,
        amount: Number(inst.monthlyAmount),
      });
    }

    // Expected salary for jobs with a fixed pay day. Suppressed once the
    // payment for that job has actually been recorded in this month.
    const paidJobIds = new Set(
      incomes.map((i) => i.jobId).filter((id): id is string => !!id),
    );
    for (const job of jobs) {
      if (job.payDayOfMonth == null) continue;
      if (paidJobIds.has(job.id)) continue;
      const day = Math.min(job.payDayOfMonth, lastDay);
      const due = new Date(Date.UTC(year, monthIdx, day));
      events.push({
        date: this.iso(due),
        type: 'expectedSalary',
        label: job.name,
        amount: Number(job.expectedAmount ?? 0),
      });
    }

    events.sort((a, b) => a.date.localeCompare(b.date));

    return { month: monthKey, events };
  }
}
