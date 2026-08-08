import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  get(userId: string) {
    return this.prisma.settings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  update(userId: string, dto: UpdateSettingsDto) {
    const data = {
      ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
      ...(dto.locale !== undefined ? { locale: dto.locale } : {}),
      ...(dto.theme !== undefined ? { theme: dto.theme } : {}),
      ...(dto.dateFormat !== undefined ? { dateFormat: dto.dateFormat } : {}),
      ...(dto.privacyMode !== undefined
        ? { privacyMode: dto.privacyMode as Prisma.InputJsonValue }
        : {}),
      ...(dto.monthlyReportEmail !== undefined
        ? { monthlyReportEmail: dto.monthlyReportEmail }
        : {}),
      ...(dto.monthlyReportDay !== undefined
        ? { monthlyReportDay: dto.monthlyReportDay }
        : {}),
    };
    return this.prisma.settings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
