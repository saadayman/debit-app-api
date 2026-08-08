import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Frequency, RecurringPayment } from '@prisma/client';
import { addDays, addMonths, addWeeks, addYears } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRecurringPaymentDto,
  UpdateRecurringPaymentDto,
} from './dto/recurring.dto';

function advance(date: Date, frequency: Frequency, interval: number): Date {
  switch (frequency) {
    case 'DAILY':
      return addDays(date, interval);
    case 'WEEKLY':
      return addWeeks(date, interval);
    case 'MONTHLY':
      return addMonths(date, interval);
    case 'YEARLY':
      return addYears(date, interval);
  }
}

@Injectable()
export class RecurringService {
  private readonly logger = new Logger(RecurringService.name);

  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.recurringPayment.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { nextDueDate: 'asc' },
    });
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

  async create(userId: string, dto: CreateRecurringPaymentDto) {
    await this.assertCategoryUsable(userId, dto.categoryId);
    return this.prisma.recurringPayment.create({
      data: {
        userId,
        name: dto.name,
        amount: dto.amount,
        categoryId: dto.categoryId,
        paymentMethod: dto.paymentMethod,
        frequency: dto.frequency,
        intervalCount: dto.intervalCount ?? 1,
        nextDueDate: new Date(dto.nextDueDate),
        active: dto.active ?? true,
        notes: dto.notes,
      },
      include: { category: true },
    });
  }

  private async findOwn(userId: string, id: string) {
    const item = await this.prisma.recurringPayment.findFirst({
      where: { id, userId },
    });
    if (!item) throw new NotFoundException('Recurring payment not found');
    return item;
  }

  async update(userId: string, id: string, dto: UpdateRecurringPaymentDto) {
    await this.findOwn(userId, id);
    if (dto.categoryId) await this.assertCategoryUsable(userId, dto.categoryId);
    return this.prisma.recurringPayment.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.paymentMethod !== undefined
          ? { paymentMethod: dto.paymentMethod }
          : {}),
        ...(dto.frequency !== undefined ? { frequency: dto.frequency } : {}),
        ...(dto.intervalCount !== undefined
          ? { intervalCount: dto.intervalCount }
          : {}),
        ...(dto.nextDueDate !== undefined
          ? { nextDueDate: new Date(dto.nextDueDate) }
          : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
      include: { category: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwn(userId, id);
    await this.prisma.recurringPayment.delete({ where: { id } });
    return { message: 'Deleted' };
  }

  /**
   * Materialize expenses for every due occurrence of a recurring payment
   * and advance nextDueDate past today. Safe to call repeatedly.
   */
  async generateDueExpenses(userId?: string) {
    const now = new Date();
    const due = await this.prisma.recurringPayment.findMany({
      where: {
        active: true,
        nextDueDate: { lte: now },
        ...(userId ? { userId } : {}),
      },
    });
    let generated = 0;
    for (const rp of due) {
      generated += await this.materialize(rp, now);
    }
    return { generated };
  }

  private async materialize(rp: RecurringPayment, now: Date) {
    let next = rp.nextDueDate;
    let count = 0;
    // Cap the catch-up window to avoid runaway loops on bad data.
    while (next <= now && count < 100) {
      await this.prisma.$transaction(async (tx) => {
        const alreadyApproval = await tx.recurringApproval.findFirst({
          where: { recurringPaymentId: rp.id, date: next },
        });
        if (!alreadyApproval) {
          await tx.recurringApproval.create({
            data: {
              recurringPaymentId: rp.id,
              userId: rp.userId,
              date: next,
              amount: rp.amount,
            },
          });
        }
        const advanced = advance(next, rp.frequency, rp.intervalCount);
        await tx.recurringPayment.update({
          where: { id: rp.id },
          data: { nextDueDate: advanced },
        });
      });
      next = advance(next, rp.frequency, rp.intervalCount);
      count++;
    }
    return count;
  }

  async listApprovals(userId: string, status?: 'PENDING' | 'APPROVED' | 'REMOVED') {
    return this.prisma.recurringApproval.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      include: { recurringPayment: { include: { category: true } } },
      orderBy: { date: 'asc' },
    });
  }

  async approve(userId: string, id: string) {
    const ap = await this.prisma.recurringApproval.findFirst({ where: { id }, include: { recurringPayment: true } });
    if (!ap || ap.userId !== userId) throw new NotFoundException('Not found');
    if (ap.status !== 'PENDING') throw new BadRequestException('Already handled');

    await this.prisma.$transaction(async (tx) => {
      await tx.expense.create({
        data: {
          userId: ap.userId,
          amount: ap.amount,
          date: ap.date,
          categoryId: ap.recurringPayment?.categoryId ?? undefined,
          paymentMethod: ap.recurringPayment?.paymentMethod ?? undefined,
          description: ap.recurringPayment?.name ?? null,
          recurringPaymentId: ap.recurringPaymentId,
        },
      });

      await tx.recurringApproval.update({
        where: { id },
        data: { status: 'APPROVED' },
      });
    });

    return { message: 'Approved' };
  }

  async removeApproval(userId: string, id: string) {
    const ap = await this.prisma.recurringApproval.findFirst({ where: { id } });
    if (!ap || ap.userId !== userId) throw new NotFoundException('Not found');
    if (ap.status !== 'PENDING') throw new BadRequestException('Already handled');
    await this.prisma.recurringApproval.update({ where: { id }, data: { status: 'REMOVED' } });
    return { message: 'Removed' };
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async nightlyGeneration() {
    const { generated } = await this.generateDueExpenses();
    if (generated > 0) {
      this.logger.log(`Generated ${generated} expenses from recurring payments`);
    }
  }
}
