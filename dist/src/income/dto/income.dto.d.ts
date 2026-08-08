import { IncomeSource } from '@prisma/client';
export declare class CreateIncomeDto {
    amount: number;
    date: string;
    source: IncomeSource;
    jobId?: string;
    description?: string;
    notes?: string;
}
declare const UpdateIncomeDto_base: import("@nestjs/common").Type<Partial<CreateIncomeDto>>;
export declare class UpdateIncomeDto extends UpdateIncomeDto_base {
}
export declare class ListIncomeQueryDto {
    from?: string;
    to?: string;
    source?: IncomeSource;
}
export {};
