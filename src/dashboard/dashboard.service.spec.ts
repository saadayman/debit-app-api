import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecurringService } from '../recurring/recurring.service';
import { SavingsService } from '../savings/savings.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService salary cycles', () => {
  const salary = {
    id: 'salary-1',
    userId: 'user-1',
    amount: 1000,
    date: new Date('2026-07-27T00:00:00.000Z'),
    source: 'SALARY',
    jobId: null,
    job: null,
    description: 'July salary',
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const generateDueExpenses = jest.fn().mockResolvedValue(undefined);
  const savingsTotal = jest.fn().mockResolvedValue(0);
  const incomeFindFirst = jest.fn();
  const incomeAggregate = jest.fn();
  const incomeFindMany = jest.fn();
  const expenseAggregate = jest.fn();
  const expenseGroupBy = jest.fn();
  const expenseFindMany = jest.fn();
  const installmentFindMany = jest.fn();

  const prisma = {
    income: {
      findFirst: incomeFindFirst,
      aggregate: incomeAggregate,
      findMany: incomeFindMany,
    },
    expense: {
      aggregate: expenseAggregate,
      groupBy: expenseGroupBy,
      findMany: expenseFindMany,
    },
    debt: { findMany: jest.fn().mockResolvedValue([]) },
    installment: { findMany: installmentFindMany },
    budget: { findFirst: jest.fn().mockResolvedValue(null) },
    recurringPayment: { findMany: jest.fn().mockResolvedValue([]) },
    category: { findMany: jest.fn().mockResolvedValue([]) },
    debtPayment: { findMany: jest.fn().mockResolvedValue([]) },
  };

  const service = new DashboardService(
    prisma as unknown as PrismaService,
    { generateDueExpenses } as unknown as RecurringService,
    { total: savingsTotal } as unknown as SavingsService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    incomeFindFirst.mockReset();
    incomeFindFirst.mockResolvedValueOnce(salary).mockResolvedValue(null);
    incomeAggregate.mockResolvedValue({ _sum: { amount: 1000 } });
    expenseAggregate.mockResolvedValue({ _sum: { amount: 275 } });
    expenseFindMany.mockResolvedValue([]);
    installmentFindMany.mockResolvedValue([]);
    incomeFindMany
      .mockResolvedValueOnce([salary])
      .mockResolvedValueOnce([salary])
      .mockResolvedValueOnce([]);
    expenseGroupBy
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { salaryIncomeId: salary.id, _sum: { amount: 275 } },
      ]);
  });

  it('builds totals and trends from the explicitly selected salary', async () => {
    const result = await service.summary('user-1', undefined, salary.id);

    expect(expenseAggregate).toHaveBeenCalledWith({
      where: { userId: 'user-1', salaryIncomeId: salary.id },
      _sum: { amount: true },
    });
    expect(incomeAggregate).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        OR: [
          { id: salary.id },
          {
            source: { not: 'SALARY' },
            date: { gte: salary.date },
          },
        ],
      },
      _sum: { amount: true },
    });
    expect(result.period).toEqual(
      expect.objectContaining({
        type: 'salary',
        salaryIncomeId: salary.id,
      }),
    );
    expect(result.totals.income).toBe(1000);
    expect(result.totals.expenses).toBe(275);
    expect(result.totals.balance).toBe(725);
    expect(result.incomeVsExpenses).toEqual([
      expect.objectContaining({ income: 1000, expenses: 275 }),
    ]);
    expect(prisma.debtPayment.findMany).not.toHaveBeenCalled();
  });

  it('rejects a salary that does not belong to the user', async () => {
    incomeFindFirst.mockReset();
    incomeFindFirst.mockResolvedValue(null);

    await expect(
      service.summary('user-1', undefined, 'foreign-salary'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not deduct a paid installment twice from the salary balance', async () => {
    installmentFindMany.mockResolvedValue([
      {
        id: 'installment-1',
        totalPrice: 1200,
        downPayment: 0,
        monthlyAmount: 100,
        totalInstallments: 12,
        paidInstallments: 1,
        startDate: new Date('2026-07-01T00:00:00.000Z'),
      },
    ]);
    expenseFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ installmentId: 'installment-1' }]);

    const result = await service.summary('user-1', undefined, salary.id);

    expect(result.totals.expenses).toBe(275);
    expect(result.totals.installmentsMonthly).toBe(0);
    expect(result.totals.balance).toBe(725);
  });

  it('shows an unpaid installment without deducting it from the current balance', async () => {
    installmentFindMany.mockResolvedValue([
      {
        id: 'installment-1',
        totalPrice: 1200,
        downPayment: 0,
        monthlyAmount: 100,
        totalInstallments: 12,
        paidInstallments: 0,
        _count: { expenses: 0 },
        startDate: new Date('2026-07-01T00:00:00.000Z'),
      },
    ]);

    const result = await service.summary('user-1', undefined, salary.id);

    expect(result.totals.installmentsMonthly).toBe(100);
    expect(result.totals.balance).toBe(725);
  });
});
