import { PartialType } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateExpenseDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsDateString()
  date: string;

  @IsString()
  categoryId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  /** The specific salary payment that funds this expense. */
  @IsOptional()
  @IsString()
  salaryIncomeId?: string | null;
}

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}

export class AssignExpensesSalaryDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @IsString({ each: true })
  expenseIds: string[];

  @IsString()
  salaryIncomeId: string;
}

export class ListExpensesQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  /** Salary payment id, or the literal "unassigned". */
  @IsOptional()
  @IsString()
  salaryIncomeId?: string;
}
