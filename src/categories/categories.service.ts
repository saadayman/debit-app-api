import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    const member = await this.prisma.householdMember.findUnique({ where: { userId } });
    const owner = member?.role === 'REQUESTER'
      ? await this.prisma.householdMember.findFirst({ where: { householdId: member.householdId, role: 'OWNER' } })
      : null;
    return this.prisma.category.findMany({
      where: { OR: [{ isDefault: true, userId: null }, { userId: owner?.userId ?? userId }] },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { ...dto, userId, isDefault: false },
    });
  }

  private async findOwn(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) {
      throw new NotFoundException('Category not found or not editable');
    }
    return category;
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOwn(userId, id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOwn(userId, id);
    try {
      await this.prisma.category.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new ConflictException(
          'Category is in use by expenses or recurring payments',
        );
      }
      throw e;
    }
    return { message: 'Deleted' };
  }
}
