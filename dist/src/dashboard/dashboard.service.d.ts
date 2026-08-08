import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RecurringService } from '../recurring/recurring.service';
import { SavingsService } from '../savings/savings.service';
export declare class DashboardService {
    private prisma;
    private recurring;
    private savings;
    constructor(prisma: PrismaService, recurring: RecurringService, savings: SavingsService);
    summary(userId: string, month?: string, salaryIncomeId?: string): Promise<{
        month: string;
        period: {
            type: "salary";
            salaryIncomeId: string;
            salaryDate: Date;
            salaryName: string | null;
        } | {
            type: "month";
            salaryIncomeId?: undefined;
            salaryDate?: undefined;
            salaryName?: undefined;
        };
        totals: {
            income: number;
            expenses: number;
            installmentsMonthly: number;
            balance: number;
        };
        debts: {
            activeCount: number;
            totalRemaining: number;
        };
        receivables: {
            activeCount: number;
            totalRemaining: number;
        };
        installments: {
            activeCount: number;
            totalRemaining: number;
            monthlyCommitment: number;
        };
        savings: {
            total: number;
            currency: string;
        };
        budget: {
            amount: number | null;
            spent: number;
            remaining: number;
            percentUsed: number;
        } | null;
        upcomingPayments: ({
            category: {
                id: string;
                name: string;
                nameAr: string | null;
                icon: string | null;
                color: string | null;
                isDefault: boolean;
                userId: string | null;
                createdAt: Date;
            };
        } & {
            id: string;
            name: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            amount: Prisma.Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            frequency: import("@prisma/client").$Enums.Frequency;
            intervalCount: number;
            nextDueDate: Date;
            categoryId: string;
        })[];
        expensesByCategory: {
            categoryId: string;
            name: string;
            nameAr: string | null;
            color: string | null;
            icon: string | null;
            total: number;
        }[];
        incomeVsExpenses: {
            month: string;
            income: number;
            expenses: number;
        }[];
        recentTransactions: ({
            id: string;
            type: "income";
            amount: number;
            date: Date;
            label: string;
        } | {
            id: string;
            type: "expense";
            amount: number;
            date: Date;
            label: string;
            categoryName: string;
            categoryNameAr: string | null;
            categoryColor: string | null;
        } | {
            id: string;
            type: "debtPayment";
            amount: number;
            date: Date;
            label: string;
        })[];
    }>;
    private salaryTrend;
    private monthlyTrend;
}
