import { PartialType } from '@nestjs/swagger';
import { Frequency, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRecurringPaymentDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsString()
  categoryId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(Frequency)
  frequency: Frequency;

  /** "every X days/weeks/months/years" — defaults to 1 */
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  intervalCount?: number;

  @IsDateString()
  nextDueDate: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateRecurringPaymentDto extends PartialType(
  CreateRecurringPaymentDto,
) {}
