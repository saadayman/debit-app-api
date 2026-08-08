import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { differenceInCalendarDays, endOfMonth, startOfMonth } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBudgetDto,
  ListBudgetsQueryDto,
  UpdateBudgetDto,
} from './dto/budget.dto';

export function monthToDate(month: string): Date {
  // YYYY-MM → first day of that month (UTC)
  return new Date(`${month}-01T00:00:00.000Z`);
}

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  /** Budgets for a month with spent/remaining computed from expenses. */
  async list(userId: string, query: ListBudgetsQueryDto) {
    const monthStart = query.month
      ? monthToDate(query.month)
      : startOfMonth(new Date());
    const monthEnd = endOfMonth(monthStart);

    const [budgets, spentByCategory] = await Promise.all([
      this.prisma.budget.findMany({
        where: { userId, month: monthStart },
        include: { category: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.expense.groupBy({
        by: ['categoryId'],
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
    ]);

    const totalSpent = spentByCategory.reduce(
      (s, g) => s + Number(g._sum.amount ?? 0),
      0,
    );
    const today = new Date();
    const daysLeft = Math.max(differenceInCalendarDays(monthEnd, today) + 1, 1);

    return budgets.map((b) => {
      const spent = b.categoryId
        ? Number(
            spentByCategory.find((g) => g.categoryId === b.categoryId)?._sum
              .amount ?? 0,
          )
        : totalSpent;
      const amount = Number(b.amount);
      const remaining = amount - spent;
      return {
        ...b,
        spent,
        remaining,
        percentUsed: amount > 0 ? (spent / amount) * 100 : 0,
        overspent: spent > amount,
        dailyLimit: remaining > 0 ? remaining / daysLeft : 0,
      };
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

  async create(userId: string, dto: CreateBudgetDto) {
    if (dto.categoryId) await this.assertCategoryUsable(userId, dto.categoryId);
    const month = monthToDate(dto.month);
    // Postgres unique constraints treat NULLs as distinct, so guard the
    // overall (categoryId = null) budget manually.
    if (!dto.categoryId) {
      const existing = await this.prisma.budget.findFirst({
        where: { userId, month, categoryId: null },
      });
      if (existing) {
        throw new ConflictException('Overall budget already set for this month');
      }
    }
    try {
      return await this.prisma.budget.create({
        data: {
          userId,
          month,
          amount: dto.amount,
          categoryId: dto.categoryId ?? null,
        },
        include: { category: true },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          'A budget for this category and month already exists',
        );
      }
      throw e;
    }
  }

  private async findOwn(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    await this.findOwn(userId, id);
    return this.prisma.budget.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.month !== undefined ? { month: monthToDate(dto.month) } : {}),
      },
      include: { category: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwn(userId, id);
    await this.prisma.budget.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
