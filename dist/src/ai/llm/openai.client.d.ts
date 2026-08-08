import { LlmChatOptions, LlmClient, LlmResult } from './llm.types';
export declare class OpenAiClient implements LlmClient {
    chat(opts: LlmChatOptions): Promise<LlmResult>;
}
