import { PrismaService } from '../prisma/prisma.service';
import { CreateShoppingRequestDto, ListShoppingRequestsQueryDto, PurchaseShoppingRequestDto } from './dto/shopping-request.dto';
export declare class ShoppingRequestsService {
    private prisma;
    constructor(prisma: PrismaService);
    private membership;
    private assertCategoryUsable;
    private findPending;
    list(userId: string, query: ListShoppingRequestsQueryDto): Promise<({
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
        expense: {
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
        } | null;
    } & {
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        categoryId: string;
        quantity: string | null;
        status: import("@prisma/client").$Enums.ShoppingRequestStatus;
        householdId: string;
        expenseId: string | null;
        resolvedAt: Date | null;
    })[]>;
    create(userId: string, dto: CreateShoppingRequestDto): Promise<{
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
        expense: {
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
        } | null;
    } & {
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        categoryId: string;
        quantity: string | null;
        status: import("@prisma/client").$Enums.ShoppingRequestStatus;
        householdId: string;
        expenseId: string | null;
        resolvedAt: Date | null;
    }>;
    purchase(userId: string, id: string, dto: PurchaseShoppingRequestDto): Promise<{
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
        expense: {
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
        } | null;
    } & {
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        categoryId: string;
        quantity: string | null;
        status: import("@prisma/client").$Enums.ShoppingRequestStatus;
        householdId: string;
        expenseId: string | null;
        resolvedAt: Date | null;
    }>;
    reject(userId: string, id: string): Promise<{
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
        expense: {
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
        } | null;
    } & {
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        categoryId: string;
        quantity: string | null;
        status: import("@prisma/client").$Enums.ShoppingRequestStatus;
        householdId: string;
        expenseId: string | null;
        resolvedAt: Date | null;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
