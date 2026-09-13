import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HouseholdsService {
  constructor(private prisma: PrismaService, private mail: MailService) {}

  private async owner(userId: string) {
    const member = await this.prisma.householdMember.findUnique({ where: { userId } });
    if (!member || member.role !== 'OWNER') throw new ForbiddenException('Only the household owner can manage members');
    return member;
  }

  async details(userId: string) {
    const owner = await this.owner(userId);
    return this.prisma.household.findUnique({
      where: { id: owner.householdId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'asc' } },
        invitations: { where: { acceptedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async invite(userId: string, emailInput: string) {
    const owner = await this.owner(userId);
    const email = emailInput.toLowerCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email }, include: { householdMembership: true } });
    if (existingUser?.householdMembership) throw new BadRequestException('This person already belongs to a household');
    await this.prisma.householdInvitation.deleteMany({ where: { householdId: owner.householdId, email, acceptedAt: null } });
    const invitation = await this.prisma.householdInvitation.create({
      data: { householdId: owner.householdId, email, role: 'REQUESTER', token: randomUUID(), invitedById: userId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
    this.mail.sendHouseholdInvitation(email, invitation.token);
    return invitation;
  }

  async removeMember(userId: string, memberId: string) {
    const owner = await this.owner(userId);
    const member = await this.prisma.householdMember.findFirst({ where: { id: memberId, householdId: owner.householdId, role: 'REQUESTER' } });
    if (!member) throw new NotFoundException('Household member not found');
    await this.prisma.householdMember.delete({ where: { id: member.id } });
    return { message: 'Member removed' };
  }
}
