import { PrismaService } from '../prisma/prisma.service';
import { AssignExpensesSalaryDto, CreateExpenseDto, ListExpensesQueryDto, UpdateExpenseDto } from './dto/expense.dto';
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertCategoryUsable;
    private assertSalaryUsable;
    list(userId: string, query: ListExpensesQueryDto): import("@prisma/client").Prisma.PrismaPromise<({
        category: {
            id: string;
            name: string;
            nameAr: string | null;
            icon: string | null;
            color: string | null;
            isDefault: boolean;
            userId: string | null;
            createdAt: Date;
        };
        salaryIncome: ({
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
        }) | null;
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        description: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        categoryId: string;
        salaryIncomeId: string | null;
        installmentId: string | null;
        recurringPaymentId: string | null;
    })[]>;
    create(userId: string, dto: CreateExpenseDto): Promise<{
        category: {
            id: string;
            name: string;
            nameAr: string | null;
            icon: string | null;
            color: string | null;
            isDefault: boolean;
            userId: string | null;
            createdAt: Date;
        };
        salaryIncome: ({
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
        }) | null;
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        description: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        categoryId: string;
        salaryIncomeId: string | null;
        installmentId: string | null;
        recurringPaymentId: string | null;
    }>;
    assignSalary(userId: string, dto: AssignExpensesSalaryDto): Promise<{
        assigned: number;
    }>;
    private findOwn;
    update(userId: string, id: string, dto: UpdateExpenseDto): Promise<{
        category: {
            id: string;
            name: string;
            nameAr: string | null;
            icon: string | null;
            color: string | null;
            isDefault: boolean;
            userId: string | null;
            createdAt: Date;
        };
        salaryIncome: ({
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
        }) | null;
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        description: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        categoryId: string;
        salaryIncomeId: string | null;
        installmentId: string | null;
        recurringPaymentId: string | null;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
