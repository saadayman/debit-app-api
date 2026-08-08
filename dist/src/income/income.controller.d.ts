import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateIncomeDto, ListIncomeQueryDto, UpdateIncomeDto } from './dto/income.dto';
import { IncomeService } from './income.service';
export declare class IncomeController {
    private income;
    constructor(income: IncomeService);
    list(user: AuthUser, query: ListIncomeQueryDto): import("@prisma/client").Prisma.PrismaPromise<({
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
    create(user: AuthUser, dto: CreateIncomeDto): Promise<{
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
    update(user: AuthUser, id: string, dto: UpdateIncomeDto): Promise<{
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
    remove(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
}
