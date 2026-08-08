import type { AuthUser } from '../common/decorators/current-user.decorator';
import { AssignExpensesSalaryDto, CreateExpenseDto, ListExpensesQueryDto, UpdateExpenseDto } from './dto/expense.dto';
import { ExpensesService } from './expenses.service';
export declare class ExpensesController {
    private expenses;
    constructor(expenses: ExpensesService);
    list(user: AuthUser, query: ListExpensesQueryDto): import("@prisma/client").Prisma.PrismaPromise<({
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
    create(user: AuthUser, dto: CreateExpenseDto): Promise<{
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
    assignSalary(user: AuthUser, dto: AssignExpensesSalaryDto): Promise<{
        assigned: number;
    }>;
    update(user: AuthUser, id: string, dto: UpdateExpenseDto): Promise<{
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
    remove(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
}
