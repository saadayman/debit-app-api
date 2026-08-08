import { DebtDirection, DebtType } from '@prisma/client';
export declare class CreateDebtDto {
    name: string;
    direction?: DebtDirection;
    type: DebtType;
    originalAmount: number;
    interestRate?: number;
    monthlyPayment?: number | null;
    startDate: string;
    dueDate?: string;
    counterparty?: string;
    notes?: string;
}
declare const UpdateDebtDto_base: import("@nestjs/common").Type<Partial<CreateDebtDto>>;
export declare class UpdateDebtDto extends UpdateDebtDto_base {
}
export declare class ListDebtsQueryDto {
    direction?: DebtDirection;
}
export declare class CreateDebtPaymentDto {
    amount: number;
    date: string;
    isExtra?: boolean;
    notes?: string;
}
declare const UpdateDebtPaymentDto_base: import("@nestjs/common").Type<Partial<CreateDebtPaymentDto>>;
export declare class UpdateDebtPaymentDto extends UpdateDebtPaymentDto_base {
}
export {};
