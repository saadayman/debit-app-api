import { PartialType } from '@nestjs/swagger';
import { JobType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum(JobType)
  type: JobType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  employer?: string;

  /** Expected pay per period — omit for irregular work */
  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  expectedAmount?: number;

  /** Day of month you get paid (1-31). Omit/null for no fixed schedule. */
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  payDayOfMonth?: number | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateJobDto extends PartialType(CreateJobDto) {}
