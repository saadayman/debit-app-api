import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Installment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInstallmentDto,
  PayInstallmentDto,
  UpdateInstallmentDto,
} from './dto/installment.dto';

type InstallmentWithCount = Installment & {
  _count?: { expenses: number };
};

@Injectable()
export class InstallmentsService {
  constructor(private prisma: PrismaService) {}

  private withComputed(installment: InstallmentWithCount) {
    const total = Number(installment.totalPrice);
    const downPayment = Number(installment.downPayment);
    const recordedExpenseCount = installment._count?.expenses ?? 0;
    const effectivePaidInstallments = Math.min(
      installment.paidInstallments + recordedExpenseCount,
      installment.totalInstallments,
    );
    // Total paid = the upfront down payment plus everything paid via monthly
    // installments so far, capped at the total price.
    const paidAmount = Math.min(
      downPayment +
        effectivePaidInstallments * Number(installment.monthlyAmount),
      total,
    );
    return {
      ...installment,
      paidInstallments: effectivePaidInstallments,
      historicalPaidInstallments: installment.paidInstallments,
      recordedExpenseCount,
      remainingInstallments:
        paidAmount >= total
          ? 0
          : installment.totalInstallments - effectivePaidInstallments,
      paidAmount,
      remainingBalance: Math.max(total - paidAmount, 0),
      percentPaid: total > 0 ? (paidAmount / total) * 100 : 0,
    };
  }

  async list(userId: string) {
    const items = await this.prisma.installment.findMany({
      where: { userId },
      include: {
        salaryIncome: { include: { job: true } },
        _count: { select: { expenses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((i) => this.withComputed(i));
  }

  private async findOwn(userId: string, id: string) {
    const installment = await this.prisma.installment.findFirst({
      where: { id, userId },
      include: {
        salaryIncome: { include: { job: true } },
        _count: { select: { expenses: true } },
      },
    });
    if (!installment) throw new NotFoundException('Installment not found');
    return installment;
  }

  private async assertCategoryUsable(userId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ isDefault: true, userId: null }, { userId }],
      },
    });
    if (!category) throw new BadRequestException('Unknown category');
  }

  private async assertSalaryUsable(userId: string, salaryIncomeId: string) {
    const salary = await this.prisma.income.findFirst({
      where: { id: salaryIncomeId, userId, source: 'SALARY' },
    });
    if (!salary) throw new BadRequestException('Unknown salary payment');
    return salary;
  }

  private async resolveSalary(userId: string, salaryIncomeId?: string | null) {
    if (salaryIncomeId) {
      return this.assertSalaryUsable(userId, salaryIncomeId);
    }
    const salary = await this.prisma.income.findFirst({
      where: { userId, source: 'SALARY' },
      orderBy: { date: 'desc' },
    });
    if (!salary) {
      throw new BadRequestException(
        'Record a salary payment before adding an installment',
      );
    }
    return salary;
  }

  async create(userId: string, dto: CreateInstallmentDto) {
    if ((dto.paidInstallments ?? 0) > dto.totalInstallments) {
      throw new BadRequestException(
        'paidInstallments cannot exceed totalInstallments',
      );
    }
    const salary = await this.resolveSalary(userId, dto.salaryIncomeId);
    const installment = await this.prisma.installment.create({
      data: {
        userId,
        name: dto.name,
        totalPrice: dto.totalPrice,
        downPayment: dto.downPayment ?? 0,
        monthlyAmount: dto.monthlyAmount,
        totalInstallments: dto.totalInstallments,
        paidInstallments: dto.paidInstallments ?? 0,
        startDate: new Date(dto.startDate),
        salaryIncomeId: salary.id,
        notes: dto.notes,
      },
      include: {
        salaryIncome: { include: { job: true } },
        _count: { select: { expenses: true } },
      },
    });
    return this.withComputed(installment);
  }

  async update(userId: string, id: string, dto: UpdateInstallmentDto) {
    const current = await this.findOwn(userId, id);
    const total = dto.totalInstallments ?? current.totalInstallments;
    const recordedPaymentCount = current._count.expenses;
    const paid =
      dto.paidInstallments ?? current.paidInstallments + recordedPaymentCount;
    if (paid > total) {
      throw new BadRequestException(
        'paidInstallments cannot exceed totalInstallments',
      );
    }
    if (dto.paidInstallments !== undefined) {
      if (paid < recordedPaymentCount) {
        throw new BadRequestException(
          `paidInstallments cannot be lower than ${recordedPaymentCount} recorded expense payments`,
        );
      }
    }
    if (dto.salaryIncomeId) {
      await this.assertSalaryUsable(userId, dto.salaryIncomeId);
    }
    const installment = await this.prisma.installment.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.totalPrice !== undefined ? { totalPrice: dto.totalPrice } : {}),
        ...(dto.downPayment !== undefined
          ? { downPayment: dto.downPayment }
          : {}),
        ...(dto.monthlyAmount !== undefined
          ? { monthlyAmount: dto.monthlyAmount }
          : {}),
        ...(dto.totalInstallments !== undefined
          ? { totalInstallments: dto.totalInstallments }
          : {}),
        ...(dto.paidInstallments !== undefined
          ? { paidInstallments: dto.paidInstallments - recordedPaymentCount }
          : {}),
        ...(dto.startDate !== undefined
          ? { startDate: new Date(dto.startDate) }
          : {}),
        ...(dto.salaryIncomeId !== undefined
          ? { salaryIncomeId: dto.salaryIncomeId }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
      include: {
        salaryIncome: { include: { job: true } },
        _count: { select: { expenses: true } },
      },
    });
    return this.withComputed(installment);
  }

  /** Record one paid installment and its matching expense atomically. */
  async pay(userId: string, id: string, dto: PayInstallmentDto) {
    await this.assertCategoryUsable(userId, dto.categoryId);
    const salary = await this.resolveSalary(userId, dto.salaryIncomeId);

    return this.prisma.$transaction(async (tx) => {
      const installment = await tx.installment.findFirst({
        where: { id, userId },
        include: { _count: { select: { expenses: true } } },
      });
      if (!installment) throw new NotFoundException('Installment not found');
      const paidInstallments =
        installment.paidInstallments + installment._count.expenses;
      if (paidInstallments >= installment.totalInstallments) {
        throw new BadRequestException('Installment is already fully paid');
      }

      const remaining = Math.max(
        Number(installment.totalPrice) -
          Number(installment.downPayment) -
          paidInstallments * Number(installment.monthlyAmount),
        0,
      );
      const amount = Math.min(Number(installment.monthlyAmount), remaining);
      if (amount <= 0) {
        throw new BadRequestException('Installment is already fully paid');
      }

      const expense = await tx.expense.create({
        data: {
          userId,
          amount,
          date: new Date(dto.date),
          categoryId: dto.categoryId,
          paymentMethod: dto.paymentMethod,
          description: installment.name,
          salaryIncomeId: salary.id,
          installmentId: installment.id,
        },
        include: {
          category: true,
          salaryIncome: { include: { job: true } },
        },
      });

      return {
        installment: this.withComputed({
          ...installment,
          _count: { expenses: installment._count.expenses + 1 },
        }),
        expense,
      };
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwn(userId, id);
    await this.prisma.installment.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
