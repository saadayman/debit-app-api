import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    get(userId: string): Prisma.Prisma__SettingsClient<{
        id: string;
        userId: string;
        updatedAt: Date;
        currency: string;
        locale: string;
        theme: string;
        dateFormat: string;
        privacyMode: Prisma.JsonValue;
        monthlyReportEmail: boolean;
        monthlyReportDay: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    update(userId: string, dto: UpdateSettingsDto): Prisma.Prisma__SettingsClient<{
        id: string;
        userId: string;
        updatedAt: Date;
        currency: string;
        locale: string;
        theme: string;
        dateFormat: string;
        privacyMode: Prisma.JsonValue;
        monthlyReportEmail: boolean;
        monthlyReportDay: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
}
