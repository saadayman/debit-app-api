import { PartialType } from '@nestjs/swagger';
import { AssetType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { GOLD_FORM_KEYS } from '../gold-forms';

export class CreateSavingsAssetDto {
  @IsEnum(AssetType)
  type: AssetType;

  @IsString()
  @MaxLength(100)
  name: string;

  /** GOLD/SILVER: weight in grams */
  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  weightGrams?: number;

  /** GOLD: purity in karat */
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  karat?: number;

  /** GOLD: standard form/unit (RASHADI_LIRA, SOVEREIGN, BAR, JEWELLERY) */
  @IsOptional()
  @IsString()
  @IsIn(GOLD_FORM_KEYS)
  goldForm?: string;

  /** GOLD: number of coins for counted forms */
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  /** SILVER: purity per-mille (default 999) */
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  purityPermille?: number;

  /** CASH/OTHER: fixed value in JOD */
  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateSavingsAssetDto extends PartialType(CreateSavingsAssetDto) {}
