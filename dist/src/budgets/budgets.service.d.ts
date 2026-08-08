import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto, ListBudgetsQueryDto, UpdateBudgetDto } from './dto/budget.dto';
export declare function monthToDate(month: string): Date;
export declare class BudgetsService {
    private prisma;
    constructor(prisma: PrismaService);
    list(userId: string, query: ListBudgetsQueryDto): Promise<{
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
        amount: Prisma.Decimal;
        categoryId: string | null;
        month: Date;
    }[]>;
    private assertCategoryUsable;
    create(userId: string, dto: CreateBudgetDto): Promise<{
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
        amount: Prisma.Decimal;
        categoryId: string | null;
        month: Date;
    }>;
    private findOwn;
    update(userId: string, id: string, dto: UpdateBudgetDto): Promise<{
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
        amount: Prisma.Decimal;
        categoryId: string | null;
        month: Date;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
