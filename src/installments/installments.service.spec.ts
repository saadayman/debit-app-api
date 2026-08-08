import { Test } from '@nestjs/testing';
import { PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InstallmentsService } from './installments.service';

type RawInstallment = {
  id: string;
  userId: string;
  name: string;
  totalPrice: number;
  downPayment: number;
  monthlyAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  startDate: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function raw(overrides: Partial<RawInstallment> = {}): RawInstallment {
  return {
    id: 'i1',
    userId: 'u1',
    name: 'Phone',
    totalPrice: 1200,
    downPayment: 0,
    monthlyAmount: 50,
    totalInstallments: 24,
    paidInstallments: 0,
    startDate: new Date('2026-01-01'),
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('InstallmentsService valuation', () => {
  let service: InstallmentsService;
  const findMany = jest.fn();

  beforeEach(async () => {
    findMany.mockReset();
    const moduleRef = await Test.createTestingModule({
      providers: [
        InstallmentsService,
        {
          provide: PrismaService,
          useValue: { installment: { findMany } },
        },
      ],
    }).compile();
    service = moduleRef.get(InstallmentsService);
  });

  it('counts the down payment plus paid installments toward the total', async () => {
    findMany.mockResolvedValue([
      raw({
        totalPrice: 1200,
        downPayment: 300,
        monthlyAmount: 50,
        totalInstallments: 18,
        paidInstallments: 2,
      }),
    ]);

    const [item] = await service.list('u1');

    // 300 down + 2 x 50 = 400 paid, leaving 800 of the 1200 total.
    expect(item.paidAmount).toBe(400);
    expect(item.remainingBalance).toBe(800);
    expect(item.remainingInstallments).toBe(16);
    expect(item.percentPaid).toBeCloseTo(33.33, 1);
  });

  it('handles a purchase with no down payment', async () => {
    findMany.mockResolvedValue([
      raw({
        totalPrice: 1000,
        downPayment: 0,
        monthlyAmount: 100,
        totalInstallments: 10,
        paidInstallments: 3,
      }),
    ]);

    const [item] = await service.list('u1');

    expect(item.paidAmount).toBe(300);
    expect(item.remainingBalance).toBe(700);
    expect(item.percentPaid).toBeCloseTo(30, 5);
  });

  it('never reports paying more than the total price', async () => {
    // Down payment plus all installments overshoots the price.
    findMany.mockResolvedValue([
      raw({
        totalPrice: 900,
        downPayment: 500,
        monthlyAmount: 100,
        totalInstallments: 5,
        paidInstallments: 5,
      }),
    ]);

    const [item] = await service.list('u1');

    expect(item.paidAmount).toBe(900);
    expect(item.remainingBalance).toBe(0);
    expect(item.percentPaid).toBe(100);
    expect(item.remainingInstallments).toBe(0);
  });

  it('reports a fully-covered purchase when the down payment pays it off', async () => {
    findMany.mockResolvedValue([
      raw({
        totalPrice: 500,
        downPayment: 500,
        monthlyAmount: 50,
        totalInstallments: 10,
        paidInstallments: 0,
      }),
    ]);

    const [item] = await service.list('u1');

    expect(item.remainingBalance).toBe(0);
    expect(item.percentPaid).toBe(100);
  });
});

describe('InstallmentsService payments', () => {
  it('links a newly created plan to the selected salary', async () => {
    const installmentCreate = jest.fn().mockResolvedValue({
      ...raw(),
      salaryIncomeId: 'salary-1',
      _count: { expenses: 0 },
    });
    const prisma = {
      income: {
        findFirst: jest.fn().mockResolvedValue({ id: 'salary-1' }),
      },
      installment: { create: installmentCreate },
    };
    const service = new InstallmentsService(prisma as unknown as PrismaService);

    await service.create('u1', {
      name: 'Phone',
      totalPrice: 1200,
      monthlyAmount: 100,
      totalInstallments: 12,
      startDate: '2026-07-28',
      salaryIncomeId: 'salary-1',
    });

    expect(installmentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ salaryIncomeId: 'salary-1' }),
      }),
    );
  });

  it('derives the next paid count from a salary-linked expense', async () => {
    const installment = raw({
      totalPrice: 250,
      monthlyAmount: 100,
      totalInstallments: 3,
      paidInstallments: 2,
    });
    const tx = {
      installment: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ ...installment, _count: { expenses: 0 } }),
        update: jest
          .fn()
          .mockResolvedValue(raw({ ...installment, paidInstallments: 3 })),
      },
      expense: { create: jest.fn().mockResolvedValue({ id: 'expense-1' }) },
    };
    const prisma = {
      category: {
        findFirst: jest.fn().mockResolvedValue({ id: 'category-1' }),
      },
      income: { findFirst: jest.fn().mockResolvedValue({ id: 'salary-1' }) },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const service = new InstallmentsService(prisma as unknown as PrismaService);

    const result = await service.pay('u1', 'i1', {
      date: '2026-07-28',
      categoryId: 'category-1',
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      salaryIncomeId: 'salary-1',
    });

    // The final payment only charges the 50 still outstanding, not a full 100.
    expect(tx.expense.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 50,
          installmentId: 'i1',
          salaryIncomeId: 'salary-1',
        }),
      }),
    );
    expect(result.installment.paidInstallments).toBe(3);
    expect(result.expense).toEqual({ id: 'expense-1' });
  });

  it('does not reduce progress below generated installment expenses', async () => {
    const prisma = {
      installment: {
        findFirst: jest.fn().mockResolvedValue({
          ...raw({
            totalInstallments: 12,
            paidInstallments: 1,
          }),
          _count: { expenses: 2 },
        }),
        update: jest.fn(),
      },
      expense: { count: jest.fn().mockResolvedValue(2) },
    };
    const service = new InstallmentsService(prisma as unknown as PrismaService);

    await expect(
      service.update('u1', 'i1', { paidInstallments: 1 }),
    ).rejects.toThrow('cannot be lower than 2');
    expect(prisma.installment.update).not.toHaveBeenCalled();
  });
});
