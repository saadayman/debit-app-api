import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const GRAMS_PER_TROY_OZ = 31.1034768;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const FETCH_TIMEOUT_MS = 8000;
const GOLD_SYMBOL = 'XAU';
const SILVER_SYMBOL = 'XAG';
const GOLD_API_BASE_URL = 'https://api.gold-api.com';
const GOLD_API_SOURCE_URL = 'https://gold-api.com/';
const GOLD_KARATS = [24, 22, 21, 18, 14] as const;

interface SpotCacheEntry {
  usdPerOz: number;
  fetchedAt: Date;
}

export interface MetalPrice {
  /** Valuation currency (JOD) */
  currency: string;
  symbol: string;
  spotUsdPerOz: number;
  usdToJod: number;
  updatedAt: string;
  /** true when the live fetch failed and we fell back to a cached value */
  stale: boolean;
  perGramPure: number;
}

export interface GoldPrice extends MetalPrice {
  /** Where the spot price came from, e.g. "gold-api.com" */
  source: string;
  sourceUrl: string;
  /** Estimated retail price per gram in JOD by karat. */
  perGramByKarat: Record<string, number>;
  /** Spot/melt value per gram in JOD by karat. */
  perGramBuyByKarat: Record<string, number>;
}

/**
 * Gold and silver use gold-api.com's free, keyless spot endpoint. USD/troy-oz
 * is converted to JOD/gram, then scaled by purity. Gold's displayed retail
 * figure adds a configurable estimate; holdings use the more conservative
 * spot/melt value. JOD is pegged to USD, with a default rate of 0.709 that can
 * be overridden through GOLD_USD_TO_JOD.
 */
@Injectable()
export class GoldPriceService {
  private readonly logger = new Logger(GoldPriceService.name);
  private cache = new Map<string, SpotCacheEntry>();

  constructor(private prisma: PrismaService) {}

  private usdToJod(): number {
    const raw = Number(process.env.GOLD_USD_TO_JOD);
    return Number.isFinite(raw) && raw > 0 ? raw : 0.709;
  }

  private retailMarkup(): number {
    const raw = Number(process.env.GOLD_RETAIL_MARKUP_PERCENT);
    return Number.isFinite(raw) && raw >= 0 ? raw / 100 : 0.05;
  }

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  private async fetchSpot(
    symbol: string,
  ): Promise<{ usdPerOz: number; fetchedAt: Date; stale: boolean } | null> {
    const cached = this.cache.get(symbol);
    const fresh =
      cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS;
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
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as { price?: number };
      const price = Number(data.price);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error('invalid price payload');
      }
      const entry: SpotCacheEntry = { usdPerOz: price, fetchedAt: new Date() };
      this.cache.set(symbol, entry);
      return { usdPerOz: price, fetchedAt: entry.fetchedAt, stale: false };
    } catch (err) {
      this.logger.warn(`Spot fetch failed for ${symbol}: ${String(err)}`);
      // Fall back to a stale cached value if we have one; otherwise give up.
      if (cached) {
        return {
          usdPerOz: cached.usdPerOz,
          fetchedAt: cached.fetchedAt,
          stale: true,
        };
      }
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  /** JOD price per gram of pure (24k / .999) metal, or null if unavailable. */
  private async perGramPure(symbol: string) {
    const spot = await this.fetchSpot(symbol);
    if (!spot) return null;
    const perGram = (spot.usdPerOz / GRAMS_PER_TROY_OZ) * this.usdToJod();
    return { perGram, fetchedAt: spot.fetchedAt, stale: spot.stale };
  }

  async getGoldPrice(): Promise<GoldPrice | null> {
    const spot = await this.fetchSpot(GOLD_SYMBOL);
    if (!spot) return null;

    const purePerGram = (spot.usdPerOz / GRAMS_PER_TROY_OZ) * this.usdToJod();
    const meltByKarat: Record<string, number> = {};
    const retailByKarat: Record<string, number> = {};
    for (const karat of GOLD_KARATS) {
      const melt = purePerGram * (karat / 24);
      meltByKarat[String(karat)] = this.round2(melt);
      retailByKarat[String(karat)] = this.round2(
        melt * (1 + this.retailMarkup()),
      );
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

  async getSilverPerGramPure(): Promise<{
    perGram: number;
    fetchedAt: Date;
    stale: boolean;
  } | null> {
    return this.perGramPure(SILVER_SYMBOL);
  }

  /** Live JOD melt value of a gold holding at its stated karat. */
  async valueGold(weightGrams: number, karat: number): Promise<number | null> {
    const price = await this.getGoldPrice();
    if (!price) return null;
    const perGram =
      price.perGramBuyByKarat[String(karat)] ??
      price.perGramPure * (karat / 24);
    return this.round2(weightGrams * perGram);
  }

  /** Live JOD value of a silver holding, or null if the price is unavailable. */
  async valueSilver(
    weightGrams: number,
    purityPermille: number,
  ): Promise<number | null> {
    const pure = await this.getSilverPerGramPure();
    if (!pure) return null;
    return this.round2(weightGrams * pure.perGram * (purityPermille / 1000));
  }

  /**
   * Records today's gold price (once per day) and returns the change versus the
   * most recent earlier snapshot. Self-maintaining: no cron required, since the
   * daily row is upserted lazily whenever this is called.
   */
  async getDailyMovement(): Promise<{
    perGram24kJod: number;
    previousPerGram24kJod: number;
    percentChange: number;
    direction: 'up' | 'down';
  } | null> {
    const price = await this.getGoldPrice();
    if (!price) return null;

    const today = new Date();
    const dayKey = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );

    // Find the newest snapshot from a previous day before touching today's row.
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

    if (!previous) return null;
    const prev = Number(previous.perGram24kJod);
    if (prev <= 0) return null;
    const percentChange = this.round2(
      ((price.perGramPure - prev) / prev) * 100,
    );
    return {
      perGram24kJod: price.perGramPure,
      previousPerGram24kJod: prev,
      percentChange,
      direction: percentChange >= 0 ? 'up' : 'down',
    };
  }
}
