"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HouseholdsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const mail_service_1 = require("../mail/mail.service");
const prisma_service_1 = require("../prisma/prisma.service");
let HouseholdsService = class HouseholdsService {
    prisma;
    mail;
    constructor(prisma, mail) {
        this.prisma = prisma;
        this.mail = mail;
    }
    async owner(userId) {
        const member = await this.prisma.householdMember.findUnique({ where: { userId } });
        if (!member || member.role !== 'OWNER')
            throw new common_1.ForbiddenException('Only the household owner can manage members');
        return member;
    }
    async details(userId) {
        const owner = await this.owner(userId);
        return this.prisma.household.findUnique({
            where: { id: owner.householdId },
            include: {
                members: { include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'asc' } },
                invitations: { where: { acceptedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } },
            },
        });
    }
    async invite(userId, emailInput) {
        const owner = await this.owner(userId);
        const email = emailInput.toLowerCase();
        const existingUser = await this.prisma.user.findUnique({ where: { email }, include: { householdMembership: true } });
        if (existingUser?.householdMembership)
            throw new common_1.BadRequestException('This person already belongs to a household');
        await this.prisma.householdInvitation.deleteMany({ where: { householdId: owner.householdId, email, acceptedAt: null } });
        const invitation = await this.prisma.householdInvitation.create({
            data: { householdId: owner.householdId, email, role: 'REQUESTER', token: (0, crypto_1.randomUUID)(), invitedById: userId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        });
        this.mail.sendHouseholdInvitation(email, invitation.token);
        return invitation;
    }
    async removeMember(userId, memberId) {
        const owner = await this.owner(userId);
        const member = await this.prisma.householdMember.findFirst({ where: { id: memberId, householdId: owner.householdId, role: 'REQUESTER' } });
        if (!member)
            throw new common_1.NotFoundException('Household member not found');
        await this.prisma.householdMember.delete({ where: { id: member.id } });
        return { message: 'Member removed' };
    }
};
exports.HouseholdsService = HouseholdsService;
exports.HouseholdsService = HouseholdsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, mail_service_1.MailService])
], HouseholdsService);
//# sourceMappingURL=households.service.js.map