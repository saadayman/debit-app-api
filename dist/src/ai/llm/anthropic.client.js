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
exports.AnthropicClient = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
let AnthropicClient = class AnthropicClient {
    async chat(opts) {
        const client = new sdk_1.default({ apiKey: opts.apiKey });
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
        const toolCalls = [];
        for (const block of response.content) {
            if (block.type === 'text') {
                text += block.text;
            }
            else if (block.type === 'tool_use') {
                toolCalls.push({
                    id: block.id,
                    name: block.name,
                    input: block.input ?? {},
                });
            }
        }
        return { text: text.trim(), toolCalls };
    }
};
exports.AnthropicClient = AnthropicClient;
exports.AnthropicClient = AnthropicClient = __decorate([
    (0, common_1.Injectable)()
], AnthropicClient);
//# sourceMappingURL=anthropic.client.js.map