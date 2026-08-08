import { PartialType } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInstallmentDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  totalPrice: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  downPayment?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monthlyAmount: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  totalInstallments: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  paidInstallments?: number;

  @IsDateString()
  startDate: string;

  /** Salary cycle in which this installment plan was added. */
  @IsOptional()
  @IsString()
  salaryIncomeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateInstallmentDto extends PartialType(CreateInstallmentDto) {}

export class PayInstallmentDto {
  @IsDateString()
  date: string;

  @IsString()
  categoryId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  salaryIncomeId?: string | null;
}
