import { PrismaService } from '../prisma/prisma.service';
import { UpsertAiIntegrationDto } from './dto/ai.dto';
export declare const DEFAULT_MODELS: Record<string, string>;
export interface AiConfig {
    provider: string;
    model: string;
    apiKey: string;
}
export interface AiIntegrationStatus {
    configured: boolean;
    provider: string | null;
    model: string | null;
}
export declare class AiIntegrationService {
    private prisma;
    constructor(prisma: PrismaService);
    status(userId: string): Promise<AiIntegrationStatus>;
    upsert(userId: string, dto: UpsertAiIntegrationDto): Promise<AiIntegrationStatus>;
    remove(userId: string): Promise<void>;
    getConfig(userId: string): Promise<AiConfig | null>;
}
