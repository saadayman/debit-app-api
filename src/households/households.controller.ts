import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InviteHouseholdMemberDto } from './dto/household.dto';
import { HouseholdsService } from './households.service';

@Controller('household')
export class HouseholdsController {
  constructor(private households: HouseholdsService) {}
  @Get() details(@CurrentUser() user: AuthUser) { return this.households.details(user.userId); }
  @Post('invitations') invite(@CurrentUser() user: AuthUser, @Body() dto: InviteHouseholdMemberDto) { return this.households.invite(user.userId, dto.email); }
  @Delete('members/:id') remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.households.removeMember(user.userId, id); }
}
