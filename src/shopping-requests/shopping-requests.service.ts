import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateShoppingRequestDto,
  ListShoppingRequestsQueryDto,
  PurchaseShoppingRequestDto,
} from './dto/shopping-request.dto';

@Injectable()
export class ShoppingRequestsService {
  constructor(private prisma: PrismaService) {}

  private async membership(userId: string) {
    const member = await this.prisma.householdMember.findUnique({ where: { userId } });
    if (!member) throw new ForbiddenException('Household membership required');
    return member;
  }

  private async assertCategoryUsable(userId: string, categoryId: string) {
    const member = await this.membership(userId);
    const owner = member.role === 'REQUESTER'
      ? await this.prisma.householdMember.findFirst({ where: { householdId: member.householdId, role: 'OWNER' } })
      : null;
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ isDefault: true, userId: null }, { userId: owner?.userId ?? userId }],
      },
    });
    if (!category) throw new BadRequestException('Unknown category');
  }

  private async findPending(userId: string, id: string) {
    const member = await this.membership(userId);
    const request = await this.prisma.shoppingRequest.findFirst({
      where: { id, householdId: member.householdId, ...(member.role === 'REQUESTER' ? { userId } : {}) },
    });
    if (!request) throw new NotFoundException('Shopping request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Shopping request is already resolved');
    }
    return request;
  }

  list(userId: string, query: ListShoppingRequestsQueryDto) {
    return this.membership(userId).then((member) => this.prisma.shoppingRequest.findMany({
      where: {
        householdId: member.householdId,
        ...(member.role === 'REQUESTER' ? { userId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      },
      include: { category: true, expense: member.role === 'OWNER' },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    }));
  }

  async create(userId: string, dto: CreateShoppingRequestDto) {
    const member = await this.membership(userId);
    await this.assertCategoryUsable(userId, dto.categoryId);
    return this.prisma.shoppingRequest.create({
      data: { userId, householdId: member.householdId, ...dto },
      include: { category: true, expense: true },
    });
  }

  async purchase(userId: string, id: string, dto: PurchaseShoppingRequestDto) {
    const member = await this.membership(userId);
    if (member.role !== 'OWNER') throw new ForbiddenException('Only the household owner can approve purchases');
    const request = await this.findPending(userId, id);
    if (dto.salaryIncomeId) {
      const salary = await this.prisma.income.findFirst({
        where: { id: dto.salaryIncomeId, userId, source: 'SALARY' },
      });
      if (!salary) throw new BadRequestException('Unknown salary payment');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.shoppingRequest.updateMany({
        where: { id, userId, status: 'PENDING' },
        data: { status: 'PURCHASED', resolvedAt: new Date() },
      });
      if (updated.count !== 1) {
        throw new BadRequestException('Shopping request is already resolved');
      }
      const expense = await tx.expense.create({
        data: {
          userId,
          amount: dto.amount,
          date: new Date(dto.date),
          categoryId: request.categoryId,
          paymentMethod: dto.paymentMethod,
          description: request.name,
          notes: request.notes,
          salaryIncomeId: dto.salaryIncomeId || null,
        },
      });
      return tx.shoppingRequest.update({
        where: { id },
        data: { expenseId: expense.id },
        include: { category: true, expense: true },
      });
    });
  }

  async reject(userId: string, id: string) {
    const member = await this.membership(userId);
    if (member.role !== 'OWNER') throw new ForbiddenException('Only the household owner can reject requests');
    await this.findPending(userId, id);
    return this.prisma.shoppingRequest.update({
      where: { id },
      data: { status: 'REJECTED', resolvedAt: new Date() },
      include: { category: true, expense: true },
    });
  }

  async remove(userId: string, id: string) {
    const member = await this.membership(userId);
    const request = await this.prisma.shoppingRequest.findFirst({
      where: { id, householdId: member.householdId, ...(member.role === 'REQUESTER' ? { userId, status: 'PENDING' } : {}) },
    });
    if (!request) throw new NotFoundException('Shopping request not found');
    await this.prisma.shoppingRequest.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
