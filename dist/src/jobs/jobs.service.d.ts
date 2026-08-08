import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
export declare function nextPayday(payDayOfMonth: number, from?: Date): Date;
export declare class JobsService {
    private prisma;
    constructor(prisma: PrismaService);
    private withComputed;
    list(userId: string): Promise<{
        scheduled: boolean;
        nextPayday: string | null;
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.JobType;
        employer: string | null;
        expectedAmount: import("@prisma/client/runtime/library").Decimal | null;
        payDayOfMonth: number | null;
        active: boolean;
        notes: string | null;
    }[]>;
    create(userId: string, dto: CreateJobDto): Promise<{
        scheduled: boolean;
        nextPayday: string | null;
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.JobType;
        employer: string | null;
        expectedAmount: import("@prisma/client/runtime/library").Decimal | null;
        payDayOfMonth: number | null;
        active: boolean;
        notes: string | null;
    }>;
    private findOwn;
    update(userId: string, id: string, dto: UpdateJobDto): Promise<{
        scheduled: boolean;
        nextPayday: string | null;
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.JobType;
        employer: string | null;
        expectedAmount: import("@prisma/client/runtime/library").Decimal | null;
        payDayOfMonth: number | null;
        active: boolean;
        notes: string | null;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
