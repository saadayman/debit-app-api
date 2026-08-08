import type { AuthUser } from '../common/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';
declare class AnalyticsQueryDto {
    month?: string;
}
export declare class AnalyticsController {
    private analytics;
    constructor(analytics: AnalyticsService);
    overview(user: AuthUser, query: AnalyticsQueryDto): Promise<{
        month: string;
        income: number;
        expenses: number;
        avgDailySpending: number;
        avgMonthlySpending: number;
        savingsRate: number | null;
        debtToIncomeRatio: number | null;
        obligationsMonthly: number;
        predictedEndOfMonthBalance: number;
        netWorth: number;
        netWorthParts: {
            savings: number;
            receivables: number;
            debtRemaining: number;
            installmentRemaining: number;
        };
        topCategories: {
            categoryId: string;
            name: string;
            nameAr: string | null;
            color: string | null;
            total: number;
        }[];
        spendingTrend: {
            month: string;
            expenses: number;
        }[];
    }>;
}
export {};
