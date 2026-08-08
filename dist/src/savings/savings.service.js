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
exports.SavingsService = exports.VALUATION_CURRENCY = void 0;
const common_1 = require("@nestjs/common");
const gold_price_service_1 = require("../prices/gold-price.service");
const prisma_service_1 = require("../prisma/prisma.service");
const gold_forms_1 = require("./gold-forms");
exports.VALUATION_CURRENCY = 'JOD';
const DEFAULT_SILVER_PERMILLE = 999;
let SavingsService = class SavingsService {
    prisma;
    goldPrice;
    constructor(prisma, goldPrice) {
        this.prisma = prisma;
        this.goldPrice = goldPrice;
    }
    validate(dto) {
        if (dto.type === 'GOLD') {
            const spec = dto.goldForm ? gold_forms_1.GOLD_FORMS[dto.goldForm] : undefined;
            if (spec?.counted) {
                if (dto.quantity == null) {
                    throw new common_1.BadRequestException(`${dto.goldForm} requires a quantity`);
                }
            }
            else if (dto.weightGrams == null || dto.karat == null) {
                throw new common_1.BadRequestException('Gold requires weightGrams and karat');
            }
        }
        else if (dto.type === 'SILVER') {
            if (dto.weightGrams == null) {
                throw new common_1.BadRequestException('Silver requires weightGrams');
            }
        }
        else if (dto.amount == null) {
            throw new common_1.BadRequestException(`${dto.type} requires an amount`);
        }
    }
    valueOne(asset, goldBuyByKarat, silverPerGramPure) {
        if (asset.type === 'GOLD') {
            if (goldBuyByKarat == null ||
                asset.weightGrams == null ||
                asset.karat == null) {
                return { value: null, priceUnavailable: true };
            }
            const perGram = goldBuyByKarat[String(asset.karat)] ??
                (goldBuyByKarat['24'] != null
                    ? (goldBuyByKarat['24'] * asset.karat) / 24
                    : null);
            if (perGram == null) {
                return { value: null, priceUnavailable: true };
            }
            const grams = Number(asset.weightGrams);
            const value = Math.round(grams * perGram * 100) / 100;
            return { value, priceUnavailable: false };
        }
        if (asset.type === 'SILVER') {
            if (silverPerGramPure == null || asset.weightGrams == null) {
                return { value: null, priceUnavailable: true };
            }
            const grams = Number(asset.weightGrams);
            const permille = asset.purityPermille ?? DEFAULT_SILVER_PERMILLE;
            const value = Math.round(grams * silverPerGramPure * (permille / 1000) * 100) / 100;
            return { value, priceUnavailable: false };
        }
        return {
            value: asset.amount != null ? Number(asset.amount) : 0,
            priceUnavailable: false,
        };
    }
    async list(userId) {
        const [assets, goldPrice, silver] = await Promise.all([
            this.prisma.savingsAsset.findMany({
                where: { userId },
                include: { debtRepayment: { select: { id: true, debtId: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.goldPrice.getGoldPrice(),
            this.goldPrice.getSilverPerGramPure(),
        ]);
        const goldBuyByKarat = goldPrice?.perGramBuyByKarat ?? null;
        const silverPerGramPure = silver?.perGram ?? null;
        const valued = [];
        for (const asset of assets) {
            const { value, priceUnavailable } = this.valueOne(asset, goldBuyByKarat, silverPerGramPure);
            valued.push({ ...asset, value, priceUnavailable });
        }
        const total = valued.reduce((s, a) => s + (a.value ?? 0), 0);
        const byType = valued.reduce((acc, a) => {
            acc[a.type] = (acc[a.type] ?? 0) + (a.value ?? 0);
            return acc;
        }, {});
        return {
            currency: exports.VALUATION_CURRENCY,
            total: Math.round(total * 100) / 100,
            byType,
            goldPrice,
            assets: valued,
        };
    }
    async total(userId) {
        const { total } = await this.list(userId);
        return total;
    }
    resolveGoldFields(dto) {
        const spec = dto.goldForm ? gold_forms_1.GOLD_FORMS[dto.goldForm] : undefined;
        if (spec?.counted && spec.gramsPerUnit != null) {
            const qty = dto.quantity ?? 1;
            return {
                weightGrams: (0, gold_forms_1.roundGrams)(qty * spec.gramsPerUnit),
                karat: spec.karat,
                goldForm: dto.goldForm ?? null,
                quantity: qty,
            };
        }
        return {
            weightGrams: dto.weightGrams ?? null,
            karat: dto.karat ?? null,
            goldForm: dto.goldForm ?? null,
            quantity: null,
        };
    }
    async create(userId, dto) {
        this.validate(dto);
        const gold = dto.type === 'GOLD' ? this.resolveGoldFields(dto) : null;
        return this.prisma.savingsAsset.create({
            data: {
                userId,
                type: dto.type,
                name: dto.name,
                weightGrams: gold
                    ? gold.weightGrams
                    : dto.type === 'SILVER'
                        ? (dto.weightGrams ?? null)
                        : null,
                karat: gold?.karat ?? null,
                goldForm: gold?.goldForm ?? null,
                quantity: gold?.quantity ?? null,
                purityPermille: dto.type === 'SILVER' ? (dto.purityPermille ?? null) : null,
                amount: dto.type === 'CASH' || dto.type === 'OTHER'
                    ? (dto.amount ?? null)
                    : null,
                notes: dto.notes,
            },
        });
    }
    async findOwn(userId, id) {
        const asset = await this.prisma.savingsAsset.findFirst({
            where: { id, userId },
            include: { debtRepayment: { select: { id: true, debtId: true } } },
        });
        if (!asset)
            throw new common_1.NotFoundException('Savings asset not found');
        return asset;
    }
    async update(userId, id, dto) {
        const existing = await this.findOwn(userId, id);
        if (existing.debtRepayment) {
            throw new common_1.BadRequestException('Edit this cash repayment from its debt record.');
        }
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.notes !== undefined)
            data.notes = dto.notes;
        if (existing.type === 'GOLD') {
            const gold = this.resolveGoldFields({
                goldForm: dto.goldForm ?? existing.goldForm ?? undefined,
                quantity: dto.quantity ?? existing.quantity ?? undefined,
                weightGrams: dto.weightGrams ??
                    (existing.weightGrams != null
                        ? Number(existing.weightGrams)
                        : undefined),
                karat: dto.karat ?? existing.karat ?? undefined,
            });
            data.goldForm = gold.goldForm;
            data.quantity = gold.quantity;
            data.weightGrams = gold.weightGrams;
            data.karat = gold.karat;
        }
        else {
            if (dto.weightGrams !== undefined)
                data.weightGrams = dto.weightGrams;
            if (dto.karat !== undefined)
                data.karat = dto.karat;
            if (dto.purityPermille !== undefined) {
                data.purityPermille = dto.purityPermille;
            }
            if (dto.amount !== undefined)
                data.amount = dto.amount;
        }
        return this.prisma.savingsAsset.update({ where: { id }, data });
    }
    async remove(userId, id) {
        const asset = await this.findOwn(userId, id);
        if (asset.debtRepayment) {
            throw new common_1.BadRequestException('Delete this cash repayment from its debt record.');
        }
        await this.prisma.savingsAsset.delete({ where: { id } });
        return { message: 'Deleted' };
    }
};
exports.SavingsService = SavingsService;
exports.SavingsService = SavingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gold_price_service_1.GoldPriceService])
], SavingsService);
//# sourceMappingURL=savings.service.js.map