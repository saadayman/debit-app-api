import { PartialType } from '@nestjs/swagger';
import { IncomeSource } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateIncomeDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsDateString()
  date: string;

  @IsEnum(IncomeSource)
  source: IncomeSource;

  /** Which job this payment came from (optional) */
  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateIncomeDto extends PartialType(CreateIncomeDto) {}

export class ListIncomeQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(IncomeSource)
  source?: IncomeSource;
}
