import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './jwt.strategy';
import {
  ChangeEmailDto,
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from './dto/auth.dto';

const BCRYPT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  private sanitize(user: User) {
    const {
      passwordHash: _ph,
      verifyToken: _vt,
      resetToken: _rt,
      resetTokenExpiresAt: _rte,
      ...safe
    } = user;
    return { ...safe, emailVerified: !!user.emailVerifiedAt };
  }

  private async issueTokens(user: User): Promise<TokenPair> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessTtl = (process.env.JWT_ACCESS_TTL ??
      '15m') as JwtSignOptions['expiresIn'];
    const refreshTtl = (process.env.JWT_REFRESH_TTL ??
      '7d') as JwtSignOptions['expiresIn'];
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { ...payload },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: accessTtl },
      ),
      this.jwt.signAsync(
        { ...payload },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: refreshTtl },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name,
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        provider: 'LOCAL',
        verifyToken: randomUUID(),
        settings: { create: {} },
      },
    });
    this.mail.sendVerificationEmail(user.email, user.verifyToken!);

    const tokens = await this.issueTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (!user.passwordHash) {
      // Account created via an OAuth provider (e.g. Google) — no local password.
      throw new UnauthorizedException(
        'This account uses social login. Sign in with your provider.',
      );
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');

    const tokens = await this.issueTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  /**
   * Seam for OAuth providers: find-or-create a user from a verified
   * provider profile, then issue our own tokens. Wire a Google strategy
   * to this method when enabling social login.
   */
  async validateOrCreateOAuthUser(profile: {
    provider: 'GOOGLE';
    providerId: string;
    email: string;
    name: string;
  }) {
    const email = profile.email.toLowerCase();
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: profile.name,
          provider: profile.provider,
          providerId: profile.providerId,
          emailVerifiedAt: new Date(),
          settings: { create: {} },
        },
      });
    }
    const tokens = await this.issueTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException('User no longer exists');

    const tokens = await this.issueTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { verifyToken: token },
    });
    if (!user) throw new BadRequestException('Invalid verification token');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date(), verifyToken: null },
    });
    return { message: 'Email verified' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    // Always respond identically so the endpoint can't be used to probe emails.
    if (user && user.passwordHash) {
      const token = randomUUID();
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });
      this.mail.sendPasswordResetEmail(user.email, token);
    }
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { resetToken: dto.token },
    });
    if (
      !user ||
      !user.resetTokenExpiresAt ||
      user.resetTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });
    return { message: 'Password updated' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      throw new BadRequestException('Account has no local password');
    }
    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS) },
    });
    return { message: 'Password changed' };
  }

  /**
   * Changes the login email. Requires the current password (the email is the
   * login identity, so a hijacked session must not be able to take the account
   * over), and re-verification of the new address.
   */
  async changeEmail(userId: string, dto: ChangeEmailDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (!user.passwordHash) {
      throw new BadRequestException(
        'This account uses social login; its email is managed by the provider.',
      );
    }
    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');

    const email = dto.newEmail.toLowerCase();
    if (email === user.email) {
      throw new BadRequestException('That is already your email address');
    }
    const taken = await this.prisma.user.findUnique({ where: { email } });
    if (taken) throw new ConflictException('Email already registered');

    const verifyToken = randomUUID();
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email,
        // The new address is unproven until it's verified again.
        emailVerifiedAt: null,
        verifyToken,
      },
    });
    this.mail.sendVerificationEmail(email, verifyToken);
    return this.sanitize(updated);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });
    if (!user) throw new UnauthorizedException();
    const { settings, ...rest } = user;
    return { ...this.sanitize(rest as User), settings };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...(dto.name !== undefined ? { name: dto.name } : {}) },
    });
    return this.sanitize(user);
  }
}
