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
import {
  CreateIncomeDto,
  ListIncomeQueryDto,
  UpdateIncomeDto,
} from './dto/income.dto';
import { IncomeService } from './income.service';

@ApiTags('income')
@ApiBearerAuth()
@Controller('income')
export class IncomeController {
  constructor(private income: IncomeService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListIncomeQueryDto) {
    return this.income.list(user.userId, query);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateIncomeDto) {
    return this.income.create(user.userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateIncomeDto,
  ) {
    return this.income.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.income.remove(user.userId, id);
  }
}
