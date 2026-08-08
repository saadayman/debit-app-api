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
exports.InstallmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InstallmentsService = class InstallmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    withComputed(installment) {
        const total = Number(installment.totalPrice);
        const downPayment = Number(installment.downPayment);
        const recordedExpenseCount = installment._count?.expenses ?? 0;
        const effectivePaidInstallments = Math.min(installment.paidInstallments + recordedExpenseCount, installment.totalInstallments);
        const paidAmount = Math.min(downPayment +
            effectivePaidInstallments * Number(installment.monthlyAmount), total);
        return {
            ...installment,
            paidInstallments: effectivePaidInstallments,
            historicalPaidInstallments: installment.paidInstallments,
            recordedExpenseCount,
            remainingInstallments: paidAmount >= total
                ? 0
                : installment.totalInstallments - effectivePaidInstallments,
            paidAmount,
            remainingBalance: Math.max(total - paidAmount, 0),
            percentPaid: total > 0 ? (paidAmount / total) * 100 : 0,
        };
    }
    async list(userId) {
        const items = await this.prisma.installment.findMany({
            where: { userId },
            include: {
                salaryIncome: { include: { job: true } },
                _count: { select: { expenses: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return items.map((i) => this.withComputed(i));
    }
    async findOwn(userId, id) {
        const installment = await this.prisma.installment.findFirst({
            where: { id, userId },
            include: {
                salaryIncome: { include: { job: true } },
                _count: { select: { expenses: true } },
            },
        });
        if (!installment)
            throw new common_1.NotFoundException('Installment not found');
        return installment;
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
        return salary;
    }
    async resolveSalary(userId, salaryIncomeId) {
        if (salaryIncomeId) {
            return this.assertSalaryUsable(userId, salaryIncomeId);
        }
        const salary = await this.prisma.income.findFirst({
            where: { userId, source: 'SALARY' },
            orderBy: { date: 'desc' },
        });
        if (!salary) {
            throw new common_1.BadRequestException('Record a salary payment before adding an installment');
        }
        return salary;
    }
    async create(userId, dto) {
        if ((dto.paidInstallments ?? 0) > dto.totalInstallments) {
            throw new common_1.BadRequestException('paidInstallments cannot exceed totalInstallments');
        }
        const salary = await this.resolveSalary(userId, dto.salaryIncomeId);
        const installment = await this.prisma.installment.create({
            data: {
                userId,
                name: dto.name,
                totalPrice: dto.totalPrice,
                downPayment: dto.downPayment ?? 0,
                monthlyAmount: dto.monthlyAmount,
                totalInstallments: dto.totalInstallments,
                paidInstallments: dto.paidInstallments ?? 0,
                startDate: new Date(dto.startDate),
                salaryIncomeId: salary.id,
                notes: dto.notes,
            },
            include: {
                salaryIncome: { include: { job: true } },
                _count: { select: { expenses: true } },
            },
        });
        return this.withComputed(installment);
    }
    async update(userId, id, dto) {
        const current = await this.findOwn(userId, id);
        const total = dto.totalInstallments ?? current.totalInstallments;
        const recordedPaymentCount = current._count.expenses;
        const paid = dto.paidInstallments ?? current.paidInstallments + recordedPaymentCount;
        if (paid > total) {
            throw new common_1.BadRequestException('paidInstallments cannot exceed totalInstallments');
        }
        if (dto.paidInstallments !== undefined) {
            if (paid < recordedPaymentCount) {
                throw new common_1.BadRequestException(`paidInstallments cannot be lower than ${recordedPaymentCount} recorded expense payments`);
            }
        }
        if (dto.salaryIncomeId) {
            await this.assertSalaryUsable(userId, dto.salaryIncomeId);
        }
        const installment = await this.prisma.installment.update({
            where: { id },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.totalPrice !== undefined ? { totalPrice: dto.totalPrice } : {}),
                ...(dto.downPayment !== undefined
                    ? { downPayment: dto.downPayment }
                    : {}),
                ...(dto.monthlyAmount !== undefined
                    ? { monthlyAmount: dto.monthlyAmount }
                    : {}),
                ...(dto.totalInstallments !== undefined
                    ? { totalInstallments: dto.totalInstallments }
                    : {}),
                ...(dto.paidInstallments !== undefined
                    ? { paidInstallments: dto.paidInstallments - recordedPaymentCount }
                    : {}),
                ...(dto.startDate !== undefined
                    ? { startDate: new Date(dto.startDate) }
                    : {}),
                ...(dto.salaryIncomeId !== undefined
                    ? { salaryIncomeId: dto.salaryIncomeId }
                    : {}),
                ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
            },
            include: {
                salaryIncome: { include: { job: true } },
                _count: { select: { expenses: true } },
            },
        });
        return this.withComputed(installment);
    }
    async pay(userId, id, dto) {
        await this.assertCategoryUsable(userId, dto.categoryId);
        const salary = await this.resolveSalary(userId, dto.salaryIncomeId);
        return this.prisma.$transaction(async (tx) => {
            const installment = await tx.installment.findFirst({
                where: { id, userId },
                include: { _count: { select: { expenses: true } } },
            });
            if (!installment)
                throw new common_1.NotFoundException('Installment not found');
            const paidInstallments = installment.paidInstallments + installment._count.expenses;
            if (paidInstallments >= installment.totalInstallments) {
                throw new common_1.BadRequestException('Installment is already fully paid');
            }
            const remaining = Math.max(Number(installment.totalPrice) -
                Number(installment.downPayment) -
                paidInstallments * Number(installment.monthlyAmount), 0);
            const amount = Math.min(Number(installment.monthlyAmount), remaining);
            if (amount <= 0) {
                throw new common_1.BadRequestException('Installment is already fully paid');
            }
            const expense = await tx.expense.create({
                data: {
                    userId,
                    amount,
                    date: new Date(dto.date),
                    categoryId: dto.categoryId,
                    paymentMethod: dto.paymentMethod,
                    description: installment.name,
                    salaryIncomeId: salary.id,
                    installmentId: installment.id,
                },
                include: {
                    category: true,
                    salaryIncome: { include: { job: true } },
                },
            });
            return {
                installment: this.withComputed({
                    ...installment,
                    _count: { expenses: installment._count.expenses + 1 },
                }),
                expense,
            };
        });
    }
    async remove(userId, id) {
        await this.findOwn(userId, id);
        await this.prisma.installment.delete({ where: { id } });
        return { message: 'Deleted' };
    }
};
exports.InstallmentsService = InstallmentsService;
exports.InstallmentsService = InstallmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InstallmentsService);
//# sourceMappingURL=installments.service.js.map