export declare class CreateBudgetDto {
    month: string;
    amount: number;
    categoryId?: string;
}
declare const UpdateBudgetDto_base: import("@nestjs/common").Type<Partial<CreateBudgetDto>>;
export declare class UpdateBudgetDto extends UpdateBudgetDto_base {
}
export declare class ListBudgetsQueryDto {
    month?: string;
}
export {};
