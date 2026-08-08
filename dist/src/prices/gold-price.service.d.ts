import { PrismaService } from '../prisma/prisma.service';
export interface MetalPrice {
    currency: string;
    symbol: string;
    spotUsdPerOz: number;
    usdToJod: number;
    updatedAt: string;
    stale: boolean;
    perGramPure: number;
}
export interface GoldPrice extends MetalPrice {
    source: string;
    sourceUrl: string;
    perGramByKarat: Record<string, number>;
    perGramBuyByKarat: Record<string, number>;
}
export declare class GoldPriceService {
    private prisma;
    private readonly logger;
    private cache;
    constructor(prisma: PrismaService);
    private usdToJod;
    private retailMarkup;
    private round2;
    private fetchSpot;
    private perGramPure;
    getGoldPrice(): Promise<GoldPrice | null>;
    getSilverPerGramPure(): Promise<{
        perGram: number;
        fetchedAt: Date;
        stale: boolean;
    } | null>;
    valueGold(weightGrams: number, karat: number): Promise<number | null>;
    valueSilver(weightGrams: number, purityPermille: number): Promise<number | null>;
    getDailyMovement(): Promise<{
        perGram24kJod: number;
        previousPerGram24kJod: number;
        percentChange: number;
        direction: 'up' | 'down';
    } | null>;
}
