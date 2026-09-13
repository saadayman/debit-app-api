import type { AuthUser } from '../common/decorators/current-user.decorator';
import { InviteHouseholdMemberDto } from './dto/household.dto';
import { HouseholdsService } from './households.service';
export declare class HouseholdsController {
    private households;
    constructor(households: HouseholdsService);
    details(user: AuthUser): Promise<({
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
    invite(user: AuthUser, dto: InviteHouseholdMemberDto): Promise<{
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
    remove(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
}
