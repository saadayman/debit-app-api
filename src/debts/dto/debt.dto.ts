import { PartialType } from '@nestjs/swagger';
import { DebtDirection, DebtType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDebtDto {
  @IsString()
  @MaxLength(100)
  name: string;

  /** OWED_BY_ME (default) = I owe it. OWED_TO_ME = someone owes me. */
  @IsOptional()
  @IsEnum(DebtDirection)
  direction?: DebtDirection;

  @IsEnum(DebtType)
  type: DebtType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  originalAmount: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  interestRate?: number;

  /** Omit when there is no agreed monthly schedule. */
  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monthlyPayment?: number | null;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  /** The lender I owe, or the person who owes me. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  counterparty?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateDebtDto extends PartialType(CreateDebtDto) {}

export class ListDebtsQueryDto {
  @IsOptional()
  @IsEnum(DebtDirection)
  direction?: DebtDirection;
}

export class CreateDebtPaymentDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsBoolean()
  isExtra?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateDebtPaymentDto extends PartialType(CreateDebtPaymentDto) {}
