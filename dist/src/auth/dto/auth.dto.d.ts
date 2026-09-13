export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    invitationToken?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
}
export declare class VerifyEmailDto {
    token: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class ChangeEmailDto {
    newEmail: string;
    currentPassword: string;
}
export declare class UpdateProfileDto {
    name?: string;
}
