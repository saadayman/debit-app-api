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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(userId) {
        return this.prisma.category.findMany({
            where: { OR: [{ isDefault: true, userId: null }, { userId }] },
            orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        });
    }
    create(userId, dto) {
        return this.prisma.category.create({
            data: { ...dto, userId, isDefault: false },
        });
    }
    async findOwn(userId, id) {
        const category = await this.prisma.category.findFirst({
            where: { id, userId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found or not editable');
        }
        return category;
    }
    async update(userId, id, dto) {
        await this.findOwn(userId, id);
        return this.prisma.category.update({ where: { id }, data: dto });
    }
    async remove(userId, id) {
        await this.findOwn(userId, id);
        try {
            await this.prisma.category.delete({ where: { id } });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2003') {
                throw new common_1.ConflictException('Category is in use by expenses or recurring payments');
            }
            throw e;
        }
        return { message: 'Deleted' };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map