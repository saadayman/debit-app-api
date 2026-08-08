"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const debts_module_1 = require("../debts/debts.module");
const expenses_module_1 = require("../expenses/expenses.module");
const income_module_1 = require("../income/income.module");
const installments_module_1 = require("../installments/installments.module");
const savings_module_1 = require("../savings/savings.module");
const ai_apply_service_1 = require("./ai-apply.service");
const ai_context_service_1 = require("./ai-context.service");
const ai_integration_service_1 = require("./ai-integration.service");
const ai_controller_1 = require("./ai.controller");
const ai_service_1 = require("./ai.service");
const anthropic_client_1 = require("./llm/anthropic.client");
const openai_client_1 = require("./llm/openai.client");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            expenses_module_1.ExpensesModule,
            income_module_1.IncomeModule,
            installments_module_1.InstallmentsModule,
            debts_module_1.DebtsModule,
            savings_module_1.SavingsModule,
        ],
        controllers: [ai_controller_1.AiController],
        providers: [
            ai_service_1.AiService,
            ai_integration_service_1.AiIntegrationService,
            ai_context_service_1.AiContextService,
            ai_apply_service_1.AiApplyService,
            anthropic_client_1.AnthropicClient,
            openai_client_1.OpenAiClient,
        ],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map