"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    logger = new common_1.Logger(MailService_1.name);
    transporter = null;
    webOrigin() {
        return process.env.WEB_ORIGIN ?? 'http://localhost:3000';
    }
    from() {
        return process.env.MAIL_FROM ?? 'Debit App <no-reply@debit-app.local>';
    }
    getTransporter() {
        if (this.transporter)
            return this.transporter;
        const host = process.env.SMTP_HOST;
        if (!host)
            return null;
        const port = Number(process.env.SMTP_PORT ?? 587);
        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: process.env.SMTP_USER && process.env.SMTP_PASS
                ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                : undefined,
        });
        return this.transporter;
    }
    async sendMail(opts) {
        const transporter = this.getTransporter();
        if (!transporter) {
            await this.devFallback(opts);
            return;
        }
        await transporter.sendMail({
            from: this.from(),
            to: opts.to,
            subject: opts.subject,
            html: opts.html,
            text: opts.text,
            attachments: opts.attachments?.map((a) => ({
                filename: a.filename,
                content: a.content,
                contentType: a.contentType,
            })),
        });
        this.logger.log(`Email sent to ${opts.to}: "${opts.subject}"`);
    }
    async devFallback(opts) {
        this.logger.warn(`[DEV MAIL — SMTP not configured] to=${opts.to} subject="${opts.subject}"`);
        if (opts.attachments?.length) {
            const dir = (0, node_path_1.join)(process.cwd(), 'tmp', 'mail');
            await (0, promises_1.mkdir)(dir, { recursive: true });
            for (const a of opts.attachments) {
                const path = (0, node_path_1.join)(dir, a.filename);
                await (0, promises_1.writeFile)(path, a.content);
                this.logger.warn(`[DEV MAIL] attachment written to ${path}`);
            }
        }
    }
    sendVerificationEmail(email, token) {
        this.logger.log(`[VERIFY EMAIL] to=${email} link=${this.webOrigin()}/verify-email?token=${token}`);
    }
    sendPasswordResetEmail(email, token) {
        this.logger.log(`[RESET PASSWORD] to=${email} link=${this.webOrigin()}/reset-password?token=${token}`);
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)()
], MailService);
//# sourceMappingURL=mail.service.js.map