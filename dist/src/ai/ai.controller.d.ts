import type { AuthUser } from '../common/decorators/current-user.decorator';
import { AiApplyService } from './ai-apply.service';
import { AiIntegrationService } from './ai-integration.service';
import { AiService } from './ai.service';
import { ApplyProposalDto, AiAnalysisQueryDto, ChatDto, UpsertAiIntegrationDto } from './dto/ai.dto';
export declare class AiController {
    private ai;
    private integration;
    private apply;
    constructor(ai: AiService, integration: AiIntegrationService, apply: AiApplyService);
    getIntegration(user: AuthUser): Promise<import("./ai-integration.service").AiIntegrationStatus>;
    upsertIntegration(user: AuthUser, dto: UpsertAiIntegrationDto): Promise<import("./ai-integration.service").AiIntegrationStatus>;
    removeIntegration(user: AuthUser): Promise<{
        ok: boolean;
    }>;
    chat(user: AuthUser, dto: ChatDto): Promise<{
        conversationId: string;
        reply: string;
        proposals: import("./ai.service").ChatProposal[];
    }>;
    analysis(user: AuthUser, query: AiAnalysisQueryDto): Promise<import("./ai.service").FinancialAnalysis>;
    conversations(user: AuthUser): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        messageCount: number;
        lastMessage: string;
    }[]>;
    conversation(user: AuthUser, id: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        messages: {
            id: string;
            role: string;
            content: string;
            proposals: import("./ai.service").ChatProposal[];
            createdAt: Date;
        }[];
    }>;
    removeConversation(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
    applyProposal(user: AuthUser, dto: ApplyProposalDto): Promise<{
        action: import("./ai-actions").ProposalAction;
        summary: string;
        id: string;
    }>;
}
