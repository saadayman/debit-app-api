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
exports.IncomeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IncomeService = class IncomeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertJobUsable(userId, jobId) {
        const job = await this.prisma.job.findFirst({
            where: { id: jobId, userId },
        });
        if (!job)
            throw new common_1.BadRequestException('Unknown job');
    }
    list(userId, query) {
        return this.prisma.income.findMany({
            where: {
                userId,
                ...(query.source ? { source: query.source } : {}),
                date: {
                    ...(query.from ? { gte: new Date(query.from) } : {}),
                    ...(query.to ? { lte: new Date(query.to) } : {}),
                },
            },
            include: {
                job: true,
                debtRepayment: { select: { id: true, debtId: true } },
            },
            orderBy: { date: 'desc' },
            take: 200,
        });
    }
    async create(userId, dto) {
        if (dto.jobId)
            await this.assertJobUsable(userId, dto.jobId);
        return this.prisma.income.create({
            data: {
                userId,
                amount: dto.amount,
                date: new Date(dto.date),
                source: dto.source,
                jobId: dto.jobId ?? null,
                description: dto.description,
                notes: dto.notes,
            },
            include: { job: true },
        });
    }
    async findOwn(userId, id) {
        const income = await this.prisma.income.findFirst({
            where: { id, userId },
            include: { debtRepayment: { select: { id: true, debtId: true } } },
        });
        if (!income)
            throw new common_1.NotFoundException('Income not found');
        return income;
    }
    async update(userId, id, dto) {
        const income = await this.findOwn(userId, id);
        if (income.debtRepayment) {
            throw new common_1.BadRequestException('Edit this received repayment from its debt record.');
        }
        if (dto.jobId)
            await this.assertJobUsable(userId, dto.jobId);
        return this.prisma.income.update({
            where: { id },
            data: {
                ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
                ...(dto.date !== undefined ? { date: new Date(dto.date) } : {}),
                ...(dto.source !== undefined ? { source: dto.source } : {}),
                ...(dto.jobId !== undefined ? { jobId: dto.jobId || null } : {}),
                ...(dto.description !== undefined
                    ? { description: dto.description }
                    : {}),
                ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
            },
            include: { job: true },
        });
    }
    async remove(userId, id) {
        const income = await this.findOwn(userId, id);
        if (income.debtRepayment) {
            throw new common_1.BadRequestException('Delete this received repayment from its debt record.');
        }
        await this.prisma.income.delete({ where: { id } });
        return { message: 'Deleted' };
    }
};
exports.IncomeService = IncomeService;
exports.IncomeService = IncomeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IncomeService);
//# sourceMappingURL=income.service.js.map