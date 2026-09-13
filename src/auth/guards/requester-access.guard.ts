import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

/** Restricts request-only household members at the API boundary. */
@Injectable()
export class RequesterAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { user?: { userId?: string } }>();
    const userId = request.user?.userId;
    if (!userId) return true; // Public route, or JWT guard will reject it.
    const member = await this.prisma.householdMember.findUnique({ where: { userId } });
    if (!member) throw new ForbiddenException('This account no longer belongs to a household');
    if (member.role === 'OWNER') return true;

    const path = request.originalUrl.split('?')[0];
    const allowed =
      path.startsWith('/api/auth/') ||
      path === '/api/settings' ||
      (path === '/api/categories' && request.method === 'GET') ||
      path.startsWith('/api/shopping-requests');
    if (!allowed) throw new ForbiddenException('Requester accounts can only access shopping requests');
    return true;
  }
}
