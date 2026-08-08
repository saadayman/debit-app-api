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
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const jobs_service_1 = require("../jobs/jobs.service");
const cars_service_1 = require("../cars/cars.service");
const gold_price_service_1 = require("../prices/gold-price.service");
const prisma_service_1 = require("../prisma/prisma.service");
const LOW_BALANCE_RATIO = 0.15;
const BUDGET_NEAR_PCT = 85;
const UPCOMING_DAYS = 7;
const GOLD_MOVE_PCT = 3;
let AlertsService = class AlertsService {
    prisma;
    goldPrice;
    cars;
    constructor(prisma, goldPrice, cars) {
        this.prisma = prisma;
        this.goldPrice = goldPrice;
        this.cars = cars;
    }
    async list(userId) {
        const now = new Date();
        const monthStart = (0, date_fns_1.startOfMonth)(now);
        const monthEnd = (0, date_fns_1.endOfMonth)(now);
        const [incomeAgg, expenseAgg, budgets, spentByCategory, recurring, debts, jobs, vehicles,] = await Promise.all([
            this.prisma.income.aggregate({
                where: { userId, date: { gte: monthStart, lte: monthEnd } },
                _sum: { amount: true },
            }),
            this.prisma.expense.aggregate({
                where: { userId, date: { gte: monthStart, lte: monthEnd } },
                _sum: { amount: true },
            }),
            this.prisma.budget.findMany({
                where: { userId, month: monthStart },
                include: { category: true },
            }),
            this.prisma.expense.groupBy({
                by: ['categoryId'],
                where: { userId, date: { gte: monthStart, lte: monthEnd } },
                _sum: { amount: true },
            }),
            this.prisma.recurringPayment.findMany({
                where: {
                    userId,
                    active: true,
                    nextDueDate: { gte: now, lte: (0, date_fns_1.addDays)(now, UPCOMING_DAYS) },
                },
                include: { category: true },
                orderBy: { nextDueDate: 'asc' },
            }),
            this.prisma.debt.findMany({
                where: {
                    userId,
                    dueDate: { gte: now, lte: (0, date_fns_1.addDays)(now, 14) },
                },
            }),
            this.prisma.job.findMany({
                where: { userId, active: true, payDayOfMonth: { not: null } },
            }),
            this.cars.list(userId),
        ]);
        const alerts = [];
        const totalIncome = Number(incomeAgg._sum.amount ?? 0);
        const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
        const spentMap = new Map(spentByCategory.map((g) => [g.categoryId, Number(g._sum.amount ?? 0)]));
        for (const b of budgets) {
            const amount = Number(b.amount);
            const spent = b.categoryId
                ? (spentMap.get(b.categoryId) ?? 0)
                : totalExpenses;
            if (amount <= 0)
                continue;
            const pct = (spent / amount) * 100;
            const label = b.category?.name ?? null;
            if (spent > amount) {
                alerts.push({
                    id: `budget_exceeded_${b.id}`,
                    type: 'budget_exceeded',
                    severity: 'critical',
                    data: {
                        category: label,
                        over: round2(spent - amount),
                        amount,
                        spent,
                    },
                });
            }
            else if (pct >= BUDGET_NEAR_PCT) {
                alerts.push({
                    id: `budget_near_${b.id}`,
                    type: 'budget_near',
                    severity: 'warning',
                    data: { category: label, percent: Math.round(pct) },
                });
            }
        }
        const balance = totalIncome - totalExpenses;
        if (totalIncome > 0 && balance < totalIncome * LOW_BALANCE_RATIO) {
            alerts.push({
                id: 'low_balance',
                type: 'low_balance',
                severity: balance < 0 ? 'critical' : 'warning',
                data: { balance: round2(balance) },
            });
        }
        for (const rp of recurring) {
            alerts.push({
                id: `upcoming_recurring_${rp.id}`,
                type: 'upcoming_recurring',
                severity: 'info',
                data: {
                    name: rp.name,
                    amount: Number(rp.amount),
                    days: Math.max((0, date_fns_1.differenceInCalendarDays)(rp.nextDueDate, now), 0),
                    date: rp.nextDueDate.toISOString(),
                },
            });
        }
        for (const d of debts) {
            if (!d.dueDate)
                continue;
            const owedToMe = d.direction === 'OWED_TO_ME';
            alerts.push({
                id: `${owedToMe ? 'receivable' : 'debt'}_due_${d.id}`,
                type: owedToMe ? 'receivable_due' : 'debt_due',
                severity: owedToMe ? 'info' : 'warning',
                data: {
                    name: owedToMe ? (d.counterparty ?? d.name) : d.name,
                    amount: d.monthlyPayment != null ? Number(d.monthlyPayment) : 0,
                    days: Math.max((0, date_fns_1.differenceInCalendarDays)(d.dueDate, now), 0),
                    date: d.dueDate.toISOString(),
                },
            });
        }
        if (jobs.length > 0) {
            const paidThisMonth = await this.prisma.income.findMany({
                where: {
                    userId,
                    date: { gte: monthStart, lte: monthEnd },
                    jobId: { in: jobs.map((j) => j.id) },
                },
                select: { jobId: true },
            });
            const paidJobIds = new Set(paidThisMonth.map((i) => i.jobId));
            for (const job of jobs) {
                if (job.payDayOfMonth == null || paidJobIds.has(job.id))
                    continue;
                const due = (0, jobs_service_1.nextPayday)(job.payDayOfMonth, now);
                const days = (0, date_fns_1.differenceInCalendarDays)(due, now);
                if (days >= 0 && days <= UPCOMING_DAYS) {
                    alerts.push({
                        id: `upcoming_salary_${job.id}`,
                        type: 'upcoming_salary',
                        severity: 'info',
                        data: {
                            name: job.name,
                            amount: Number(job.expectedAmount ?? 0),
                            days,
                            date: due.toISOString(),
                        },
                    });
                }
            }
        }
        const movement = await this.goldPrice.getDailyMovement();
        if (movement && Math.abs(movement.percentChange) >= GOLD_MOVE_PCT) {
            alerts.push({
                id: 'gold_moved',
                type: 'gold_moved',
                severity: 'info',
                data: {
                    direction: movement.direction,
                    percent: Math.abs(movement.percentChange),
                    perGram24k: movement.perGram24kJod,
                },
            });
        }
        for (const vehicle of vehicles) {
            for (const item of vehicle.maintenanceItems) {
                if (!item.active || item.status === 'OK')
                    continue;
                alerts.push({
                    id: `maintenance_${item.status.toLowerCase()}_${item.id}`,
                    type: item.status === 'OVERDUE' ? 'maintenance_due' : 'maintenance_soon',
                    severity: item.status === 'OVERDUE' ? 'critical' : 'warning',
                    data: {
                        name: item.name,
                        car: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                        remainingKm: Math.max(Number(item.remainingKm), 0),
                        overdueKm: Math.max(-Number(item.remainingKm), 0),
                    },
                });
            }
        }
        const order = ['critical', 'warning', 'info'];
        alerts.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
        return { alerts };
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gold_price_service_1.GoldPriceService,
        cars_service_1.CarsService])
], AlertsService);
function round2(n) {
    return Math.round(n * 100) / 100;
}
//# sourceMappingURL=alerts.service.js.map