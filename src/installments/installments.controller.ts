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
  CreateInstallmentDto,
  PayInstallmentDto,
  UpdateInstallmentDto,
} from './dto/installment.dto';
import { InstallmentsService } from './installments.service';

@ApiTags('installments')
@ApiBearerAuth()
@Controller('installments')
export class InstallmentsController {
  constructor(private installments: InstallmentsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.installments.list(user.userId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateInstallmentDto) {
    return this.installments.create(user.userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateInstallmentDto,
  ) {
    return this.installments.update(user.userId, id, dto);
  }

  @Post(':id/pay')
  pay(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: PayInstallmentDto,
  ) {
    return this.installments.pay(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.installments.remove(user.userId, id);
  }
}
