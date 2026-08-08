import type { AuthUser } from '../common/decorators/current-user.decorator';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, ListBudgetsQueryDto, UpdateBudgetDto } from './dto/budget.dto';
export declare class BudgetsController {
    private budgets;
    constructor(budgets: BudgetsService);
    list(user: AuthUser, query: ListBudgetsQueryDto): Promise<{
        spent: number;
        remaining: number;
        percentUsed: number;
        overspent: boolean;
        dailyLimit: number;
        category: {
            id: string;
            name: string;
            nameAr: string | null;
            icon: string | null;
            color: string | null;
            isDefault: boolean;
            userId: string | null;
            createdAt: Date;
        } | null;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string | null;
        month: Date;
    }[]>;
    create(user: AuthUser, dto: CreateBudgetDto): Promise<{
        category: {
            id: string;
            name: string;
            nameAr: string | null;
            icon: string | null;
            color: string | null;
            isDefault: boolean;
            userId: string | null;
            createdAt: Date;
        } | null;
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string | null;
        month: Date;
    }>;
    update(user: AuthUser, id: string, dto: UpdateBudgetDto): Promise<{
        category: {
            id: string;
            name: string;
            nameAr: string | null;
            icon: string | null;
            color: string | null;
            isDefault: boolean;
            userId: string | null;
            createdAt: Date;
        } | null;
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string | null;
        month: Date;
    }>;
    remove(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
}
