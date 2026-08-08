import { ToolDef } from '../ai-actions';

export interface LlmMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LlmToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface LlmResult {
  text: string;
  toolCalls: LlmToolCall[];
}

export interface LlmChatOptions {
  apiKey: string;
  model: string;
  system: string;
  messages: LlmMessage[];
  tools: ToolDef[];
}

export interface LlmClient {
  chat(opts: LlmChatOptions): Promise<LlmResult>;
}
