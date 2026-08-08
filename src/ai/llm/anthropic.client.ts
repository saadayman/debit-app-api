import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { LlmChatOptions, LlmClient, LlmResult, LlmToolCall } from './llm.types';

@Injectable()
export class AnthropicClient implements LlmClient {
  async chat(opts: LlmChatOptions): Promise<LlmResult> {
    const client = new Anthropic({ apiKey: opts.apiKey });
    const response = await client.messages.create({
      model: opts.model,
      max_tokens: 2048,
      system: opts.system,
      tools: opts.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      })),
      messages: opts.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    let text = '';
    const toolCalls: LlmToolCall[] = [];
    for (const block of response.content) {
      if (block.type === 'text') {
        text += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: (block.input as Record<string, unknown>) ?? {},
        });
      }
    }
    return { text: text.trim(), toolCalls };
  }
}
