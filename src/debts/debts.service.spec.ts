import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DebtsService } from './debts.service';

function rawDebt(overrides: Record<string, unknown> = {}) {
  return {
    id: 'd1',
    userId: 'u1',
    name: 'Car Loan',
    direction: 'OWED_BY_ME',
    type: 'CAR_LOAN',
    originalAmount: 12000,
    interestRate: 4.5,
    monthlyPayment: 300,
    startDate: new Date('2026-01-01'),
    dueDate: null,
    counterparty: 'Bank',
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    payments: [],
    ...overrides,
  };
}

function payment(amount: number) {
  return {
    id: `p${amount}`,
    debtId: 'd1',
    amount,
    date: new Date('2026-07-05'),
    isExtra: false,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('DebtsService payoff math', () => {
  let service: DebtsService;
  const findMany = jest.fn();

  beforeEach(async () => {
    findMany.mockReset();
    const moduleRef = await Test.createTestingModule({
      providers: [
        DebtsService,
        { provide: PrismaService, useValue: { debt: { findMany } } },
      ],
    }).compile();
    service = moduleRef.get(DebtsService);
  });

  it('derives remaining balance and progress from recorded payments', async () => {
    findMany.mockResolvedValue([
      rawDebt({ payments: [payment(300), payment(300)] }),
    ]);

    const [debt] = await service.list('u1');

    expect(debt.totalPaid).toBe(600);
    expect(debt.remaining).toBe(11400);
    expect(debt.percentPaid).toBeCloseTo(5, 5);
    expect(debt.isPaidOff).toBe(false);
    // 11400 remaining at 300/month => 38 months left.
    expect(debt.remainingMonths).toBe(38);
    expect(debt.estimatedPayoffDate).toBeInstanceOf(Date);
  });

  it('marks a debt paid off once payments cover the original amount', async () => {
    findMany.mockResolvedValue([
      rawDebt({ originalAmount: 500, payments: [payment(500)] }),
    ]);

    const [debt] = await service.list('u1');

    expect(debt.remaining).toBe(0);
    expect(debt.percentPaid).toBe(100);
    expect(debt.isPaidOff).toBe(true);
    expect(debt.remainingMonths).toBe(0);
    expect(debt.estimatedPayoffDate).toBeNull();
  });

  it('does not report a negative balance when overpaid', async () => {
    findMany.mockResolvedValue([
      rawDebt({ originalAmount: 500, payments: [payment(600)] }),
    ]);

    const [debt] = await service.list('u1');

    expect(debt.remaining).toBe(0);
    expect(debt.percentPaid).toBe(100);
    expect(debt.isPaidOff).toBe(true);
  });

  it('tracks money owed to me the same way, from payments received', async () => {
    // Lent 500 to a friend with no repayment schedule; they paid back 200.
    findMany.mockResolvedValue([
      rawDebt({
        name: 'Loan to Ahmad',
        direction: 'OWED_TO_ME',
        type: 'PERSONAL_LOAN',
        counterparty: 'Ahmad',
        originalAmount: 500,
        monthlyPayment: null,
        payments: [payment(200)],
      }),
    ]);

    const [receivable] = await service.list('u1');

    expect(receivable.direction).toBe('OWED_TO_ME');
    expect(receivable.totalPaid).toBe(200);
    expect(receivable.remaining).toBe(300);
    expect(receivable.percentPaid).toBeCloseTo(40, 5);
    expect(receivable.isPaidOff).toBe(false);
  });

  it('reports no payoff projection when there is no monthly schedule', async () => {
    findMany.mockResolvedValue([
      rawDebt({ originalAmount: 500, monthlyPayment: null, payments: [] }),
    ]);

    const [debt] = await service.list('u1');

    expect(debt.scheduled).toBe(false);
    expect(debt.remainingMonths).toBe(0);
    expect(debt.estimatedPayoffDate).toBeNull();
    // The balance is still tracked even without a schedule.
    expect(debt.remaining).toBe(500);
  });

  it('rounds partial months up so the last payment is counted', async () => {
    // 100 remaining at 30/month needs 4 payments, not 3.33.
    findMany.mockResolvedValue([
      rawDebt({
        originalAmount: 100,
        monthlyPayment: 30,
        payments: [],
      }),
    ]);

    const [debt] = await service.list('u1');

    expect(debt.remainingMonths).toBe(4);
  });
});

describe('DebtsService received repayments', () => {
  const debtFindFirst = jest.fn();
  const debtPaymentFindFirst = jest.fn();
  const debtPaymentCreate = jest.fn().mockResolvedValue({});
  const debtPaymentDelete = jest.fn().mockResolvedValue({});
  const incomeCreate = jest.fn();
  const incomeDelete = jest.fn().mockResolvedValue({});
  const savingsAssetCreate = jest.fn();
  const savingsAssetDelete = jest.fn().mockResolvedValue({});
  const transactionClient = {
    debt: { findFirst: debtFindFirst },
    debtPayment: {
      create: debtPaymentCreate,
      delete: debtPaymentDelete,
    },
    income: { create: incomeCreate, delete: incomeDelete },
    savingsAsset: {
      create: savingsAssetCreate,
      delete: savingsAssetDelete,
    },
  };
  const prisma = {
    ...transactionClient,
    debtPayment: {
      ...transactionClient.debtPayment,
      findFirst: debtPaymentFindFirst,
    },
    $transaction: jest.fn(
      async (callback: (tx: typeof transactionClient) => Promise<unknown>) =>
        callback(transactionClient),
    ),
  };
  const service = new DebtsService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
    debtFindFirst.mockResolvedValue(
      rawDebt({
        name: 'Loan to Ahmad',
        direction: 'OWED_TO_ME',
        originalAmount: 100,
        payments: [],
      }),
    );
    incomeCreate.mockResolvedValue({ id: 'income-1' });
    savingsAssetCreate.mockResolvedValue({ id: 'saving-1' });
  });

  it('creates linked income when part of a receivable is repaid', async () => {
    await service.addPayment('u1', 'd1', {
      amount: 50,
      date: '2026-08-01',
    });

    expect(incomeCreate).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        amount: 50,
        date: new Date('2026-08-01'),
        source: 'OTHER',
        description: 'Repayment received: Loan to Ahmad',
        notes: undefined,
      },
    });
    expect(debtPaymentCreate).toHaveBeenCalledWith({
      data: {
        debtId: 'd1',
        amount: 50,
        date: new Date('2026-08-01'),
        isExtra: false,
        notes: undefined,
        incomeId: 'income-1',
        savingsAssetId: 'saving-1',
      },
    });
    expect(savingsAssetCreate).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        type: 'CASH',
        name: 'Debt repayment: Loan to Ahmad',
        amount: 50,
        notes: undefined,
      },
    });
  });

  it('removes the linked income when a received repayment is deleted', async () => {
    debtPaymentFindFirst.mockResolvedValue({
      ...payment(50),
      incomeId: 'income-1',
      savingsAssetId: 'saving-1',
      debt: { direction: 'OWED_TO_ME', name: 'Loan to Ahmad' },
    });

    await service.removePayment('u1', 'd1', 'p50');

    expect(debtPaymentDelete).toHaveBeenCalledWith({ where: { id: 'p50' } });
    expect(incomeDelete).toHaveBeenCalledWith({ where: { id: 'income-1' } });
    expect(savingsAssetDelete).toHaveBeenCalledWith({
      where: { id: 'saving-1' },
    });
  });

  it('does not create income for payments made toward the user’s own debt', async () => {
    debtFindFirst.mockResolvedValue(
      rawDebt({ direction: 'OWED_BY_ME', payments: [] }),
    );

    await service.addPayment('u1', 'd1', {
      amount: 50,
      date: '2026-08-01',
    });

    expect(incomeCreate).not.toHaveBeenCalled();
    expect(debtPaymentCreate).toHaveBeenCalledWith({
      data: {
        debtId: 'd1',
        amount: 50,
        date: new Date('2026-08-01'),
        isExtra: false,
        notes: undefined,
        incomeId: null,
        savingsAssetId: null,
      },
    });
    expect(savingsAssetCreate).not.toHaveBeenCalled();
  });
});
