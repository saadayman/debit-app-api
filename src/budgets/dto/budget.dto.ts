import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export class CreateBudgetDto {
  /** Month in YYYY-MM format */
  @IsString()
  @Matches(MONTH_PATTERN, { message: 'month must be in YYYY-MM format' })
  month: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  /** Omit for the overall monthly budget */
  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {}

export class ListBudgetsQueryDto {
  @IsOptional()
  @IsString()
  @Matches(MONTH_PATTERN, { message: 'month must be in YYYY-MM format' })
  month?: string;
}
