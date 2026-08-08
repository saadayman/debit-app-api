import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeDto, ListIncomeQueryDto, UpdateIncomeDto } from './dto/income.dto';
export declare class IncomeService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertJobUsable;
    list(userId: string, query: ListIncomeQueryDto): import("@prisma/client").Prisma.PrismaPromise<({
        job: {
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
        } | null;
        debtRepayment: {
            id: string;
            debtId: string;
        } | null;
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        source: import("@prisma/client").$Enums.IncomeSource;
        description: string | null;
        jobId: string | null;
    })[]>;
    create(userId: string, dto: CreateIncomeDto): Promise<{
        job: {
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
        } | null;
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        source: import("@prisma/client").$Enums.IncomeSource;
        description: string | null;
        jobId: string | null;
    }>;
    private findOwn;
    update(userId: string, id: string, dto: UpdateIncomeDto): Promise<{
        job: {
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
        } | null;
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        source: import("@prisma/client").$Enums.IncomeSource;
        description: string | null;
        jobId: string | null;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
