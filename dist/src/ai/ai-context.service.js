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
exports.AiContextService = void 0;
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const prisma_service_1 = require("../prisma/prisma.service");
const savings_service_1 = require("../savings/savings.service");
const amount = (value) => Number(value ?? 0);
const date = (value) => value ? (0, date_fns_1.format)(value, 'yyyy-MM-dd') : null;
let AiContextService = class AiContextService {
    prisma;
    savings;
    constructor(prisma, savings) {
        this.prisma = prisma;
        this.savings = savings;
    }
    async build(userId) {
        const now = new Date();
        const monthStart = (0, date_fns_1.startOfMonth)(now);
        const monthEnd = (0, date_fns_1.endOfMonth)(now);
        const [settings, categories, jobs, incomes, expenses, debts, installments, recurringPayments, budgets, savingsAssets, savingsTotal,] = await Promise.all([
            this.prisma.settings.upsert({
                where: { userId },
                create: { userId },
                update: {},
            }),
            this.prisma.category.findMany({
                where: { OR: [{ userId }, { isDefault: true, userId: null }] },
                select: { id: true, name: true, nameAr: true },
                orderBy: { name: 'asc' },
            }),
            this.prisma.job.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.income.findMany({
                where: { userId },
                include: {
                    job: true,
                    debtRepayment: {
                        select: { debt: { select: { id: true, name: true } } },
                    },
                },
                orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
            }),
            this.prisma.expense.findMany({
                where: { userId },
                include: {
                    category: true,
                    salaryIncome: {
                        select: {
                            id: true,
                            amount: true,
                            date: true,
                            description: true,
                            job: { select: { name: true } },
                        },
                    },
                    installment: { select: { id: true, name: true } },
                    recurringPayment: { select: { id: true, name: true } },
                },
                orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
            }),
            this.prisma.debt.findMany({
                where: { userId },
                include: { payments: { orderBy: { date: 'desc' } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.installment.findMany({
                where: { userId },
                include: {
                    salaryIncome: {
                        select: {
                            id: true,
                            amount: true,
                            date: true,
                            description: true,
                        },
                    },
                    expenses: {
                        select: {
                            id: true,
                            amount: true,
                            date: true,
                            description: true,
                            salaryIncomeId: true,
                        },
                        orderBy: { date: 'desc' },
                    },
                },
                orderBy: { startDate: 'desc' },
            }),
            this.prisma.recurringPayment.findMany({
                where: { userId },
                include: {
                    category: true,
                    approvals: { orderBy: { date: 'desc' } },
                },
                orderBy: { nextDueDate: 'asc' },
            }),
            this.prisma.budget.findMany({
                where: { userId },
                include: { category: true },
                orderBy: { month: 'desc' },
            }),
            this.prisma.savingsAsset.findMany({
                where: { userId },
                include: {
                    debtRepayment: {
                        select: { debt: { select: { id: true, name: true } } },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.savings.total(userId).catch(() => null),
        ]);
        const currency = settings.currency || 'USD';
        const categoryNames = categories.map((category) => category.name);
        const totalIncome = incomes.reduce((sum, item) => sum + amount(item.amount), 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + amount(item.amount), 0);
        const currentMonthIncome = incomes
            .filter((item) => item.date >= monthStart && item.date <= monthEnd)
            .reduce((sum, item) => sum + amount(item.amount), 0);
        const currentMonthExpenses = expenses
            .filter((item) => item.date >= monthStart && item.date <= monthEnd)
            .reduce((sum, item) => sum + amount(item.amount), 0);
        const categorySpending = new Map();
        for (const expense of expenses) {
            categorySpending.set(expense.category.name, (categorySpending.get(expense.category.name) ?? 0) +
                amount(expense.amount));
        }
        const salaryCycles = incomes
            .filter((income) => income.source === 'SALARY')
            .map((income) => {
            const linkedExpenses = expenses.filter((expense) => expense.salaryIncomeId === income.id);
            const spent = linkedExpenses.reduce((sum, expense) => sum + amount(expense.amount), 0);
            return {
                id: income.id,
                receivedDate: date(income.date),
                amount: amount(income.amount),
                job: income.job?.name ?? null,
                description: income.description,
                notes: income.notes,
                linkedExpenseCount: linkedExpenses.length,
                paidExpenses: spent,
                currentRemainingBalance: amount(income.amount) - spent,
            };
        });
        const data = {
            scope: 'All financial records available to this authenticated user at chat time.',
            generatedDate: (0, date_fns_1.format)(now, 'yyyy-MM-dd'),
            preferences: {
                currency,
                locale: settings.locale,
                dateFormat: settings.dateFormat,
            },
            summaries: {
                allTime: {
                    income: totalIncome,
                    paidExpenses: totalExpenses,
                    currentBalance: totalIncome - totalExpenses,
                },
                currentCalendarMonth: {
                    month: (0, date_fns_1.format)(now, 'yyyy-MM'),
                    income: currentMonthIncome,
                    paidExpenses: currentMonthExpenses,
                    currentBalance: currentMonthIncome - currentMonthExpenses,
                },
                spendingByCategory: [...categorySpending.entries()]
                    .map(([name, total]) => ({ name, total }))
                    .sort((a, b) => b.total - a.total),
            },
            salaryCycles,
            categories: categories.map((category) => ({
                id: category.id,
                name: category.name,
                nameAr: category.nameAr,
            })),
            jobs: jobs.map((job) => ({
                id: job.id,
                name: job.name,
                type: job.type,
                employer: job.employer,
                expectedAmount: job.expectedAmount == null ? null : amount(job.expectedAmount),
                payDayOfMonth: job.payDayOfMonth,
                active: job.active,
                notes: job.notes,
            })),
            incomes: incomes.map((income) => ({
                id: income.id,
                amount: amount(income.amount),
                date: date(income.date),
                source: income.source,
                job: income.job?.name ?? null,
                description: income.description,
                notes: income.notes,
                receivedDebtRepayment: income.debtRepayment
                    ? {
                        debtId: income.debtRepayment.debt.id,
                        debtName: income.debtRepayment.debt.name,
                    }
                    : null,
            })),
            expenses: expenses.map((expense) => ({
                id: expense.id,
                amount: amount(expense.amount),
                date: date(expense.date),
                category: expense.category.name,
                paymentMethod: expense.paymentMethod,
                description: expense.description,
                notes: expense.notes,
                salaryCycle: expense.salaryIncome
                    ? {
                        id: expense.salaryIncome.id,
                        receivedDate: date(expense.salaryIncome.date),
                        amount: amount(expense.salaryIncome.amount),
                        label: expense.salaryIncome.job?.name ??
                            expense.salaryIncome.description,
                    }
                    : null,
                installment: expense.installment
                    ? { id: expense.installment.id, name: expense.installment.name }
                    : null,
                recurringPayment: expense.recurringPayment
                    ? {
                        id: expense.recurringPayment.id,
                        name: expense.recurringPayment.name,
                    }
                    : null,
            })),
            debts: debts.map((debt) => {
                const paid = debt.payments.reduce((sum, payment) => sum + amount(payment.amount), 0);
                return {
                    id: debt.id,
                    name: debt.name,
                    direction: debt.direction,
                    type: debt.type,
                    originalAmount: amount(debt.originalAmount),
                    interestRate: amount(debt.interestRate),
                    monthlyPayment: debt.monthlyPayment == null ? null : amount(debt.monthlyPayment),
                    totalPaid: paid,
                    remaining: Math.max(amount(debt.originalAmount) - paid, 0),
                    startDate: date(debt.startDate),
                    dueDate: date(debt.dueDate),
                    counterparty: debt.counterparty,
                    notes: debt.notes,
                    payments: debt.payments.map((payment) => ({
                        id: payment.id,
                        amount: amount(payment.amount),
                        date: date(payment.date),
                        isExtra: payment.isExtra,
                        notes: payment.notes,
                    })),
                };
            }),
            installments: installments.map((installment) => {
                const expensePayments = installment.expenses.reduce((sum, expense) => sum + amount(expense.amount), 0);
                const paidCount = installment.paidInstallments + installment.expenses.length;
                const paidAmount = Math.min(amount(installment.downPayment) +
                    installment.paidInstallments * amount(installment.monthlyAmount) +
                    expensePayments, amount(installment.totalPrice));
                return {
                    id: installment.id,
                    name: installment.name,
                    totalPrice: amount(installment.totalPrice),
                    downPayment: amount(installment.downPayment),
                    monthlyAmount: amount(installment.monthlyAmount),
                    totalInstallments: installment.totalInstallments,
                    paidInstallments: paidCount,
                    remainingInstallments: Math.max(installment.totalInstallments - paidCount, 0),
                    paidAmount,
                    remainingBalance: Math.max(amount(installment.totalPrice) - paidAmount, 0),
                    startDate: date(installment.startDate),
                    notes: installment.notes,
                    linkedSalaryCycle: installment.salaryIncome
                        ? {
                            id: installment.salaryIncome.id,
                            receivedDate: date(installment.salaryIncome.date),
                            amount: amount(installment.salaryIncome.amount),
                            description: installment.salaryIncome.description,
                        }
                        : null,
                    paymentExpenses: installment.expenses.map((expense) => ({
                        id: expense.id,
                        amount: amount(expense.amount),
                        date: date(expense.date),
                        description: expense.description,
                        salaryIncomeId: expense.salaryIncomeId,
                    })),
                };
            }),
            recurringPayments: recurringPayments.map((recurring) => ({
                id: recurring.id,
                name: recurring.name,
                amount: amount(recurring.amount),
                category: recurring.category.name,
                paymentMethod: recurring.paymentMethod,
                frequency: recurring.frequency,
                intervalCount: recurring.intervalCount,
                nextDueDate: date(recurring.nextDueDate),
                active: recurring.active,
                notes: recurring.notes,
                approvals: recurring.approvals.map((approval) => ({
                    id: approval.id,
                    date: date(approval.date),
                    amount: amount(approval.amount),
                    status: approval.status,
                })),
            })),
            budgets: budgets.map((budget) => ({
                id: budget.id,
                month: (0, date_fns_1.format)(budget.month, 'yyyy-MM'),
                amount: amount(budget.amount),
                category: budget.category?.name ?? 'overall',
            })),
            savings: {
                valuationCurrency: 'JOD',
                currentEstimatedTotal: savingsTotal,
                assets: savingsAssets.map((asset) => ({
                    id: asset.id,
                    type: asset.type,
                    name: asset.name,
                    weightGrams: asset.weightGrams == null ? null : amount(asset.weightGrams),
                    karat: asset.karat,
                    goldForm: asset.goldForm,
                    quantity: asset.quantity,
                    purityPermille: asset.purityPermille,
                    amount: asset.amount == null ? null : amount(asset.amount),
                    notes: asset.notes,
                    receivedDebtRepayment: asset.debtRepayment
                        ? {
                            debtId: asset.debtRepayment.debt.id,
                            debtName: asset.debtRepayment.debt.name,
                        }
                        : null,
                })),
            },
        };
        return {
            currency,
            locale: settings.locale,
            today: (0, date_fns_1.format)(now, 'yyyy-MM-dd'),
            categories: categoryNames,
            text: JSON.stringify(data),
        };
    }
};
exports.AiContextService = AiContextService;
exports.AiContextService = AiContextService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        savings_service_1.SavingsService])
], AiContextService);
//# sourceMappingURL=ai-context.service.js.map