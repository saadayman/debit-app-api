import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateIncomeDto,
  ListIncomeQueryDto,
  UpdateIncomeDto,
} from './dto/income.dto';

@Injectable()
export class IncomeService {
  constructor(private prisma: PrismaService) {}

  /** The user may only attribute income to one of their own jobs. */
  private async assertJobUsable(userId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, userId },
    });
    if (!job) throw new BadRequestException('Unknown job');
  }

  list(userId: string, query: ListIncomeQueryDto) {
    return this.prisma.income.findMany({
      where: {
        userId,
        ...(query.source ? { source: query.source } : {}),
        date: {
          ...(query.from ? { gte: new Date(query.from) } : {}),
          ...(query.to ? { lte: new Date(query.to) } : {}),
        },
      },
      include: {
        job: true,
        debtRepayment: { select: { id: true, debtId: true } },
      },
      orderBy: { date: 'desc' },
      take: 200,
    });
  }

  async create(userId: string, dto: CreateIncomeDto) {
    if (dto.jobId) await this.assertJobUsable(userId, dto.jobId);
    return this.prisma.income.create({
      data: {
        userId,
        amount: dto.amount,
        date: new Date(dto.date),
        source: dto.source,
        jobId: dto.jobId ?? null,
        description: dto.description,
        notes: dto.notes,
      },
      include: { job: true },
    });
  }

  private async findOwn(userId: string, id: string) {
    const income = await this.prisma.income.findFirst({
      where: { id, userId },
      include: { debtRepayment: { select: { id: true, debtId: true } } },
    });
    if (!income) throw new NotFoundException('Income not found');
    return income;
  }

  async update(userId: string, id: string, dto: UpdateIncomeDto) {
    const income = await this.findOwn(userId, id);
    if (income.debtRepayment) {
      throw new BadRequestException(
        'Edit this received repayment from its debt record.',
      );
    }
    if (dto.jobId) await this.assertJobUsable(userId, dto.jobId);
    return this.prisma.income.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.date !== undefined ? { date: new Date(dto.date) } : {}),
        ...(dto.source !== undefined ? { source: dto.source } : {}),
        ...(dto.jobId !== undefined ? { jobId: dto.jobId || null } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
      include: { job: true },
    });
  }

  async remove(userId: string, id: string) {
    const income = await this.findOwn(userId, id);
    if (income.debtRepayment) {
      throw new BadRequestException(
        'Delete this received repayment from its debt record.',
      );
    }
    await this.prisma.income.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
