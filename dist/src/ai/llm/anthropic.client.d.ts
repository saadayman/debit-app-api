import { LlmChatOptions, LlmClient, LlmResult } from './llm.types';
export declare class AnthropicClient implements LlmClient {
    chat(opts: LlmChatOptions): Promise<LlmResult>;
}
