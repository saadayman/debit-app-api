import { Injectable, Logger } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as nodemailer from 'nodemailer';

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

/**
 * Sends email via SMTP when configured, otherwise falls back to a dev
 * transport that logs the message and writes any attachments to disk under
 * `./tmp/mail` so they can be inspected without a mail server.
 *
 * SMTP is enabled by setting SMTP_HOST (+ SMTP_PORT, SMTP_USER, SMTP_PASS,
 * MAIL_FROM). For Gmail, use an app password and host smtp.gmail.com:465.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  private webOrigin() {
    return process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  }

  private from() {
    return process.env.MAIL_FROM ?? 'Debit App <no-reply@debit-app.local>';
  }

  /** Lazily builds the SMTP transporter, or null when SMTP isn't configured. */
  private getTransporter(): nodemailer.Transporter | null {
    if (this.transporter) return this.transporter;
    const host = process.env.SMTP_HOST;
    if (!host) return null;
    const port = Number(process.env.SMTP_PORT ?? 587);
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
    return this.transporter;
  }

  async sendMail(opts: SendMailOptions): Promise<void> {
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

  /** No SMTP configured: log the email and dump attachments to ./tmp/mail. */
  private async devFallback(opts: SendMailOptions): Promise<void> {
    this.logger.warn(
      `[DEV MAIL — SMTP not configured] to=${opts.to} subject="${opts.subject}"`,
    );
    if (opts.attachments?.length) {
      const dir = join(process.cwd(), 'tmp', 'mail');
      await mkdir(dir, { recursive: true });
      for (const a of opts.attachments) {
        const path = join(dir, a.filename);
        await writeFile(path, a.content);
        this.logger.warn(`[DEV MAIL] attachment written to ${path}`);
      }
    }
  }

  sendVerificationEmail(email: string, token: string) {
    this.logger.log(
      `[VERIFY EMAIL] to=${email} link=${this.webOrigin()}/verify-email?token=${token}`,
    );
  }

  sendPasswordResetEmail(email: string, token: string) {
    this.logger.log(
      `[RESET PASSWORD] to=${email} link=${this.webOrigin()}/reset-password?token=${token}`,
    );
  }

  sendHouseholdInvitation(email: string, token: string) {
    const link = `${this.webOrigin()}/register?invitation=${token}`;
    this.logger.log(`[HOUSEHOLD INVITATION] to=${email} link=${link}`);
    void this.sendMail({
      to: email,
      subject: 'You have been invited to a household shopping list',
      text: `Create your restricted request account: ${link}`,
      html: `<p>You have been invited to a household shopping list.</p><p><a href="${link}">Create your request account</a></p>`,
    });
  }
}
