import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  CreateRecurringPaymentDto,
  UpdateRecurringPaymentDto,
} from './dto/recurring.dto';
import { RecurringService } from './recurring.service';

@ApiTags('recurring')
@ApiBearerAuth()
@Controller('recurring')
export class RecurringController {
  constructor(private recurring: RecurringService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.recurring.list(user.userId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateRecurringPaymentDto,
  ) {
    return this.recurring.create(user.userId, dto);
  }

  @Post('generate')
  generate(@CurrentUser() user: AuthUser) {
    return this.recurring.generateDueExpenses(user.userId);
  }

  @Get('approvals')
  approvals(@CurrentUser() user: AuthUser) {
    return this.recurring.listApprovals(user.userId);
  }

  @Post('approvals/:id/approve')
  approve(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.recurring.approve(user.userId, id);
  }

  @Post('approvals/:id/remove')
  removeApproval(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.recurring.removeApproval(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateRecurringPaymentDto,
  ) {
    return this.recurring.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.recurring.remove(user.userId, id);
  }
}
