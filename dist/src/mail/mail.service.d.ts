export interface MailAttachment {
    filename: string;
    content: Buffer;
    contentType?: string;
}
export interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: MailAttachment[];
}
export declare class MailService {
    private readonly logger;
    private transporter;
    private webOrigin;
    private from;
    private getTransporter;
    sendMail(opts: SendMailOptions): Promise<void>;
    private devFallback;
    sendVerificationEmail(email: string, token: string): void;
    sendPasswordResetEmail(email: string, token: string): void;
}
