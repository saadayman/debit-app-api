import { AssetType } from '@prisma/client';
export declare class CreateSavingsAssetDto {
    type: AssetType;
    name: string;
    weightGrams?: number;
    karat?: number;
    goldForm?: string;
    quantity?: number;
    purityPermille?: number;
    amount?: number;
    notes?: string;
}
declare const UpdateSavingsAssetDto_base: import("@nestjs/common").Type<Partial<CreateSavingsAssetDto>>;
export declare class UpdateSavingsAssetDto extends UpdateSavingsAssetDto_base {
}
export {};
