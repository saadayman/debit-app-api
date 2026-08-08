import type { AuthUser } from '../common/decorators/current-user.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';
export declare class SettingsController {
    private settings;
    constructor(settings: SettingsService);
    get(user: AuthUser): import("@prisma/client").Prisma.Prisma__SettingsClient<{
        id: string;
        userId: string;
        updatedAt: Date;
        currency: string;
        locale: string;
        theme: string;
        dateFormat: string;
        privacyMode: import("@prisma/client/runtime/library").JsonValue;
        monthlyReportEmail: boolean;
        monthlyReportDay: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(user: AuthUser, dto: UpdateSettingsDto): import("@prisma/client").Prisma.Prisma__SettingsClient<{
        id: string;
        userId: string;
        updatedAt: Date;
        currency: string;
        locale: string;
        theme: string;
        dateFormat: string;
        privacyMode: import("@prisma/client/runtime/library").JsonValue;
        monthlyReportEmail: boolean;
        monthlyReportDay: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
