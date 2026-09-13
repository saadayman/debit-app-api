import { PaymentMethod, ShoppingRequestStatus } from '@prisma/client';
export declare class CreateShoppingRequestDto {
    name: string;
    categoryId: string;
    quantity?: string;
    notes?: string;
}
export declare class ListShoppingRequestsQueryDto {
    status?: ShoppingRequestStatus;
    categoryId?: string;
}
export declare class PurchaseShoppingRequestDto {
    amount: number;
    date: string;
    paymentMethod: PaymentMethod;
    salaryIncomeId?: string | null;
}
