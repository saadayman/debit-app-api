import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChangeEmailDto, ChangePasswordDto, LoginDto, RegisterDto, ResetPasswordDto, UpdateProfileDto } from './dto/auth.dto';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private prisma;
    private jwt;
    private mail;
    constructor(prisma: PrismaService, jwt: JwtService, mail: MailService);
    private sanitize;
    private issueTokens;
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            emailVerified: boolean;
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            provider: import("@prisma/client").$Enums.AuthProvider;
            providerId: string | null;
            emailVerifiedAt: Date | null;
            updatedAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            emailVerified: boolean;
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            provider: import("@prisma/client").$Enums.AuthProvider;
            providerId: string | null;
            emailVerifiedAt: Date | null;
            updatedAt: Date;
        };
    }>;
    validateOrCreateOAuthUser(profile: {
        provider: 'GOOGLE';
        providerId: string;
        email: string;
        name: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            emailVerified: boolean;
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            provider: import("@prisma/client").$Enums.AuthProvider;
            providerId: string | null;
            emailVerifiedAt: Date | null;
            updatedAt: Date;
        };
    }>;
    refresh(refreshToken: string | undefined): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            emailVerified: boolean;
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            provider: import("@prisma/client").$Enums.AuthProvider;
            providerId: string | null;
            emailVerifiedAt: Date | null;
            updatedAt: Date;
        };
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    changeEmail(userId: string, dto: ChangeEmailDto): Promise<{
        emailVerified: boolean;
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        provider: import("@prisma/client").$Enums.AuthProvider;
        providerId: string | null;
        emailVerifiedAt: Date | null;
        updatedAt: Date;
    }>;
    me(userId: string): Promise<{
        settings: {
            id: string;
            userId: string;
            updatedAt: Date;
            currency: string;
            locale: string;
            theme: string;
            dateFormat: string;
            privacyMode: import("@prisma/client/runtime/library").JsonValue;
            monthlyReportEmail: boolean;
            monthlyReportDay: number;
        } | null;
        emailVerified: boolean;
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        provider: import("@prisma/client").$Enums.AuthProvider;
        providerId: string | null;
        emailVerifiedAt: Date | null;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        emailVerified: boolean;
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        provider: import("@prisma/client").$Enums.AuthProvider;
        providerId: string | null;
        emailVerifiedAt: Date | null;
        updatedAt: Date;
    }>;
}
