import { Injectable, NotFoundException } from '@nestjs/common';
import { Job } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';

/**
 * Next occurrence of a monthly pay day, as a UTC date.
 * Days beyond the month's length clamp to the last day (e.g. 31 in February).
 */
export function nextPayday(payDayOfMonth: number, from = new Date()): Date {
  const year = from.getUTCFullYear();
  const month = from.getUTCMonth();
  const today = from.getUTCDate();

  const clampedThis = Math.min(
    payDayOfMonth,
    new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
  );
  if (today <= clampedThis) {
    return new Date(Date.UTC(year, month, clampedThis));
  }
  const clampedNext = Math.min(
    payDayOfMonth,
    new Date(Date.UTC(year, month + 2, 0)).getUTCDate(),
  );
  return new Date(Date.UTC(year, month + 1, clampedNext));
}

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  private withComputed(job: Job) {
    const scheduled = job.payDayOfMonth != null;
    const next = scheduled && job.active ? nextPayday(job.payDayOfMonth!) : null;
    return {
      ...job,
      /** false for freelance-style jobs where you pick the date per payment */
      scheduled,
      nextPayday: next ? next.toISOString() : null,
    };
  }

  async list(userId: string) {
    const jobs = await this.prisma.job.findMany({
      where: { userId },
      orderBy: [{ active: 'desc' }, { createdAt: 'asc' }],
    });
    return jobs.map((j) => this.withComputed(j));
  }

  async create(userId: string, dto: CreateJobDto) {
    const job = await this.prisma.job.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        employer: dto.employer,
        expectedAmount: dto.expectedAmount ?? null,
        payDayOfMonth: dto.payDayOfMonth ?? null,
        active: dto.active ?? true,
        notes: dto.notes,
      },
    });
    return this.withComputed(job);
  }

  private async findOwn(userId: string, id: string) {
    const job = await this.prisma.job.findFirst({ where: { id, userId } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async update(userId: string, id: string, dto: UpdateJobDto) {
    await this.findOwn(userId, id);
    const job = await this.prisma.job.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.employer !== undefined ? { employer: dto.employer } : {}),
        ...(dto.expectedAmount !== undefined
          ? { expectedAmount: dto.expectedAmount }
          : {}),
        ...(dto.payDayOfMonth !== undefined
          ? { payDayOfMonth: dto.payDayOfMonth }
          : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });
    return this.withComputed(job);
  }

  async remove(userId: string, id: string) {
    await this.findOwn(userId, id);
    // Income rows keep their history; their jobId is nulled by the schema.
    await this.prisma.job.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
