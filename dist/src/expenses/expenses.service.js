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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExpensesService = class ExpensesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
    async assertSalaryUsable(userId, salaryIncomeId) {
        const salary = await this.prisma.income.findFirst({
            where: { id: salaryIncomeId, userId, source: 'SALARY' },
        });
        if (!salary)
            throw new common_1.BadRequestException('Unknown salary payment');
    }
    list(userId, query) {
        return this.prisma.expense.findMany({
            where: {
                userId,
                ...(query.categoryId ? { categoryId: query.categoryId } : {}),
                ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
                ...(query.salaryIncomeId === 'unassigned'
                    ? { salaryIncomeId: null }
                    : query.salaryIncomeId
                        ? { salaryIncomeId: query.salaryIncomeId }
                        : {}),
                ...(query.search
                    ? {
                        OR: [
                            {
                                description: { contains: query.search, mode: 'insensitive' },
                            },
                            { notes: { contains: query.search, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
                date: {
                    ...(query.from ? { gte: new Date(query.from) } : {}),
                    ...(query.to ? { lte: new Date(query.to) } : {}),
                },
            },
            include: { category: true, salaryIncome: { include: { job: true } } },
            orderBy: { date: 'desc' },
            take: 200,
        });
    }
    async create(userId, dto) {
        await this.assertCategoryUsable(userId, dto.categoryId);
        if (dto.salaryIncomeId) {
            await this.assertSalaryUsable(userId, dto.salaryIncomeId);
        }
        return this.prisma.expense.create({
            data: {
                userId,
                amount: dto.amount,
                date: new Date(dto.date),
                categoryId: dto.categoryId,
                paymentMethod: dto.paymentMethod,
                description: dto.description,
                notes: dto.notes,
                salaryIncomeId: dto.salaryIncomeId ?? null,
            },
            include: { category: true, salaryIncome: { include: { job: true } } },
        });
    }
    async assignSalary(userId, dto) {
        await this.assertSalaryUsable(userId, dto.salaryIncomeId);
        const result = await this.prisma.expense.updateMany({
            where: {
                userId,
                id: { in: dto.expenseIds },
                salaryIncomeId: null,
            },
            data: { salaryIncomeId: dto.salaryIncomeId },
        });
        return { assigned: result.count };
    }
    async findOwn(userId, id) {
        const expense = await this.prisma.expense.findFirst({
            where: { id, userId },
        });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        return expense;
    }
    async update(userId, id, dto) {
        await this.findOwn(userId, id);
        if (dto.categoryId)
            await this.assertCategoryUsable(userId, dto.categoryId);
        if (dto.salaryIncomeId) {
            await this.assertSalaryUsable(userId, dto.salaryIncomeId);
        }
        return this.prisma.expense.update({
            where: { id },
            data: {
                ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
                ...(dto.date !== undefined ? { date: new Date(dto.date) } : {}),
                ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
                ...(dto.paymentMethod !== undefined
                    ? { paymentMethod: dto.paymentMethod }
                    : {}),
                ...(dto.description !== undefined
                    ? { description: dto.description }
                    : {}),
                ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
                ...(dto.salaryIncomeId !== undefined
                    ? { salaryIncomeId: dto.salaryIncomeId || null }
                    : {}),
            },
            include: { category: true, salaryIncome: { include: { job: true } } },
        });
    }
    async remove(userId, id) {
        await this.findOwn(userId, id);
        await this.prisma.expense.delete({ where: { id } });
        return { message: 'Deleted' };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map