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
var RecurringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const date_fns_1 = require("date-fns");
const prisma_service_1 = require("../prisma/prisma.service");
function advance(date, frequency, interval) {
    switch (frequency) {
        case 'DAILY':
            return (0, date_fns_1.addDays)(date, interval);
        case 'WEEKLY':
            return (0, date_fns_1.addWeeks)(date, interval);
        case 'MONTHLY':
            return (0, date_fns_1.addMonths)(date, interval);
        case 'YEARLY':
            return (0, date_fns_1.addYears)(date, interval);
    }
}
let RecurringService = RecurringService_1 = class RecurringService {
    prisma;
    logger = new common_1.Logger(RecurringService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(userId) {
        return this.prisma.recurringPayment.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { nextDueDate: 'asc' },
        });
    }
    async assertCategoryUsable(userId, categoryId) {
        const category = await this.prisma.category.findFirst({
            where: {
                id: categoryId,
                OR: [{ isDefault: true, userId: null }, { userId }],
            },
        });
        if (!category)
            throw new common_1.BadRequestException('Unknown category');
    }
    async create(userId, dto) {
        await this.assertCategoryUsable(userId, dto.categoryId);
        return this.prisma.recurringPayment.create({
            data: {
                userId,
                name: dto.name,
                amount: dto.amount,
                categoryId: dto.categoryId,
                paymentMethod: dto.paymentMethod,
                frequency: dto.frequency,
                intervalCount: dto.intervalCount ?? 1,
                nextDueDate: new Date(dto.nextDueDate),
                active: dto.active ?? true,
                notes: dto.notes,
            },
            include: { category: true },
        });
    }
    async findOwn(userId, id) {
        const item = await this.prisma.recurringPayment.findFirst({
            where: { id, userId },
        });
        if (!item)
            throw new common_1.NotFoundException('Recurring payment not found');
        return item;
    }
    async update(userId, id, dto) {
        await this.findOwn(userId, id);
        if (dto.categoryId)
            await this.assertCategoryUsable(userId, dto.categoryId);
        return this.prisma.recurringPayment.update({
            where: { id },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
                ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
                ...(dto.paymentMethod !== undefined
                    ? { paymentMethod: dto.paymentMethod }
                    : {}),
                ...(dto.frequency !== undefined ? { frequency: dto.frequency } : {}),
                ...(dto.intervalCount !== undefined
                    ? { intervalCount: dto.intervalCount }
                    : {}),
                ...(dto.nextDueDate !== undefined
                    ? { nextDueDate: new Date(dto.nextDueDate) }
                    : {}),
                ...(dto.active !== undefined ? { active: dto.active } : {}),
                ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
            },
            include: { category: true },
        });
    }
    async remove(userId, id) {
        await this.findOwn(userId, id);
        await this.prisma.recurringPayment.delete({ where: { id } });
        return { message: 'Deleted' };
    }
    async generateDueExpenses(userId) {
        const now = new Date();
        const due = await this.prisma.recurringPayment.findMany({
            where: {
                active: true,
                nextDueDate: { lte: now },
                ...(userId ? { userId } : {}),
            },
        });
        let generated = 0;
        for (const rp of due) {
            generated += await this.materialize(rp, now);
        }
        return { generated };
    }
    async materialize(rp, now) {
        let next = rp.nextDueDate;
        let count = 0;
        while (next <= now && count < 100) {
            await this.prisma.$transaction(async (tx) => {
                const alreadyApproval = await tx.recurringApproval.findFirst({
                    where: { recurringPaymentId: rp.id, date: next },
                });
                if (!alreadyApproval) {
                    await tx.recurringApproval.create({
                        data: {
                            recurringPaymentId: rp.id,
                            userId: rp.userId,
                            date: next,
                            amount: rp.amount,
                        },
                    });
                }
                const advanced = advance(next, rp.frequency, rp.intervalCount);
                await tx.recurringPayment.update({
                    where: { id: rp.id },
                    data: { nextDueDate: advanced },
                });
            });
            next = advance(next, rp.frequency, rp.intervalCount);
            count++;
        }
        return count;
    }
    async listApprovals(userId, status) {
        return this.prisma.recurringApproval.findMany({
            where: {
                userId,
                ...(status ? { status } : {}),
            },
            include: { recurringPayment: { include: { category: true } } },
            orderBy: { date: 'asc' },
        });
    }
    async approve(userId, id) {
        const ap = await this.prisma.recurringApproval.findFirst({ where: { id }, include: { recurringPayment: true } });
        if (!ap || ap.userId !== userId)
            throw new common_1.NotFoundException('Not found');
        if (ap.status !== 'PENDING')
            throw new common_1.BadRequestException('Already handled');
        await this.prisma.$transaction(async (tx) => {
            await tx.expense.create({
                data: {
                    userId: ap.userId,
                    amount: ap.amount,
                    date: ap.date,
                    categoryId: ap.recurringPayment?.categoryId ?? undefined,
                    paymentMethod: ap.recurringPayment?.paymentMethod ?? undefined,
                    description: ap.recurringPayment?.name ?? null,
                    recurringPaymentId: ap.recurringPaymentId,
                },
            });
            await tx.recurringApproval.update({
                where: { id },
                data: { status: 'APPROVED' },
            });
        });
        return { message: 'Approved' };
    }
    async removeApproval(userId, id) {
        const ap = await this.prisma.recurringApproval.findFirst({ where: { id } });
        if (!ap || ap.userId !== userId)
            throw new common_1.NotFoundException('Not found');
        if (ap.status !== 'PENDING')
            throw new common_1.BadRequestException('Already handled');
        await this.prisma.recurringApproval.update({ where: { id }, data: { status: 'REMOVED' } });
        return { message: 'Removed' };
    }
    async nightlyGeneration() {
        const { generated } = await this.generateDueExpenses();
        if (generated > 0) {
            this.logger.log(`Generated ${generated} expenses from recurring payments`);
        }
    }
};
exports.RecurringService = RecurringService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_1AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecurringService.prototype, "nightlyGeneration", null);
exports.RecurringService = RecurringService = RecurringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecurringService);
//# sourceMappingURL=recurring.service.js.map