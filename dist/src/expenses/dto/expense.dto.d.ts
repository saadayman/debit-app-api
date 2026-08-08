import { PaymentMethod } from '@prisma/client';
export declare class CreateExpenseDto {
    amount: number;
    date: string;
    categoryId: string;
    paymentMethod: PaymentMethod;
    description?: string;
    notes?: string;
    salaryIncomeId?: string | null;
}
declare const UpdateExpenseDto_base: import("@nestjs/common").Type<Partial<CreateExpenseDto>>;
export declare class UpdateExpenseDto extends UpdateExpenseDto_base {
}
export declare class AssignExpensesSalaryDto {
    expenseIds: string[];
    salaryIncomeId: string;
}
export declare class ListExpensesQueryDto {
    from?: string;
    to?: string;
    categoryId?: string;
    paymentMethod?: PaymentMethod;
    search?: string;
    salaryIncomeId?: string;
}
export {};
