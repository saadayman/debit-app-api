import { Injectable, NotFoundException } from '@nestjs/common';
import { Debt, DebtDirection, DebtPayment } from '@prisma/client';
import { addMonths } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDebtDto,
  CreateDebtPaymentDto,
  UpdateDebtDto,
  UpdateDebtPaymentDto,
} from './dto/debt.dto';

type DebtWithPayments = Debt & { payments: DebtPayment[] };

@Injectable()
export class DebtsService {
  constructor(private prisma: PrismaService) {}

  /** All progress numbers are derived from payments — never stored. */
  private withComputed(debt: DebtWithPayments) {
    const original = Number(debt.originalAmount);
    const totalPaid = debt.payments.reduce((s, p) => s + Number(p.amount), 0);
    const remaining = Math.max(original - totalPaid, 0);
    // Money lent to a person often has no agreed monthly payment, so there is
    // nothing to project a payoff date from.
    const monthly =
      debt.monthlyPayment != null ? Number(debt.monthlyPayment) : 0;
    const scheduled = monthly > 0;
    const remainingMonths =
      remaining > 0 && scheduled ? Math.ceil(remaining / monthly) : 0;
    return {
      ...debt,
      totalPaid,
      remaining,
      percentPaid:
        original > 0 ? Math.min((totalPaid / original) * 100, 100) : 0,
      scheduled,
      remainingMonths,
      estimatedPayoffDate:
        remaining > 0 && scheduled
          ? addMonths(new Date(), remainingMonths)
          : null,
      isPaidOff: remaining <= 0,
    };
  }

