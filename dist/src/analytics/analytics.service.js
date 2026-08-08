"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const installment_schedule_1 = require("../installments/installment-schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const savings_service_1 = require("../savings/savings.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    savings;
    constructor(prisma, savings) {
        this.prisma = prisma;
        this.savings = savings;
    }
    async overview(userId, month) {
        const now = new Date();
        const monthStart = month
            ? new Date(`${month}-01T00:00:00.000Z`)
            : (0, date_fns_1.startOfMonth)(now);
        const monthEnd = (0, date_fns_1.endOfMonth)(monthStart);
        const daysInMonth = (0, date_fns_1.getDaysInMonth)(monthStart);
        const isCurrentMonth = monthStart.getUTCFullYear() === now.getFullYear() &&
            monthStart.getUTCMonth() === now.getMonth();
        const daysElapsed = isCurrentMonth
            ? Math.max(now.getDate(), 1)
            : daysInMonth;
        const daysRemaining = isCurrentMonth
            ? Math.max(daysInMonth - now.getDate(), 0)
            : 0;
        const [incomeAgg, expenseAgg, byCategory, categories, debts, installments, paidInstallmentExpenses, savingsTotal,] = await Promise.all([
            this.prisma.income.aggregate({
                where: { userId, date: { gte: monthStart, lte: monthEnd } },
                _sum: { amount: true },
            }),
            this.prisma.expense.aggregate({
                where: { userId, date: { gte: monthStart, lte: monthEnd } },
                _sum: { amount: true },
            }),
            this.prisma.expense.groupBy({
                by: ['categoryId'],
                where: { userId, date: { gte: monthStart, lte: monthEnd } },
                _sum: { amount: true },
            }),
            this.prisma.category.findMany({
                where: { OR: [{ isDefault: true, userId: null }, { userId }] },
            }),
            this.prisma.debt.findMany({
                where: { userId },
                include: { payments: true },
            }),
            this.prisma.installment.findMany({
                where: { userId },
                include: { _count: { select: { expenses: true } } },
            }),
            this.prisma.expense.findMany({
                where: {
                    userId,
                    date: { gte: monthStart, lte: monthEnd },
                    installmentId: { not: null },
                },
                select: { installmentId: true },
            }),
            this.savings.total(userId),
        ]);
        const income = Number(incomeAgg._sum.amount ?? 0);
        const expenses = Number(expenseAgg._sum.amount ?? 0);
        const owedByMe = debts.filter((d) => d.direction === 'OWED_BY_ME');
        const owedToMe = debts.filter((d) => d.direction === 'OWED_TO_ME');
        const remainingOf = (d) => {
            const paid = d.payments.reduce((p, x) => p + Number(x.amount), 0);
            return Math.max(Number(d.originalAmount) - paid, 0);
        };
        const debtRemaining = owedByMe.reduce((s, d) => s + remainingOf(d), 0);
        const receivableRemaining = owedToMe.reduce((s, d) => s + remainingOf(d), 0);
        const debtMonthly = owedByMe.reduce((s, d) => remainingOf(d) > 0 && d.monthlyPayment != null
            ? s + Number(d.monthlyPayment)
            : s, 0);
        const paidInstallmentIds = new Set(paidInstallmentExpenses.map((expense) => expense.installmentId));
        const installmentMonthly = installments.reduce((s, i) => {
            const paidInstallments = i.paidInstallments + (i._count?.expenses ?? 0);
            return (0, installment_schedule_1.installmentDueInMonth)({ ...i, paidInstallments }, monthStart, now) && !paidInstallmentIds.has(i.id)
                ? s + Number(i.monthlyAmount)
                : s;
        }, 0);
        const installmentRemaining = installments.reduce((s, i) => {
            const total = Number(i.totalPrice);
            const paidInstallments = i.paidInstallments + (i._count?.expenses ?? 0);
            const paid = Math.min(Number(i.downPayment) + paidInstallments * Number(i.monthlyAmount), total);
            return s + Math.max(total - paid, 0);
        }, 0);
        const obligationsMonthly = debtMonthly + installmentMonthly;
        const categoryMap = new Map(categories.map((c) => [c.id, c]));
        const topCategories = byCategory
            .map((g) => {
            const cat = categoryMap.get(g.categoryId);
            return {
                categoryId: g.categoryId,
                name: cat?.name ?? 'Unknown',
                nameAr: cat?.nameAr ?? null,
                color: cat?.color ?? null,
                total: Number(g._sum.amount ?? 0),
            };
        })
            .sort((a, b) => b.total - a.total)
            .slice(0, 6);
        const trend = await this.spendingTrend(userId, monthStart);
        const avgMonthlySpending = trend.reduce((s, m) => s + m.expenses, 0) / (trend.length || 1);
        const avgDailySpending = expenses / daysElapsed;
        const currentNet = income - expenses - obligationsMonthly;
        const predictedEndOfMonthBalance = currentNet - avgDailySpending * daysRemaining;
        return {
            month: (0, date_fns_1.format)(monthStart, 'yyyy-MM'),
            income,
            expenses,
            avgDailySpending: round2(avgDailySpending),
            avgMonthlySpending: round2(avgMonthlySpending),
            savingsRate: income > 0 ? round2(((income - expenses) / income) * 100) : null,
            debtToIncomeRatio: income > 0 ? round2((obligationsMonthly / income) * 100) : null,
            obligationsMonthly: round2(obligationsMonthly),
            predictedEndOfMonthBalance: round2(predictedEndOfMonthBalance),
            netWorth: round2(savingsTotal +
                receivableRemaining -
                debtRemaining -
                installmentRemaining),
            netWorthParts: {
                savings: round2(savingsTotal),
                receivables: round2(receivableRemaining),
                debtRemaining: round2(debtRemaining),
                installmentRemaining: round2(installmentRemaining),
            },
            topCategories,
            spendingTrend: trend,
        };
    }
    async spendingTrend(userId, monthStart) {
        const months = Array.from({ length: 6 }, (_, i) => (0, date_fns_1.subMonths)(monthStart, 5 - i));
        return Promise.all(months.map(async (m) => {
            const agg = await this.prisma.expense.aggregate({
                where: { userId, date: { gte: m, lte: (0, date_fns_1.endOfMonth)(m) } },
                _sum: { amount: true },
            });
            return {
                month: (0, date_fns_1.format)(m, 'yyyy-MM'),
                expenses: Number(agg._sum.amount ?? 0),
            };
        }));
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        savings_service_1.SavingsService])
], AnalyticsService);
function round2(n) {
    return Math.round(n * 100) / 100;
}
//# sourceMappingURL=analytics.service.js.map