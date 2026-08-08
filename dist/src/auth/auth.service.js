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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const mail_service_1 = require("../mail/mail.service");
const prisma_service_1 = require("../prisma/prisma.service");
const BCRYPT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
let AuthService = class AuthService {
    prisma;
    jwt;
    mail;
    constructor(prisma, jwt, mail) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.mail = mail;
    }
    sanitize(user) {
        const { passwordHash: _ph, verifyToken: _vt, resetToken: _rt, resetTokenExpiresAt: _rte, ...safe } = user;
        return { ...safe, emailVerified: !!user.emailVerifiedAt };
    }
    async issueTokens(user) {
        const payload = { sub: user.id, email: user.email };
        const accessTtl = (process.env.JWT_ACCESS_TTL ??
            '15m');
        const refreshTtl = (process.env.JWT_REFRESH_TTL ??
            '7d');
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync({ ...payload }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: accessTtl }),
            this.jwt.signAsync({ ...payload }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: refreshTtl }),
        ]);
        return { accessToken, refreshToken };
    }
    async register(dto) {
        const email = dto.email.toLowerCase();
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const user = await this.prisma.user.create({
            data: {
                email,
                name: dto.name,
                passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
                provider: 'LOCAL',
                verifyToken: (0, crypto_1.randomUUID)(),
                settings: { create: {} },
            },
        });
        this.mail.sendVerificationEmail(user.email, user.verifyToken);
        const tokens = await this.issueTokens(user);
        return { user: this.sanitize(user), ...tokens };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password');
        if (!user.passwordHash) {
            throw new common_1.UnauthorizedException('This account uses social login. Sign in with your provider.');
        }
        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const tokens = await this.issueTokens(user);
        return { user: this.sanitize(user), ...tokens };
    }
    async validateOrCreateOAuthUser(profile) {
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
    async refresh(refreshToken) {
        if (!refreshToken)
            throw new common_1.UnauthorizedException('Missing refresh token');
        let payload;
        try {
            payload = await this.jwt.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user)
            throw new common_1.UnauthorizedException('User no longer exists');
        const tokens = await this.issueTokens(user);
        return { user: this.sanitize(user), ...tokens };
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findUnique({
            where: { verifyToken: token },
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid verification token');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerifiedAt: new Date(), verifyToken: null },
        });
        return { message: 'Email verified' };
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (user && user.passwordHash) {
            const token = (0, crypto_1.randomUUID)();
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
    async resetPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { resetToken: dto.token },
        });
        if (!user ||
            !user.resetTokenExpiresAt ||
            user.resetTokenExpiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
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
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.passwordHash) {
            throw new common_1.BadRequestException('Account has no local password');
        }
        const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS) },
        });
        return { message: 'Password changed' };
    }
    async changeEmail(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        if (!user.passwordHash) {
            throw new common_1.BadRequestException('This account uses social login; its email is managed by the provider.');
        }
        const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        const email = dto.newEmail.toLowerCase();
        if (email === user.email) {
            throw new common_1.BadRequestException('That is already your email address');
        }
        const taken = await this.prisma.user.findUnique({ where: { email } });
        if (taken)
            throw new common_1.ConflictException('Email already registered');
        const verifyToken = (0, crypto_1.randomUUID)();
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                email,
                emailVerifiedAt: null,
                verifyToken,
            },
        });
        this.mail.sendVerificationEmail(email, verifyToken);
        return this.sanitize(updated);
    }
    async me(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { settings: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException();
        const { settings, ...rest } = user;
        return { ...this.sanitize(rest), settings };
    }
    async updateProfile(userId, dto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { ...(dto.name !== undefined ? { name: dto.name } : {}) },
        });
        return this.sanitize(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map