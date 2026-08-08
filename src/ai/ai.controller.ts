import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AiApplyService } from './ai-apply.service';
import { AiIntegrationService } from './ai-integration.service';
import { AiService } from './ai.service';
import {
  ApplyProposalDto,
  AiAnalysisQueryDto,
  ChatDto,
  UpsertAiIntegrationDto,
} from './dto/ai.dto';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(
    private ai: AiService,
    private integration: AiIntegrationService,
    private apply: AiApplyService,
  ) {}

  @Get('integration')
  getIntegration(@CurrentUser() user: AuthUser) {
    return this.integration.status(user.userId);
  }

  @Put('integration')
  upsertIntegration(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpsertAiIntegrationDto,
  ) {
    return this.integration.upsert(user.userId, dto);
  }

  @Delete('integration')
  removeIntegration(@CurrentUser() user: AuthUser) {
    return this.integration.remove(user.userId).then(() => ({ ok: true }));
  }

  @Post('chat')
  chat(@CurrentUser() user: AuthUser, @Body() dto: ChatDto) {
    return this.ai.chat(user.userId, dto);
  }

  @Get('analysis')
  analysis(@CurrentUser() user: AuthUser, @Query() query: AiAnalysisQueryDto) {
    return this.ai.analysis(user.userId, query.month, query.locale);
  }

  @Get('conversations')
  conversations(@CurrentUser() user: AuthUser) {
    return this.ai.conversations(user.userId);
  }

  @Get('conversations/:id')
  conversation(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ai.conversation(user.userId, id);
  }

  @Delete('conversations/:id')
  removeConversation(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ai.removeConversation(user.userId, id);
  }

  @Post('proposals/apply')
  applyProposal(@CurrentUser() user: AuthUser, @Body() dto: ApplyProposalDto) {
    return this.apply.apply(user.userId, dto.action, dto.input);
  }
}
