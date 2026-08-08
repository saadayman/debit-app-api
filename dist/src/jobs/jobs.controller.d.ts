import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { JobsService } from './jobs.service';
export declare class JobsController {
    private jobs;
    constructor(jobs: JobsService);
    list(user: AuthUser): Promise<{
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
    create(user: AuthUser, dto: CreateJobDto): Promise<{
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
    update(user: AuthUser, id: string, dto: UpdateJobDto): Promise<{
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
    remove(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
}
