import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateSavingsAssetDto, UpdateSavingsAssetDto } from './dto/savings.dto';
import { SavingsService } from './savings.service';
export declare class SavingsController {
    private savings;
    constructor(savings: SavingsService);
    list(user: AuthUser): Promise<{
        currency: string;
        total: number;
        byType: Record<string, number>;
        goldPrice: import("../prices/gold-price.service").GoldPrice | null;
        assets: import("./savings.service").ValuedAsset[];
    }>;
    create(user: AuthUser, dto: CreateSavingsAssetDto): Promise<{
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
    update(user: AuthUser, id: string, dto: UpdateSavingsAssetDto): Promise<{
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
    remove(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
}
