import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  MinLength,
} from 'class-validator';
import { PROPOSAL_ACTIONS } from '../ai-actions';
import type { ProposalAction } from '../ai-actions';

export class ChatDto {
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(6000)
  message: string;
}

export class AiAnalysisQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month must be in YYYY-MM format',
  })
  month?: string;

  @IsOptional()
  @IsIn(['en', 'ar'])
  locale?: string;
}

export class UpsertAiIntegrationDto {
  @IsIn(['anthropic', 'openai'])
  provider: string;

  @IsString()
  @MinLength(8)
  @MaxLength(400)
  apiKey: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;
}

export class ApplyProposalDto {
  @IsIn(PROPOSAL_ACTIONS)
  action: ProposalAction;

  @IsObject()
  input: Record<string, unknown>;
}
