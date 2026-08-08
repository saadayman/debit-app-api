import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringPaymentDto, UpdateRecurringPaymentDto } from './dto/recurring.dto';
export declare class RecurringService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    list(userId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    } & {
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        frequency: import("@prisma/client").$Enums.Frequency;
        intervalCount: number;
        nextDueDate: Date;
        categoryId: string;
    })[]>;
    private assertCategoryUsable;
    create(userId: string, dto: CreateRecurringPaymentDto): Promise<{
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
    } & {
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        frequency: import("@prisma/client").$Enums.Frequency;
        intervalCount: number;
        nextDueDate: Date;
        categoryId: string;
    }>;
    private findOwn;
    update(userId: string, id: string, dto: UpdateRecurringPaymentDto): Promise<{
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
    } & {
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        frequency: import("@prisma/client").$Enums.Frequency;
        intervalCount: number;
        nextDueDate: Date;
        categoryId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    generateDueExpenses(userId?: string): Promise<{
        generated: number;
    }>;
    private materialize;
    listApprovals(userId: string, status?: 'PENDING' | 'APPROVED' | 'REMOVED'): Promise<({
        recurringPayment: {
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
        } & {
            id: string;
            name: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            frequency: import("@prisma/client").$Enums.Frequency;
            intervalCount: number;
            nextDueDate: Date;
            categoryId: string;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        recurringPaymentId: string;
        status: import("@prisma/client").$Enums.RecurringApprovalStatus;
    })[]>;
    approve(userId: string, id: string): Promise<{
        message: string;
    }>;
    removeApproval(userId: string, id: string): Promise<{
        message: string;
    }>;
    nightlyGeneration(): Promise<void>;
}
