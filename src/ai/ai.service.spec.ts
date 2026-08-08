import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiContextService } from './ai-context.service';
import { AiIntegrationService } from './ai-integration.service';
import { AiService } from './ai.service';

describe('AiService persistent conversations', () => {
  const integration = {
    getConfig: jest.fn().mockResolvedValue({
      provider: 'openai',
      model: 'test-model',
      apiKey: 'test-key',
    }),
  };
  const context = {
    build: jest.fn().mockResolvedValue({
      today: '2026-07-28',
      currency: 'JOD',
      locale: 'en',
      categories: ['Food'],
      text: '{}',
    }),
  };
  const openai = {
    chat: jest.fn().mockResolvedValue({
      text: 'Your current salary balance is 700 JOD.',
      toolCalls: [],
    }),
  };
  const anthropic = { chat: jest.fn() };
  const aiConversation = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  };
  const aiMessage = {
    create: jest.fn().mockResolvedValue({}),
    findMany: jest.fn(),
  };
  const prisma = { aiConversation, aiMessage };
  const service = new AiService(
    integration as unknown as AiIntegrationService,
    context as unknown as AiContextService,
    anthropic,
    openai,
    prisma as unknown as PrismaService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('creates a thread, stores both messages, and returns its id', async () => {
    aiConversation.create.mockResolvedValue({ id: 'conversation-1' });
    aiMessage.findMany.mockResolvedValue([
      { role: 'user', content: 'What is my salary balance?' },
    ]);

    const result = await service.chat('user-1', {
      message: 'What is my salary balance?',
    });

    expect(aiConversation.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        title: 'What is my salary balance?',
      },
    });
    expect(aiMessage.create).toHaveBeenNthCalledWith(1, {
      data: {
        conversationId: 'conversation-1',
        role: 'user',
        content: 'What is my salary balance?',
      },
    });
    expect(openai.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: 'What is my salary balance?' }],
      }),
    );
    expect(aiMessage.create).toHaveBeenNthCalledWith(2, {
      data: {
        conversationId: 'conversation-1',
        role: 'assistant',
        content: 'Your current salary balance is 700 JOD.',
        proposals: [],
      },
    });
    expect(result.conversationId).toBe('conversation-1');
  });

  it('does not allow access to another user’s conversation', async () => {
    aiConversation.findFirst.mockResolvedValue(null);

    await expect(
      service.chat('user-1', {
        conversationId: 'foreign-conversation',
        message: 'Continue',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(aiConversation.findFirst).toHaveBeenCalledWith({
      where: { id: 'foreign-conversation', userId: 'user-1' },
    });
    expect(aiMessage.create).not.toHaveBeenCalled();
  });

  it('generates structured analysis from the complete financial context', async () => {
    openai.chat.mockResolvedValueOnce({
      text: JSON.stringify({
        summary: 'Cash flow is stable.',
        healthScore: 78,
        cashFlow: 'Paid expenses are below income.',
        salaryCycles: 'The latest salary cycle has money remaining.',
        installments: 'One upcoming installment is still unpaid.',
        insights: [
          {
            title: 'Healthy balance',
            detail: 'The current balance remains positive.',
            impact: 'positive',
          },
        ],
        recommendations: [
          {
            title: 'Protect the remainder',
            detail: 'Reserve the upcoming installment amount.',
            priority: 'high',
          },
        ],
      }),
      toolCalls: [],
    });

    const result = await service.analysis('user-1', '2026-07');

    expect(result).toEqual(
      expect.objectContaining({
        month: '2026-07',
        healthScore: 78,
        summary: 'Cash flow is stable.',
      }),
    );
    expect(result.insights[0]?.impact).toBe('positive');
    expect(result.recommendations[0]?.priority).toBe('high');
    expect(context.build).toHaveBeenCalledWith('user-1');
    expect(openai.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: [],
        messages: [
          {
            role: 'user',
            content: 'Generate my financial analysis for 2026-07 in English.',
          },
        ],
      }),
    );
  });

  it('uses the explicitly selected Arabic locale for analysis', async () => {
    openai.chat.mockResolvedValueOnce({
      text: JSON.stringify({
        summary: 'التدفق النقدي مستقر.',
        healthScore: 78,
        cashFlow: 'المصروفات المدفوعة أقل من الدخل.',
        salaryCycles: 'يتبقى رصيد من دورة الراتب الأخيرة.',
        installments: 'يوجد قسط قادم غير مدفوع.',
        insights: [],
        recommendations: [],
      }),
      toolCalls: [],
    });

    const result = await service.analysis('user-1', '2026-07', 'ar');

    expect(result.summary).toBe('التدفق النقدي مستقر.');
    expect(openai.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            role: 'user',
            content: 'Generate my financial analysis for 2026-07 in Arabic.',
          },
        ],
      }),
    );
  });
});
