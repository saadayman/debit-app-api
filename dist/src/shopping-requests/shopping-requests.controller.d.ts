import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateShoppingRequestDto, ListShoppingRequestsQueryDto, PurchaseShoppingRequestDto } from './dto/shopping-request.dto';
import { ShoppingRequestsService } from './shopping-requests.service';
export declare class ShoppingRequestsController {
    private requests;
    constructor(requests: ShoppingRequestsService);
    list(user: AuthUser, query: ListShoppingRequestsQueryDto): Promise<({
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
    create(user: AuthUser, dto: CreateShoppingRequestDto): Promise<{
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
    purchase(user: AuthUser, id: string, dto: PurchaseShoppingRequestDto): Promise<{
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
    reject(user: AuthUser, id: string): Promise<{
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
    remove(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
}
