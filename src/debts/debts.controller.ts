import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DebtsService } from './debts.service';
import {
  CreateDebtDto,
  CreateDebtPaymentDto,
  ListDebtsQueryDto,
  UpdateDebtDto,
  UpdateDebtPaymentDto,
} from './dto/debt.dto';

@ApiTags('debts')
@ApiBearerAuth()
@Controller('debts')
export class DebtsController {
  constructor(private debts: DebtsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListDebtsQueryDto) {
    return this.debts.list(user.userId, query.direction);
  }

  @Get(':id')
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.debts.getOne(user.userId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDebtDto) {
    return this.debts.create(user.userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateDebtDto,
  ) {
    return this.debts.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.debts.remove(user.userId, id);
  }

  @Post(':id/payments')
  addPayment(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateDebtPaymentDto,
  ) {
    return this.debts.addPayment(user.userId, id, dto);
  }

  @Patch(':id/payments/:paymentId')
  updatePayment(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('paymentId') paymentId: string,
    @Body() dto: UpdateDebtPaymentDto,
  ) {
    return this.debts.updatePayment(user.userId, id, paymentId, dto);
  }

  @Delete(':id/payments/:paymentId')
  removePayment(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.debts.removePayment(user.userId, id, paymentId);
  }
}
