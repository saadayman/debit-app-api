"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiClient = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
let OpenAiClient = class OpenAiClient {
    async chat(opts) {
        const client = new openai_1.default({ apiKey: opts.apiKey });
        const response = await client.chat.completions.create({
            model: opts.model,
            max_tokens: 2048,
            messages: [
                { role: 'system', content: opts.system },
                ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
            ],
            tools: opts.tools.map((t) => ({
                type: 'function',
                function: {
                    name: t.name,
                    description: t.description,
                    parameters: t.parameters,
                },
            })),
        });
        const message = response.choices[0]?.message;
        const toolCalls = [];
        for (const call of message?.tool_calls ?? []) {
            if (call.type !== 'function')
                continue;
            let input = {};
            try {
                input = JSON.parse(call.function.arguments || '{}');
            }
            catch {
                input = {};
            }
            toolCalls.push({ id: call.id, name: call.function.name, input });
        }
        return { text: (message?.content ?? '').trim(), toolCalls };
    }
};
exports.OpenAiClient = OpenAiClient;
exports.OpenAiClient = OpenAiClient = __decorate([
    (0, common_1.Injectable)()
], OpenAiClient);
//# sourceMappingURL=openai.client.js.map