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
exports.JobsService = void 0;
exports.nextPayday = nextPayday;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function nextPayday(payDayOfMonth, from = new Date()) {
    const year = from.getUTCFullYear();
    const month = from.getUTCMonth();
    const today = from.getUTCDate();
    const clampedThis = Math.min(payDayOfMonth, new Date(Date.UTC(year, month + 1, 0)).getUTCDate());
    if (today <= clampedThis) {
        return new Date(Date.UTC(year, month, clampedThis));
    }
    const clampedNext = Math.min(payDayOfMonth, new Date(Date.UTC(year, month + 2, 0)).getUTCDate());
    return new Date(Date.UTC(year, month + 1, clampedNext));
}
let JobsService = class JobsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    withComputed(job) {
        const scheduled = job.payDayOfMonth != null;
        const next = scheduled && job.active ? nextPayday(job.payDayOfMonth) : null;
        return {
            ...job,
            scheduled,
            nextPayday: next ? next.toISOString() : null,
        };
    }
    async list(userId) {
        const jobs = await this.prisma.job.findMany({
            where: { userId },
            orderBy: [{ active: 'desc' }, { createdAt: 'asc' }],
        });
        return jobs.map((j) => this.withComputed(j));
    }
    async create(userId, dto) {
        const job = await this.prisma.job.create({
            data: {
                userId,
                name: dto.name,
                type: dto.type,
                employer: dto.employer,
                expectedAmount: dto.expectedAmount ?? null,
                payDayOfMonth: dto.payDayOfMonth ?? null,
                active: dto.active ?? true,
                notes: dto.notes,
            },
        });
        return this.withComputed(job);
    }
    async findOwn(userId, id) {
        const job = await this.prisma.job.findFirst({ where: { id, userId } });
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        return job;
    }
    async update(userId, id, dto) {
        await this.findOwn(userId, id);
        const job = await this.prisma.job.update({
            where: { id },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.type !== undefined ? { type: dto.type } : {}),
                ...(dto.employer !== undefined ? { employer: dto.employer } : {}),
                ...(dto.expectedAmount !== undefined
                    ? { expectedAmount: dto.expectedAmount }
                    : {}),
                ...(dto.payDayOfMonth !== undefined
                    ? { payDayOfMonth: dto.payDayOfMonth }
                    : {}),
                ...(dto.active !== undefined ? { active: dto.active } : {}),
                ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
            },
        });
        return this.withComputed(job);
    }
    async remove(userId, id) {
        await this.findOwn(userId, id);
        await this.prisma.job.delete({ where: { id } });
        return { message: 'Deleted' };
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map