  async list(userId: string, direction?: DebtDirection) {
    const debts = await this.prisma.debt.findMany({
      where: { userId, ...(direction ? { direction } : {}) },
      include: { payments: { orderBy: { date: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return debts.map((d) => this.withComputed(d));
  }

  async getOne(userId: string, id: string) {
    const debt = await this.prisma.debt.findFirst({
      where: { id, userId },
      include: { payments: { orderBy: { date: 'desc' } } },
    });
    if (!debt) throw new NotFoundException('Debt not found');
    return this.withComputed(debt);
  }

  async create(userId: string, dto: CreateDebtDto) {
    const debt = await this.prisma.debt.create({
      data: {
        userId,
        name: dto.name,
        direction: dto.direction ?? 'OWED_BY_ME',
        type: dto.type,
        originalAmount: dto.originalAmount,
        interestRate: dto.interestRate ?? 0,
        monthlyPayment: dto.monthlyPayment ?? null,
        startDate: new Date(dto.startDate),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        counterparty: dto.counterparty,
        notes: dto.notes,
      },
      include: { payments: true },
    });
    return this.withComputed(debt);
  }

  async update(userId: string, id: string, dto: UpdateDebtDto) {
    await this.getOne(userId, id);
    const debt = await this.prisma.debt.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.direction !== undefined ? { direction: dto.direction } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.originalAmount !== undefined
          ? { originalAmount: dto.originalAmount }
          : {}),
        ...(dto.interestRate !== undefined
          ? { interestRate: dto.interestRate }
          : {}),
        // An empty monthly payment clears the schedule.
        ...(dto.monthlyPayment !== undefined
          ? { monthlyPayment: dto.monthlyPayment ?? null }
          : {}),
        ...(dto.startDate !== undefined
          ? { startDate: new Date(dto.startDate) }
          : {}),
        ...(dto.dueDate !== undefined
          ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }
          : {}),
        ...(dto.counterparty !== undefined
          ? { counterparty: dto.counterparty }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
      include: { payments: { orderBy: { date: 'desc' } } },
    });
    return this.withComputed(debt);
  }

  async remove(userId: string, id: string) {
    const debt = await this.getOne(userId, id);
    const repaymentIncomeIds = debt.payments
      .map((payment) => payment.incomeId)
      .filter((incomeId): incomeId is string => incomeId != null);
    const repaymentSavingsIds = debt.payments
      .map((payment) => payment.savingsAssetId)
      .filter((assetId): assetId is string => assetId != null);
    await this.prisma.$transaction(async (tx) => {
      await tx.debt.delete({ where: { id } });
      if (repaymentIncomeIds.length > 0) {
        await tx.income.deleteMany({
          where: { userId, id: { in: repaymentIncomeIds } },
        });
      }
      if (repaymentSavingsIds.length > 0) {
        await tx.savingsAsset.deleteMany({
          where: { userId, id: { in: repaymentSavingsIds } },
        });
      }
    });
    return { message: 'Deleted' };
  }

  async addPayment(userId: string, debtId: string, dto: CreateDebtPaymentDto) {
    const debt = await this.getOne(userId, debtId);
    const paymentDate = new Date(dto.date);
    await this.prisma.$transaction(async (tx) => {
      const income =
        debt.direction === 'OWED_TO_ME'
          ? await tx.income.create({
              data: {
                userId,
                amount: dto.amount,
                date: paymentDate,
                source: 'OTHER',
                description: this.repaymentDescription(debt.name),
                notes: dto.notes,
              },
            })
          : null;
      const savingsAsset =
        debt.direction === 'OWED_TO_ME'
          ? await tx.savingsAsset.create({
              data: {
                userId,
                type: 'CASH',
                name: this.repaymentSavingsName(debt.name),
                amount: dto.amount,
                notes: dto.notes,
              },
            })
          : null;
      await tx.debtPayment.create({
        data: {
          debtId,
          amount: dto.amount,
          date: paymentDate,
          isExtra: dto.isExtra ?? false,
          notes: dto.notes,
          incomeId: income?.id ?? null,
          savingsAssetId: savingsAsset?.id ?? null,
        },
      });
    });
    return this.getOne(userId, debtId);
  }

  private async findOwnPayment(
    userId: string,
    debtId: string,
    paymentId: string,
  ) {
    const payment = await this.prisma.debtPayment.findFirst({
      where: { id: paymentId, debtId, debt: { userId } },
      include: {
        debt: { select: { direction: true, name: true } },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async updatePayment(
    userId: string,
    debtId: string,
    paymentId: string,
    dto: UpdateDebtPaymentDto,
  ) {
    const payment = await this.findOwnPayment(userId, debtId, paymentId);
    const amount = dto.amount ?? Number(payment.amount);
    const date = dto.date ? new Date(dto.date) : payment.date;
    const notes = dto.notes !== undefined ? dto.notes : payment.notes;

    await this.prisma.$transaction(async (tx) => {
      let incomeId = payment.incomeId;
      let savingsAssetId = payment.savingsAssetId;
      if (payment.debt.direction === 'OWED_TO_ME') {
        const incomeData = {
          amount,
          date,
          source: 'OTHER' as const,
          description: this.repaymentDescription(payment.debt.name),
          notes,
        };
        if (incomeId) {
          await tx.income.update({
            where: { id: incomeId },
            data: incomeData,
          });
        } else {
          const income = await tx.income.create({
            data: { userId, ...incomeData },
          });
          incomeId = income.id;
        }
        const savingsData = {
          type: 'CASH' as const,
          name: this.repaymentSavingsName(payment.debt.name),
          amount,
          notes,
        };
        if (savingsAssetId) {
          await tx.savingsAsset.update({
            where: { id: savingsAssetId },
            data: savingsData,
          });
        } else {
          const savingsAsset = await tx.savingsAsset.create({
            data: { userId, ...savingsData },
          });
          savingsAssetId = savingsAsset.id;
        }
      } else {
        if (incomeId) {
          await tx.income.delete({ where: { id: incomeId } });
          incomeId = null;
        }
        if (savingsAssetId) {
          await tx.savingsAsset.delete({ where: { id: savingsAssetId } });
          savingsAssetId = null;
        }
      }

      await tx.debtPayment.update({
        where: { id: paymentId },
        data: {
          ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
          ...(dto.date !== undefined ? { date } : {}),
          ...(dto.isExtra !== undefined ? { isExtra: dto.isExtra } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          incomeId,
          savingsAssetId,
        },
      });
    });
    return this.getOne(userId, debtId);
  }

  async removePayment(userId: string, debtId: string, paymentId: string) {
    const payment = await this.findOwnPayment(userId, debtId, paymentId);
    await this.prisma.$transaction(async (tx) => {
      await tx.debtPayment.delete({ where: { id: paymentId } });
      if (payment.incomeId) {
        await tx.income.delete({ where: { id: payment.incomeId } });
      }
      if (payment.savingsAssetId) {
        await tx.savingsAsset.delete({
          where: { id: payment.savingsAssetId },
        });
      }
    });
    return this.getOne(userId, debtId);
  }

  private repaymentDescription(debtName: string) {
    return `Repayment received: ${debtName}`;
  }

  private repaymentSavingsName(debtName: string) {
    return `Debt repayment: ${debtName}`;
  }
}
