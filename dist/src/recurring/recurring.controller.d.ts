import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateRecurringPaymentDto, UpdateRecurringPaymentDto } from './dto/recurring.dto';
import { RecurringService } from './recurring.service';
export declare class RecurringController {
    private recurring;
    constructor(recurring: RecurringService);
    list(user: AuthUser): import("@prisma/client").Prisma.PrismaPromise<({
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
    create(user: AuthUser, dto: CreateRecurringPaymentDto): Promise<{
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
    generate(user: AuthUser): Promise<{
        generated: number;
    }>;
    approvals(user: AuthUser): Promise<({
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
    approve(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
    removeApproval(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
    update(user: AuthUser, id: string, dto: UpdateRecurringPaymentDto): Promise<{
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
    remove(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
}
