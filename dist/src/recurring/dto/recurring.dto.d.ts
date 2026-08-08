import { Frequency, PaymentMethod } from '@prisma/client';
export declare class CreateRecurringPaymentDto {
    name: string;
    amount: number;
    categoryId: string;
    paymentMethod: PaymentMethod;
    frequency: Frequency;
    intervalCount?: number;
    nextDueDate: string;
    active?: boolean;
    notes?: string;
}
declare const UpdateRecurringPaymentDto_base: import("@nestjs/common").Type<Partial<CreateRecurringPaymentDto>>;
export declare class UpdateRecurringPaymentDto extends UpdateRecurringPaymentDto_base {
}
export {};
