import { PrismaService } from '../prisma/prisma.service';
import { SavingsService } from '../savings/savings.service';
export declare class AnalyticsService {
    private prisma;
    private savings;
    constructor(prisma: PrismaService, savings: SavingsService);
    overview(userId: string, month?: string): Promise<{
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
    private spendingTrend;
}
