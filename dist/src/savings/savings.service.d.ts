import { SavingsAsset } from '@prisma/client';
import { GoldPriceService } from '../prices/gold-price.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingsAssetDto, UpdateSavingsAssetDto } from './dto/savings.dto';
export declare const VALUATION_CURRENCY = "JOD";
export interface ValuedAsset extends SavingsAsset {
    debtRepayment?: {
        id: string;
        debtId: string;
    } | null;
    value: number | null;
    priceUnavailable: boolean;
}
export declare class SavingsService {
    private prisma;
    private goldPrice;
    constructor(prisma: PrismaService, goldPrice: GoldPriceService);
    private validate;
    private valueOne;
    list(userId: string): Promise<{
        currency: string;
        total: number;
        byType: Record<string, number>;
        goldPrice: import("../prices/gold-price.service").GoldPrice | null;
        assets: ValuedAsset[];
    }>;
    total(userId: string): Promise<number>;
    private resolveGoldFields;
    create(userId: string, dto: CreateSavingsAssetDto): Promise<{
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.AssetType;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal | null;
        weightGrams: import("@prisma/client/runtime/library").Decimal | null;
        karat: number | null;
        goldForm: string | null;
        quantity: number | null;
        purityPermille: number | null;
    }>;
    private findOwn;
    update(userId: string, id: string, dto: UpdateSavingsAssetDto): Promise<{
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.AssetType;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal | null;
        weightGrams: import("@prisma/client/runtime/library").Decimal | null;
        karat: number | null;
        goldForm: string | null;
        quantity: number | null;
        purityPermille: number | null;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
