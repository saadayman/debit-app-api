import { PrismaService } from '../prisma/prisma.service';
import { ProposalAction } from './ai-actions';
import { AiContextService } from './ai-context.service';
import { AiIntegrationService } from './ai-integration.service';
import { AnthropicClient } from './llm/anthropic.client';
import { OpenAiClient } from './llm/openai.client';
export interface ChatProposal {
    id: string;
    action: ProposalAction;
    input: Record<string, unknown>;
    summary: string;
}
export interface FinancialAnalysis {
    month: string;
    generatedAt: string;
    summary: string;
    healthScore: number | null;
    cashFlow: string;
    salaryCycles: string;
    installments: string;
    insights: Array<{
        title: string;
        detail: string;
        impact: 'positive' | 'warning' | 'neutral';
    }>;
    recommendations: Array<{
        title: string;
        detail: string;
        priority: 'high' | 'medium' | 'low';
    }>;
}
export declare class AiService {
    private integration;
    private context;
    private anthropic;
    private openai;
    private prisma;
    constructor(integration: AiIntegrationService, context: AiContextService, anthropic: AnthropicClient, openai: OpenAiClient, prisma: PrismaService);
    conversations(userId: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        messageCount: number;
        lastMessage: string;
    }[]>;
    conversation(userId: string, id: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        messages: {
            id: string;
            role: string;
            content: string;
            proposals: ChatProposal[];
            createdAt: Date;
        }[];
    }>;
    removeConversation(userId: string, id: string): Promise<{
        message: string;
    }>;
    analysis(userId: string, month?: string, locale?: string): Promise<FinancialAnalysis>;
    private buildSystem;
    chat(userId: string, dto: {
        conversationId?: string;
        message: string;
    }): Promise<{
        conversationId: string;
        reply: string;
        proposals: ChatProposal[];
    }>;
    private titleFrom;
    private readProposals;
    private parseAnalysis;
    private throwProviderError;
}
