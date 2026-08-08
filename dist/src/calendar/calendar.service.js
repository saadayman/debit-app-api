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
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const prisma_service_1 = require("../prisma/prisma.service");
function step(date, frequency, times) {
    switch (frequency) {
        case 'DAILY':
            return (0, date_fns_1.addDays)(date, times);
        case 'WEEKLY':
            return (0, date_fns_1.addWeeks)(date, times);
        case 'MONTHLY':
            return (0, date_fns_1.addMonths)(date, times);
        case 'YEARLY':
            return (0, date_fns_1.addYears)(date, times);
    }
}
let CalendarService = class CalendarService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    iso(d) {
        return d.toISOString().slice(0, 10);
    }
    recurringOccurrences(nextDueDate, frequency, interval, start, end) {
        const out = [];
        let d = new Date(nextDueDate);
        let guard = 0;
        while (d > end && guard < 2000) {
            d = step(d, frequency, -interval);
            guard++;
        }
        while (d >= start && guard < 4000) {
            d = step(d, frequency, -interval);
            guard++;
        }
        d = step(d, frequency, interval);
        while (d <= end && guard < 6000) {
            if (d >= start)
                out.push(new Date(d));
            d = step(d, frequency, interval);
            guard++;
        }
        return out;
    }
    async month(userId, month) {
        const now = new Date();
        const year = month ? Number(month.slice(0, 4)) : now.getFullYear();
        const monthIdx = month ? Number(month.slice(5, 7)) - 1 : now.getMonth();
        const monthStart = new Date(Date.UTC(year, monthIdx, 1));
        const monthEnd = new Date(Date.UTC(year, monthIdx + 1, 0, 23, 59, 59, 999));
        const monthKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
        const [incomes, recurring, debts, installments, jobs] = await Promise.all([
            this.prisma.income.findMany({
                where: { userId, date: { gte: monthStart, lte: monthEnd } },
            }),
            this.prisma.recurringPayment.findMany({
                where: { userId, active: true },
                include: { category: true },
            }),
            this.prisma.debt.findMany({
                where: { userId, dueDate: { gte: monthStart, lte: monthEnd } },
            }),
            this.prisma.installment.findMany({
                where: { userId },
                include: { _count: { select: { expenses: true } } },
            }),
            this.prisma.job.findMany({
                where: { userId, active: true, payDayOfMonth: { not: null } },
            }),
        ]);
        const events = [];
        for (const inc of incomes) {
            events.push({
                date: this.iso(inc.date),
                type: inc.source === 'SALARY' ? 'salary' : 'income',
                label: inc.description || inc.source,
                amount: Number(inc.amount),
            });
        }
        for (const rp of recurring) {
            const occurrences = this.recurringOccurrences(rp.nextDueDate, rp.frequency, rp.intervalCount, monthStart, monthEnd);
            for (const occ of occurrences) {
                events.push({
                    date: this.iso(occ),
                    type: 'recurring',
                    label: rp.name,
                    amount: Number(rp.amount),
                });
            }
        }
        for (const debt of debts) {
            if (!debt.dueDate)
                continue;
            const owedToMe = debt.direction === 'OWED_TO_ME';
            events.push({
                date: this.iso(debt.dueDate),
                type: owedToMe ? 'receivable' : 'debt',
                label: owedToMe ? (debt.counterparty ?? debt.name) : debt.name,
                amount: debt.monthlyPayment != null ? Number(debt.monthlyPayment) : 0,
            });
        }
        const lastDay = monthEnd.getUTCDate();
        for (const inst of installments) {
            const paidInstallments = inst.paidInstallments + (inst._count?.expenses ?? 0);
            if (paidInstallments >= inst.totalInstallments)
                continue;
            const startMonth = new Date(Date.UTC(inst.startDate.getUTCFullYear(), inst.startDate.getUTCMonth(), 1));
            if (startMonth > monthStart)
                continue;
            const day = Math.min(inst.startDate.getUTCDate(), lastDay);
            const due = new Date(Date.UTC(year, monthIdx, day));
            events.push({
                date: this.iso(due),
                type: 'installment',
                label: inst.name,
                amount: Number(inst.monthlyAmount),
            });
        }
        const paidJobIds = new Set(incomes.map((i) => i.jobId).filter((id) => !!id));
        for (const job of jobs) {
            if (job.payDayOfMonth == null)
                continue;
            if (paidJobIds.has(job.id))
                continue;
            const day = Math.min(job.payDayOfMonth, lastDay);
            const due = new Date(Date.UTC(year, monthIdx, day));
            events.push({
                date: this.iso(due),
                type: 'expectedSalary',
                label: job.name,
                amount: Number(job.expectedAmount ?? 0),
            });
        }
        events.sort((a, b) => a.date.localeCompare(b.date));
        return { month: monthKey, events };
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map