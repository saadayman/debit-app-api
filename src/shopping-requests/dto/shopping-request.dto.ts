import { PaymentMethod, ShoppingRequestStatus } from '@prisma/client';
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

export class CreateShoppingRequestDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  quantity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class ListShoppingRequestsQueryDto {
  @IsOptional()
  @IsEnum(ShoppingRequestStatus)
  status?: ShoppingRequestStatus;

  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class PurchaseShoppingRequestDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsDateString()
  date: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  salaryIncomeId?: string | null;
}
