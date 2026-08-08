import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssignExpensesSalaryDto,
  CreateExpenseDto,
  ListExpensesQueryDto,
  UpdateExpenseDto,
} from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  /** The user may only reference default categories or their own. */
  private async assertCategoryUsable(userId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ isDefault: true, userId: null }, { userId }],
      },
    });
    if (!category) throw new BadRequestException('Unknown category');
  }

  /** The expense may only be linked to one of this user's salary payments. */
  private async assertSalaryUsable(userId: string, salaryIncomeId: string) {
    const salary = await this.prisma.income.findFirst({
      where: { id: salaryIncomeId, userId, source: 'SALARY' },
    });
    if (!salary) throw new BadRequestException('Unknown salary payment');
  }

  list(userId: string, query: ListExpensesQueryDto) {
    return this.prisma.expense.findMany({
      where: {
        userId,
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
        ...(query.salaryIncomeId === 'unassigned'
          ? { salaryIncomeId: null }
          : query.salaryIncomeId
            ? { salaryIncomeId: query.salaryIncomeId }
            : {}),
        ...(query.search
          ? {
              OR: [
                {
                  description: { contains: query.search, mode: 'insensitive' },
                },
                { notes: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
        date: {
          ...(query.from ? { gte: new Date(query.from) } : {}),
          ...(query.to ? { lte: new Date(query.to) } : {}),
        },
      },
      include: { category: true, salaryIncome: { include: { job: true } } },
      orderBy: { date: 'desc' },
      take: 200,
    });
  }

  async create(userId: string, dto: CreateExpenseDto) {
    await this.assertCategoryUsable(userId, dto.categoryId);
    if (dto.salaryIncomeId) {
      await this.assertSalaryUsable(userId, dto.salaryIncomeId);
    }
    return this.prisma.expense.create({
      data: {
        userId,
        amount: dto.amount,
        date: new Date(dto.date),
        categoryId: dto.categoryId,
        paymentMethod: dto.paymentMethod,
        description: dto.description,
        notes: dto.notes,
        salaryIncomeId: dto.salaryIncomeId ?? null,
      },
      include: { category: true, salaryIncome: { include: { job: true } } },
    });
  }

  /** Attach a selected set of currently unassigned expenses to one salary. */
  async assignSalary(userId: string, dto: AssignExpensesSalaryDto) {
    await this.assertSalaryUsable(userId, dto.salaryIncomeId);
    const result = await this.prisma.expense.updateMany({
      where: {
        userId,
        id: { in: dto.expenseIds },
        salaryIncomeId: null,
      },
      data: { salaryIncomeId: dto.salaryIncomeId },
    });
    return { assigned: result.count };
  }

  private async findOwn(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    await this.findOwn(userId, id);
    if (dto.categoryId) await this.assertCategoryUsable(userId, dto.categoryId);
    if (dto.salaryIncomeId) {
      await this.assertSalaryUsable(userId, dto.salaryIncomeId);
    }
    return this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.date !== undefined ? { date: new Date(dto.date) } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.paymentMethod !== undefined
          ? { paymentMethod: dto.paymentMethod }
          : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.salaryIncomeId !== undefined
          ? { salaryIncomeId: dto.salaryIncomeId || null }
          : {}),
      },
      include: { category: true, salaryIncome: { include: { job: true } } },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwn(userId, id);
    // Installment progress is derived from linked expense rows, so deleting
    // the expense automatically reduces the computed paid count.
    await this.prisma.expense.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
