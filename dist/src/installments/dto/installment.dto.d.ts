import { PaymentMethod } from '@prisma/client';
export declare class CreateInstallmentDto {
    name: string;
    totalPrice: number;
    downPayment?: number;
    monthlyAmount: number;
    totalInstallments: number;
    paidInstallments?: number;
    startDate: string;
    salaryIncomeId?: string;
    notes?: string;
}
declare const UpdateInstallmentDto_base: import("@nestjs/common").Type<Partial<CreateInstallmentDto>>;
export declare class UpdateInstallmentDto extends UpdateInstallmentDto_base {
}
export declare class PayInstallmentDto {
    date: string;
    categoryId: string;
    paymentMethod: PaymentMethod;
    salaryIncomeId?: string | null;
}
export {};
