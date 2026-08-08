import { BadRequestException, Injectable } from '@nestjs/common';
import { decryptSecret, encryptSecret } from '../common/crypto.util';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertAiIntegrationDto } from './dto/ai.dto';

export const DEFAULT_MODELS: Record<string, string> = {
  anthropic: 'claude-opus-4-8',
  openai: 'gpt-4o',
};

export interface AiConfig {
  provider: string;
  model: string;
  apiKey: string;
}

/** Client-safe view of the integration — never exposes the key itself. */
export interface AiIntegrationStatus {
  configured: boolean;
  provider: string | null;
  model: string | null;
}

@Injectable()
export class AiIntegrationService {
  constructor(private prisma: PrismaService) {}

  async status(userId: string): Promise<AiIntegrationStatus> {
    const row = await this.prisma.aiIntegration.findUnique({ where: { userId } });
    return {
      configured: !!row,
      provider: row?.provider ?? null,
      model: row?.model ?? null,
    };
  }

  async upsert(
    userId: string,
    dto: UpsertAiIntegrationDto,
  ): Promise<AiIntegrationStatus> {
    if (dto.provider !== 'anthropic' && dto.provider !== 'openai') {
      throw new BadRequestException('provider must be anthropic or openai');
    }
    const model = dto.model?.trim() || DEFAULT_MODELS[dto.provider];
    const apiKeyEnc = encryptSecret(dto.apiKey.trim());
    await this.prisma.aiIntegration.upsert({
      where: { userId },
      create: { userId, provider: dto.provider, model, apiKeyEnc },
      update: { provider: dto.provider, model, apiKeyEnc },
    });
    return this.status(userId);
  }

  async remove(userId: string): Promise<void> {
    await this.prisma.aiIntegration.deleteMany({ where: { userId } });
  }

  /** Full config incl. the decrypted key — server-side use only. */
  async getConfig(userId: string): Promise<AiConfig | null> {
    const row = await this.prisma.aiIntegration.findUnique({ where: { userId } });
    if (!row) return null;
    return {
      provider: row.provider,
      model: row.model,
      apiKey: decryptSecret(row.apiKeyEnc),
    };
  }
}
