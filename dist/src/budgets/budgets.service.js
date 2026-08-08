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
exports.BudgetsService = void 0;
exports.monthToDate = monthToDate;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma_service_1 = require("../prisma/prisma.service");
function monthToDate(month) {
    return new Date(`${month}-01T00:00:00.000Z`);
}
let BudgetsService = class BudgetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(userId, query) {
        const monthStart = query.month
            ? monthToDate(query.month)
            : (0, date_fns_1.startOfMonth)(new Date());
        const monthEnd = (0, date_fns_1.endOfMonth)(monthStart);
        const [budgets, spentByCategory] = await Promise.all([
            this.prisma.budget.findMany({
                where: { userId, month: monthStart },
                include: { category: true },
                orderBy: { createdAt: 'asc' },
            }),
            this.prisma.expense.groupBy({
                by: ['categoryId'],
                where: { userId, date: { gte: monthStart, lte: monthEnd } },
                _sum: { amount: true },
            }),
        ]);
        const totalSpent = spentByCategory.reduce((s, g) => s + Number(g._sum.amount ?? 0), 0);
        const today = new Date();
        const daysLeft = Math.max((0, date_fns_1.differenceInCalendarDays)(monthEnd, today) + 1, 1);
        return budgets.map((b) => {
            const spent = b.categoryId
                ? Number(spentByCategory.find((g) => g.categoryId === b.categoryId)?._sum
                    .amount ?? 0)
                : totalSpent;
            const amount = Number(b.amount);
            const remaining = amount - spent;
            return {
                ...b,
                spent,
                remaining,
                percentUsed: amount > 0 ? (spent / amount) * 100 : 0,
                overspent: spent > amount,
                dailyLimit: remaining > 0 ? remaining / daysLeft : 0,
            };
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
        if (dto.categoryId)
            await this.assertCategoryUsable(userId, dto.categoryId);
        const month = monthToDate(dto.month);
        if (!dto.categoryId) {
            const existing = await this.prisma.budget.findFirst({
                where: { userId, month, categoryId: null },
            });
            if (existing) {
                throw new common_1.ConflictException('Overall budget already set for this month');
            }
        }
        try {
            return await this.prisma.budget.create({
                data: {
                    userId,
                    month,
                    amount: dto.amount,
                    categoryId: dto.categoryId ?? null,
                },
                include: { category: true },
            });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002') {
                throw new common_1.ConflictException('A budget for this category and month already exists');
            }
            throw e;
        }
    }
    async findOwn(userId, id) {
        const budget = await this.prisma.budget.findFirst({ where: { id, userId } });
        if (!budget)
            throw new common_1.NotFoundException('Budget not found');
        return budget;
    }
    async update(userId, id, dto) {
        await this.findOwn(userId, id);
        return this.prisma.budget.update({
            where: { id },
            data: {
                ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
                ...(dto.month !== undefined ? { month: monthToDate(dto.month) } : {}),
            },
            include: { category: true },
        });
    }
    async remove(userId, id) {
        await this.findOwn(userId, id);
        await this.prisma.budget.delete({ where: { id } });
        return { message: 'Deleted' };
    }
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map