import { Module } from '@nestjs/common';
import { DebtsModule } from '../debts/debts.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { IncomeModule } from '../income/income.module';
import { InstallmentsModule } from '../installments/installments.module';
import { SavingsModule } from '../savings/savings.module';
import { AiApplyService } from './ai-apply.service';
import { AiContextService } from './ai-context.service';
import { AiIntegrationService } from './ai-integration.service';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AnthropicClient } from './llm/anthropic.client';
import { OpenAiClient } from './llm/openai.client';

@Module({
  imports: [
    ExpensesModule,
    IncomeModule,
    InstallmentsModule,
    DebtsModule,
    SavingsModule,
  ],
  controllers: [AiController],
  providers: [
    AiService,
    AiIntegrationService,
    AiContextService,
    AiApplyService,
    AnthropicClient,
    OpenAiClient,
  ],
})
export class AiModule {}
