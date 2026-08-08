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
exports.AiIntegrationService = exports.DEFAULT_MODELS = void 0;
const common_1 = require("@nestjs/common");
const crypto_util_1 = require("../common/crypto.util");
const prisma_service_1 = require("../prisma/prisma.service");
exports.DEFAULT_MODELS = {
    anthropic: 'claude-opus-4-8',
    openai: 'gpt-4o',
};
let AiIntegrationService = class AiIntegrationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async status(userId) {
        const row = await this.prisma.aiIntegration.findUnique({ where: { userId } });
        return {
            configured: !!row,
            provider: row?.provider ?? null,
            model: row?.model ?? null,
        };
    }
    async upsert(userId, dto) {
        if (dto.provider !== 'anthropic' && dto.provider !== 'openai') {
            throw new common_1.BadRequestException('provider must be anthropic or openai');
        }
        const model = dto.model?.trim() || exports.DEFAULT_MODELS[dto.provider];
        const apiKeyEnc = (0, crypto_util_1.encryptSecret)(dto.apiKey.trim());
        await this.prisma.aiIntegration.upsert({
            where: { userId },
            create: { userId, provider: dto.provider, model, apiKeyEnc },
            update: { provider: dto.provider, model, apiKeyEnc },
        });
        return this.status(userId);
    }
    async remove(userId) {
        await this.prisma.aiIntegration.deleteMany({ where: { userId } });
    }
    async getConfig(userId) {
        const row = await this.prisma.aiIntegration.findUnique({ where: { userId } });
        if (!row)
            return null;
        return {
            provider: row.provider,
            model: row.model,
            apiKey: (0, crypto_util_1.decryptSecret)(row.apiKeyEnc),
        };
    }
};
exports.AiIntegrationService = AiIntegrationService;
exports.AiIntegrationService = AiIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiIntegrationService);
//# sourceMappingURL=ai-integration.service.js.map