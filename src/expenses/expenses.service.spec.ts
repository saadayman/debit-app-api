import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExpensesService } from './expenses.service';

describe('ExpensesService salary cycles', () => {
  let service: ExpensesService;
  const categoryFindFirst = jest.fn();
  const incomeFindFirst = jest.fn();
  const expenseFindFirst = jest.fn();
  const expenseFindMany = jest.fn();
  const expenseCreate = jest.fn();
  const expenseUpdate = jest.fn();
  const expenseUpdateMany = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    categoryFindFirst.mockResolvedValue({ id: 'category-1' });
    incomeFindFirst.mockResolvedValue({ id: 'salary-1', source: 'SALARY' });
    expenseFindFirst.mockResolvedValue({ id: 'expense-1', userId: 'user-1' });

    const moduleRef = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: PrismaService,
          useValue: {
            category: { findFirst: categoryFindFirst },
            income: { findFirst: incomeFindFirst },
            expense: {
              findFirst: expenseFindFirst,
              findMany: expenseFindMany,
              create: expenseCreate,
              update: expenseUpdate,
              updateMany: expenseUpdateMany,
            },
          },
        },
      ],
    }).compile();
    service = moduleRef.get(ExpensesService);
  });

  it('links a new expense to the selected salary owned by the user', async () => {
    expenseCreate.mockResolvedValue({ id: 'expense-1' });

    await service.create('user-1', {
      amount: 12,
      date: '2026-07-28',
      categoryId: 'category-1',
      paymentMethod: PaymentMethod.CASH,
      salaryIncomeId: 'salary-1',
    });

    expect(incomeFindFirst).toHaveBeenCalledWith({
      where: { id: 'salary-1', userId: 'user-1', source: 'SALARY' },
    });
    expect(expenseCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ salaryIncomeId: 'salary-1' }),
      }),
    );
  });

  it('rejects a salary payment that is not owned by the user', async () => {
    incomeFindFirst.mockResolvedValue(null);

    await expect(
      service.create('user-1', {
        amount: 12,
        date: '2026-07-28',
        categoryId: 'category-1',
        paymentMethod: PaymentMethod.CASH,
        salaryIncomeId: 'foreign-salary',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(expenseCreate).not.toHaveBeenCalled();
  });

  it('can move an existing expense back to the unassigned group', async () => {
    expenseUpdate.mockResolvedValue({ id: 'expense-1' });

    await service.update('user-1', 'expense-1', { salaryIncomeId: null });

    expect(expenseUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { salaryIncomeId: null } }),
    );
  });

  it('filters the list to unassigned expenses when requested', () => {
    service.list('user-1', { salaryIncomeId: 'unassigned' });

    expect(expenseFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ salaryIncomeId: null }),
      }),
    );
  });

  it("bulk assigns only the user's currently unassigned expenses", async () => {
    expenseUpdateMany.mockResolvedValue({ count: 2 });

    const result = await service.assignSalary('user-1', {
      expenseIds: ['expense-1', 'expense-2'],
      salaryIncomeId: 'salary-1',
    });

    expect(expenseUpdateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        id: { in: ['expense-1', 'expense-2'] },
        salaryIncomeId: null,
      },
      data: { salaryIncomeId: 'salary-1' },
    });
    expect(result).toEqual({ assigned: 2 });
  });
});
