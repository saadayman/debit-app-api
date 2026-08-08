"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyProposalDto = exports.UpsertAiIntegrationDto = exports.AiAnalysisQueryDto = exports.ChatDto = void 0;
const class_validator_1 = require("class-validator");
const ai_actions_1 = require("../ai-actions");
class ChatDto {
    conversationId;
    message;
}
exports.ChatDto = ChatDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatDto.prototype, "conversationId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(6000),
    __metadata("design:type", String)
], ChatDto.prototype, "message", void 0);
class AiAnalysisQueryDto {
    month;
    locale;
}
exports.AiAnalysisQueryDto = AiAnalysisQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-(0[1-9]|1[0-2])$/, {
        message: 'month must be in YYYY-MM format',
    }),
    __metadata("design:type", String)
], AiAnalysisQueryDto.prototype, "month", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['en', 'ar']),
    __metadata("design:type", String)
], AiAnalysisQueryDto.prototype, "locale", void 0);
class UpsertAiIntegrationDto {
    provider;
    apiKey;
    model;
}
exports.UpsertAiIntegrationDto = UpsertAiIntegrationDto;
__decorate([
    (0, class_validator_1.IsIn)(['anthropic', 'openai']),
    __metadata("design:type", String)
], UpsertAiIntegrationDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(400),
    __metadata("design:type", String)
], UpsertAiIntegrationDto.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpsertAiIntegrationDto.prototype, "model", void 0);
class ApplyProposalDto {
    action;
    input;
}
exports.ApplyProposalDto = ApplyProposalDto;
__decorate([
    (0, class_validator_1.IsIn)(ai_actions_1.PROPOSAL_ACTIONS),
    __metadata("design:type", String)
], ApplyProposalDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ApplyProposalDto.prototype, "input", void 0);
//# sourceMappingURL=ai.dto.js.map