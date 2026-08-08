import {
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class UpdateSettingsDto {
  /** ISO 4217 code (USD, JOD, …) or any short custom currency label */
  @IsOptional()
  @IsString()
  @Length(1, 8)
  currency?: string;

  @IsOptional()
  @IsIn(['en', 'ar'])
  locale?: string;

  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: string;

  @IsOptional()
  @IsString()
  dateFormat?: string;

  /** { enabled: boolean, sections: { income?, expenses?, budgets?, debts?, dashboard?, charts? } } */
  @IsOptional()
  @IsObject()
  privacyMode?: Record<string, unknown>;

  /** Email a monthly Excel report each month */
  @IsOptional()
  @IsBoolean()
  monthlyReportEmail?: boolean;

  /** Day of month (1-28) to send the monthly report */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  monthlyReportDay?: number;
}
