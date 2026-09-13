import type { Request, Response } from 'express';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { ChangeEmailDto, ChangePasswordDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto, UpdateProfileDto, VerifyEmailDto } from './dto/auth.dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    private setRefreshCookie;
    register(dto: RegisterDto, res: Response): Promise<{
        accessToken: string;
        user: {
            householdRole: import("@prisma/client").$Enums.HouseholdRole;
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
    login(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
        user: {
            householdRole: import("@prisma/client").$Enums.HouseholdRole;
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
    refresh(req: Request, res: Response): Promise<{
        accessToken: string;
        user: {
            householdRole: import("@prisma/client").$Enums.HouseholdRole;
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
    logout(res: Response): {
        message: string;
    };
    verifyEmail(dto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(user: AuthUser, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    changeEmail(user: AuthUser, dto: ChangeEmailDto): Promise<{
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
    me(user: AuthUser): Promise<{
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
        householdRole: import("@prisma/client").$Enums.HouseholdRole;
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
    updateProfile(user: AuthUser, dto: UpdateProfileDto): Promise<{
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
