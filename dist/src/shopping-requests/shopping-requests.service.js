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
exports.ShoppingRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ShoppingRequestsService = class ShoppingRequestsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async membership(userId) {
        const member = await this.prisma.householdMember.findUnique({ where: { userId } });
        if (!member)
            throw new common_1.ForbiddenException('Household membership required');
        return member;
    }
    async assertCategoryUsable(userId, categoryId) {
        const member = await this.membership(userId);
        const owner = member.role === 'REQUESTER'
            ? await this.prisma.householdMember.findFirst({ where: { householdId: member.householdId, role: 'OWNER' } })
            : null;
        const category = await this.prisma.category.findFirst({
            where: {
                id: categoryId,
                OR: [{ isDefault: true, userId: null }, { userId: owner?.userId ?? userId }],
            },
        });
        if (!category)
            throw new common_1.BadRequestException('Unknown category');
    }
    async findPending(userId, id) {
        const member = await this.membership(userId);
        const request = await this.prisma.shoppingRequest.findFirst({
            where: { id, householdId: member.householdId, ...(member.role === 'REQUESTER' ? { userId } : {}) },
        });
        if (!request)
            throw new common_1.NotFoundException('Shopping request not found');
        if (request.status !== 'PENDING') {
            throw new common_1.BadRequestException('Shopping request is already resolved');
        }
        return request;
    }
    list(userId, query) {
        return this.membership(userId).then((member) => this.prisma.shoppingRequest.findMany({
            where: {
                householdId: member.householdId,
                ...(member.role === 'REQUESTER' ? { userId } : {}),
                ...(query.status ? { status: query.status } : {}),
                ...(query.categoryId ? { categoryId: query.categoryId } : {}),
            },
            include: { category: true, expense: member.role === 'OWNER' },
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        }));
    }
    async create(userId, dto) {
        const member = await this.membership(userId);
        await this.assertCategoryUsable(userId, dto.categoryId);
        return this.prisma.shoppingRequest.create({
            data: { userId, householdId: member.householdId, ...dto },
            include: { category: true, expense: true },
        });
    }
    async purchase(userId, id, dto) {
        const member = await this.membership(userId);
        if (member.role !== 'OWNER')
            throw new common_1.ForbiddenException('Only the household owner can approve purchases');
        const request = await this.findPending(userId, id);
        if (dto.salaryIncomeId) {
            const salary = await this.prisma.income.findFirst({
                where: { id: dto.salaryIncomeId, userId, source: 'SALARY' },
            });
            if (!salary)
                throw new common_1.BadRequestException('Unknown salary payment');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.shoppingRequest.updateMany({
                where: { id, userId, status: 'PENDING' },
                data: { status: 'PURCHASED', resolvedAt: new Date() },
            });
            if (updated.count !== 1) {
                throw new common_1.BadRequestException('Shopping request is already resolved');
            }
            const expense = await tx.expense.create({
                data: {
                    userId,
                    amount: dto.amount,
                    date: new Date(dto.date),
                    categoryId: request.categoryId,
                    paymentMethod: dto.paymentMethod,
                    description: request.name,
                    notes: request.notes,
                    salaryIncomeId: dto.salaryIncomeId || null,
                },
            });
            return tx.shoppingRequest.update({
                where: { id },
                data: { expenseId: expense.id },
                include: { category: true, expense: true },
            });
        });
    }
    async reject(userId, id) {
        const member = await this.membership(userId);
        if (member.role !== 'OWNER')
            throw new common_1.ForbiddenException('Only the household owner can reject requests');
        await this.findPending(userId, id);
        return this.prisma.shoppingRequest.update({
            where: { id },
            data: { status: 'REJECTED', resolvedAt: new Date() },
            include: { category: true, expense: true },
        });
    }
    async remove(userId, id) {
        const member = await this.membership(userId);
        const request = await this.prisma.shoppingRequest.findFirst({
            where: { id, householdId: member.householdId, ...(member.role === 'REQUESTER' ? { userId, status: 'PENDING' } : {}) },
        });
        if (!request)
            throw new common_1.NotFoundException('Shopping request not found');
        await this.prisma.shoppingRequest.delete({ where: { id } });
        return { message: 'Deleted' };
    }
};
exports.ShoppingRequestsService = ShoppingRequestsService;
exports.ShoppingRequestsService = ShoppingRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShoppingRequestsService);
//# sourceMappingURL=shopping-requests.service.js.map