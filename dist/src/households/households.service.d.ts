import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class HouseholdsService {
    private prisma;
    private mail;
    constructor(prisma: PrismaService, mail: MailService);
    private owner;
    details(userId: string): Promise<({
        members: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            role: import("@prisma/client").$Enums.HouseholdRole;
            householdId: string;
        })[];
        invitations: {
            id: string;
            createdAt: Date;
            email: string;
            role: import("@prisma/client").$Enums.HouseholdRole;
            token: string;
            householdId: string;
            invitedById: string;
            expiresAt: Date;
            acceptedAt: Date | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    invite(userId: string, emailInput: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.HouseholdRole;
        token: string;
        householdId: string;
        invitedById: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    }>;
    removeMember(userId: string, memberId: string): Promise<{
        message: string;
    }>;
}
