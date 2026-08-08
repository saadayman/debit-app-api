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
var GoldPriceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoldPriceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const GRAMS_PER_TROY_OZ = 31.1034768;
const CACHE_TTL_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;
const GOLD_SYMBOL = 'XAU';
const SILVER_SYMBOL = 'XAG';
const GOLD_API_BASE_URL = 'https://api.gold-api.com';
const GOLD_API_SOURCE_URL = 'https://gold-api.com/';
const GOLD_KARATS = [24, 22, 21, 18, 14];
let GoldPriceService = GoldPriceService_1 = class GoldPriceService {
    prisma;
    logger = new common_1.Logger(GoldPriceService_1.name);
    cache = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    usdToJod() {
        const raw = Number(process.env.GOLD_USD_TO_JOD);
        return Number.isFinite(raw) && raw > 0 ? raw : 0.709;
    }
    retailMarkup() {
        const raw = Number(process.env.GOLD_RETAIL_MARKUP_PERCENT);
        return Number.isFinite(raw) && raw >= 0 ? raw / 100 : 0.05;
    }
    round2(n) {
        return Math.round(n * 100) / 100;
    }
    async fetchSpot(symbol) {
        const cached = this.cache.get(symbol);
        const fresh = cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS;
        if (fresh) {
            return {
                usdPerOz: cached.usdPerOz,
                fetchedAt: cached.fetchedAt,
                stale: false,
            };
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
            const res = await fetch(`${GOLD_API_BASE_URL}/price/${symbol}`, {
                signal: controller.signal,
                headers: { Accept: 'application/json' },
            });
            if (!res.ok)
                throw new Error(`status ${res.status}`);
            const data = (await res.json());
            const price = Number(data.price);
            if (!Number.isFinite(price) || price <= 0) {
                throw new Error('invalid price payload');
            }
            const entry = { usdPerOz: price, fetchedAt: new Date() };
            this.cache.set(symbol, entry);
            return { usdPerOz: price, fetchedAt: entry.fetchedAt, stale: false };
        }
        catch (err) {
            this.logger.warn(`Spot fetch failed for ${symbol}: ${String(err)}`);
            if (cached) {
                return {
                    usdPerOz: cached.usdPerOz,
                    fetchedAt: cached.fetchedAt,
                    stale: true,
                };
            }
            return null;
        }
        finally {
            clearTimeout(timer);
        }
    }
    async perGramPure(symbol) {
        const spot = await this.fetchSpot(symbol);
        if (!spot)
            return null;
        const perGram = (spot.usdPerOz / GRAMS_PER_TROY_OZ) * this.usdToJod();
        return { perGram, fetchedAt: spot.fetchedAt, stale: spot.stale };
    }
    async getGoldPrice() {
        const spot = await this.fetchSpot(GOLD_SYMBOL);
        if (!spot)
            return null;
        const purePerGram = (spot.usdPerOz / GRAMS_PER_TROY_OZ) * this.usdToJod();
        const meltByKarat = {};
        const retailByKarat = {};
        for (const karat of GOLD_KARATS) {
            const melt = purePerGram * (karat / 24);
            meltByKarat[String(karat)] = this.round2(melt);
            retailByKarat[String(karat)] = this.round2(melt * (1 + this.retailMarkup()));
        }
        return {
            currency: 'JOD',
            symbol: GOLD_SYMBOL,
            source: 'gold-api.com',
            sourceUrl: GOLD_API_SOURCE_URL,
            spotUsdPerOz: spot.usdPerOz,
            usdToJod: this.usdToJod(),
            updatedAt: spot.fetchedAt.toISOString(),
            stale: spot.stale,
            perGramPure: this.round2(purePerGram),
            perGramByKarat: retailByKarat,
            perGramBuyByKarat: meltByKarat,
        };
    }
    async getSilverPerGramPure() {
        return this.perGramPure(SILVER_SYMBOL);
    }
    async valueGold(weightGrams, karat) {
        const price = await this.getGoldPrice();
        if (!price)
            return null;
        const perGram = price.perGramBuyByKarat[String(karat)] ??
            price.perGramPure * (karat / 24);
        return this.round2(weightGrams * perGram);
    }
    async valueSilver(weightGrams, purityPermille) {
        const pure = await this.getSilverPerGramPure();
        if (!pure)
            return null;
        return this.round2(weightGrams * pure.perGram * (purityPermille / 1000));
    }
    async getDailyMovement() {
        const price = await this.getGoldPrice();
        if (!price)
            return null;
        const today = new Date();
        const dayKey = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        const previous = await this.prisma.goldPriceSnapshot.findFirst({
            where: { date: { lt: dayKey } },
            orderBy: { date: 'desc' },
        });
        await this.prisma.goldPriceSnapshot.upsert({
            where: { date: dayKey },
            create: {
                date: dayKey,
                spotUsdPerOz: price.spotUsdPerOz,
                perGram24kJod: price.perGramPure,
            },
            update: {
                spotUsdPerOz: price.spotUsdPerOz,
                perGram24kJod: price.perGramPure,
            },
        });
        if (!previous)
            return null;
        const prev = Number(previous.perGram24kJod);
        if (prev <= 0)
            return null;
        const percentChange = this.round2(((price.perGramPure - prev) / prev) * 100);
        return {
            perGram24kJod: price.perGramPure,
            previousPerGram24kJod: prev,
            percentChange,
            direction: percentChange >= 0 ? 'up' : 'down',
        };
    }
};
exports.GoldPriceService = GoldPriceService;
exports.GoldPriceService = GoldPriceService = GoldPriceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoldPriceService);
//# sourceMappingURL=gold-price.service.js.map