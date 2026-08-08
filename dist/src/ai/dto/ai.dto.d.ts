import type { ProposalAction } from '../ai-actions';
export declare class ChatDto {
    conversationId?: string;
    message: string;
}
export declare class AiAnalysisQueryDto {
    month?: string;
    locale?: string;
}
export declare class UpsertAiIntegrationDto {
    provider: string;
    apiKey: string;
    model?: string;
}
export declare class ApplyProposalDto {
    action: ProposalAction;
    input: Record<string, unknown>;
}
