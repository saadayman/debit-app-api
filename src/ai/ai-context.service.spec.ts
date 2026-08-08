import { PrismaService } from '../prisma/prisma.service';
import { SavingsService } from '../savings/savings.service';
import { AiContextService } from './ai-context.service';

describe('AiContextService', () => {
  const salaryDate = new Date('2026-07-27T00:00:00.000Z');
  const paymentDate = new Date('2026-07-28T00:00:00.000Z');

  const prisma = {
    settings: {
      upsert: jest.fn().mockResolvedValue({
        currency: 'JOD',
        locale: 'en',
        dateFormat: 'dd/MM/yyyy',
      }),
    },
    category: {
      findMany: jest
        .fn()
        .mockResolvedValue([
          { id: 'category-1', name: 'Food', nameAr: 'طعام' },
        ]),
    },
    job: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'job-1',
          name: 'Main job',
          type: 'FULL_TIME',
          employer: 'Employer',
          expectedAmount: 1000,
          payDayOfMonth: 27,
          active: true,
          notes: 'Primary income',
        },
      ]),
    },
    income: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'salary-1',
          amount: 1000,
          date: salaryDate,
          source: 'SALARY',
          description: 'July salary',
          notes: 'Received early',
          createdAt: salaryDate,
          job: { name: 'Main job' },
        },
      ]),
    },
    expense: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'expense-1',
          amount: 300,
          date: paymentDate,
          category: { name: 'Food' },
          paymentMethod: 'CASH',
          description: 'Groceries',
          notes: 'Weekly shop',
          salaryIncomeId: 'salary-1',
          salaryIncome: {
            id: 'salary-1',
            amount: 1000,
            date: salaryDate,
            description: 'July salary',
            job: { name: 'Main job' },
          },
          installment: null,
          recurringPayment: null,
          createdAt: paymentDate,
        },
      ]),
    },
    debt: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'debt-1',
          name: 'Loan',
          direction: 'OWED_BY_ME',
          type: 'PERSONAL_LOAN',
          originalAmount: 1000,
          interestRate: 0,
          monthlyPayment: 100,
          startDate: salaryDate,
          dueDate: null,
          counterparty: 'Bank',
          notes: null,
          createdAt: salaryDate,
          payments: [
            {
              id: 'payment-1',
              amount: 200,
              date: paymentDate,
              isExtra: false,
              notes: null,
            },
          ],
        },
      ]),
    },
    installment: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'installment-1',
          name: 'Phone',
          totalPrice: 500,
          downPayment: 100,
          monthlyAmount: 100,
          totalInstallments: 4,
          paidInstallments: 1,
          startDate: salaryDate,
          notes: null,
          salaryIncome: {
            id: 'salary-1',
            amount: 1000,
            date: salaryDate,
            description: 'July salary',
          },
          expenses: [
            {
              id: 'installment-expense-1',
              amount: 100,
              date: paymentDate,
              description: 'Phone installment',
              salaryIncomeId: 'salary-1',
            },
          ],
        },
      ]),
    },
    recurringPayment: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'recurring-1',
          name: 'Internet',
          amount: 30,
          category: { name: 'Bills' },
          paymentMethod: 'BANK_TRANSFER',
          frequency: 'MONTHLY',
          intervalCount: 1,
          nextDueDate: paymentDate,
          active: true,
          notes: null,
          approvals: [],
        },
      ]),
    },
    budget: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'budget-1',
          month: new Date('2026-07-01T00:00:00.000Z'),
          amount: 400,
          category: { name: 'Food' },
        },
      ]),
    },
    savingsAsset: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'saving-1',
          type: 'CASH',
          name: 'Emergency fund',
          weightGrams: null,
          karat: null,
          goldForm: null,
          quantity: null,
          purityPermille: null,
          amount: 250,
          notes: null,
          createdAt: paymentDate,
        },
      ]),
    },
  };
  const savings = { total: jest.fn().mockResolvedValue(250) };
  const service = new AiContextService(
    prisma as unknown as PrismaService,
    savings as unknown as SavingsService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('provides complete user-scoped financial records and computed balances', async () => {
    const result = await service.build('user-1');
    const profile = JSON.parse(result.text) as unknown as {
      salaryCycles: Record<string, unknown>[];
      expenses: Record<string, unknown>[];
      debts: Record<string, unknown>[];
      installments: Record<string, unknown>[];
      recurringPayments: Array<{ name: string }>;
      budgets: Array<{ amount: number }>;
      savings: { currentEstimatedTotal: number };
    };

    expect(profile.salaryCycles[0]).toEqual(
      expect.objectContaining({
        paidExpenses: 300,
        currentRemainingBalance: 700,
      }),
    );
    expect(profile.expenses[0]).toEqual(
      expect.objectContaining({
        description: 'Groceries',
        notes: 'Weekly shop',
      }),
    );
    expect(profile.debts[0]).toEqual(
      expect.objectContaining({ totalPaid: 200, remaining: 800 }),
    );
    expect(profile.installments[0]).toEqual(
      expect.objectContaining({
        paidInstallments: 2,
        remainingInstallments: 2,
        paidAmount: 300,
        remainingBalance: 200,
      }),
    );
    expect(profile.recurringPayments[0].name).toBe('Internet');
    expect(profile.budgets[0].amount).toBe(400);
    expect(profile.savings).toEqual(
      expect.objectContaining({ currentEstimatedTotal: 250 }),
    );

    expect(prisma.income.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(prisma.expense.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(prisma.debt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(prisma.installment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
  });
});
