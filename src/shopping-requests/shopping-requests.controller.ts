import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  CreateShoppingRequestDto,
  ListShoppingRequestsQueryDto,
  PurchaseShoppingRequestDto,
} from './dto/shopping-request.dto';
import { ShoppingRequestsService } from './shopping-requests.service';

@ApiTags('shopping requests')
@ApiBearerAuth()
@Controller('shopping-requests')
export class ShoppingRequestsController {
  constructor(private requests: ShoppingRequestsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListShoppingRequestsQueryDto) {
    return this.requests.list(user.userId, query);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateShoppingRequestDto) {
    return this.requests.create(user.userId, dto);
  }

  @Post(':id/purchase')
  purchase(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: PurchaseShoppingRequestDto) {
    return this.requests.purchase(user.userId, id, dto);
  }

  @Post(':id/reject')
  reject(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.requests.reject(user.userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.requests.remove(user.userId, id);
  }
}
