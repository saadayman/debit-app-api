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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const ai_apply_service_1 = require("./ai-apply.service");
const ai_integration_service_1 = require("./ai-integration.service");
const ai_service_1 = require("./ai.service");
const ai_dto_1 = require("./dto/ai.dto");
let AiController = class AiController {
    ai;
    integration;
    apply;
    constructor(ai, integration, apply) {
        this.ai = ai;
        this.integration = integration;
        this.apply = apply;
    }
    getIntegration(user) {
        return this.integration.status(user.userId);
    }
    upsertIntegration(user, dto) {
        return this.integration.upsert(user.userId, dto);
    }
    removeIntegration(user) {
        return this.integration.remove(user.userId).then(() => ({ ok: true }));
    }
    chat(user, dto) {
        return this.ai.chat(user.userId, dto);
    }
    analysis(user, query) {
        return this.ai.analysis(user.userId, query.month, query.locale);
    }
    conversations(user) {
        return this.ai.conversations(user.userId);
    }
    conversation(user, id) {
        return this.ai.conversation(user.userId, id);
    }
    removeConversation(user, id) {
        return this.ai.removeConversation(user.userId, id);
    }
    applyProposal(user, dto) {
        return this.apply.apply(user.userId, dto.action, dto.input);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Get)('integration'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getIntegration", null);
__decorate([
    (0, common_1.Put)('integration'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_dto_1.UpsertAiIntegrationDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "upsertIntegration", null);
__decorate([
    (0, common_1.Delete)('integration'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "removeIntegration", null);
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_dto_1.ChatDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "chat", null);
__decorate([
    (0, common_1.Get)('analysis'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_dto_1.AiAnalysisQueryDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "analysis", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "conversations", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "conversation", null);
__decorate([
    (0, common_1.Delete)('conversations/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "removeConversation", null);
__decorate([
    (0, common_1.Post)('proposals/apply'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_dto_1.ApplyProposalDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "applyProposal", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('ai'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        ai_integration_service_1.AiIntegrationService,
        ai_apply_service_1.AiApplyService])
], AiController);
//# sourceMappingURL=ai.controller.js.map