import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { LlmChatOptions, LlmClient, LlmResult, LlmToolCall } from './llm.types';

@Injectable()
export class OpenAiClient implements LlmClient {
  async chat(opts: LlmChatOptions): Promise<LlmResult> {
    const client = new OpenAI({ apiKey: opts.apiKey });
    const response = await client.chat.completions.create({
      model: opts.model,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: opts.system },
        ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      tools: opts.tools.map((t) => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      })),
    });

    const message = response.choices[0]?.message;
    const toolCalls: LlmToolCall[] = [];
    for (const call of message?.tool_calls ?? []) {
      if (call.type !== 'function') continue;
      let input: Record<string, unknown> = {};
      try {
        input = JSON.parse(call.function.arguments || '{}');
      } catch {
        input = {};
      }
      toolCalls.push({ id: call.id, name: call.function.name, input });
    }
    return { text: (message?.content ?? '').trim(), toolCalls };
  }
}
