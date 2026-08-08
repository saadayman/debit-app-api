import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class CreateCarDto {
  @IsString()
  @MaxLength(50)
  make: string;

  @IsString()
  @MaxLength(50)
  model: string;

  @Type(() => Number)
  @IsInt()
  @Min(1886)
  @Max(2100)
  year: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  odometerKm: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  dailyCommuteKm: number;

  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  commuteDays: number[];

  @IsOptional()
  @IsBoolean()
  autoTrackingEnabled?: boolean;

  @Matches(DATE_PATTERN)
  asOfDate: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  lastOilChangeOdometerKm: number;
}

class UpdateCarFieldsDto {
  @IsString()
  @MaxLength(50)
  make: string;

  @IsString()
  @MaxLength(50)
  model: string;

  @Type(() => Number)
  @IsInt()
  @Min(1886)
  @Max(2100)
  year: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  dailyCommuteKm: number;

  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  commuteDays: number[];

  @IsBoolean()
  autoTrackingEnabled: boolean;

  @Matches(DATE_PATTERN)
  asOfDate: string;
}

export class UpdateCarDto extends PartialType(UpdateCarFieldsDto) {}

export class AddDriveDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @IsPositive()
  @Max(5000)
  distanceKm: number;

  @Matches(DATE_PATTERN)
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class RecordOdometerDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  odometerKm: number;

  @Matches(DATE_PATTERN)
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CreateMaintenanceItemDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @IsPositive()
  intervalKm: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  lastServiceOdometerKm?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateMaintenanceItemDto extends PartialType(
  CreateMaintenanceItemDto,
) {}

export class CompleteMaintenanceDto {
  @Matches(DATE_PATTERN)
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
