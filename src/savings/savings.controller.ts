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
  CreateSavingsAssetDto,
  UpdateSavingsAssetDto,
} from './dto/savings.dto';
import { SavingsService } from './savings.service';

@ApiTags('savings')
@ApiBearerAuth()
@Controller('savings')
export class SavingsController {
  constructor(private savings: SavingsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.savings.list(user.userId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSavingsAssetDto) {
    return this.savings.create(user.userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateSavingsAssetDto,
  ) {
    return this.savings.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.savings.remove(user.userId, id);
  }
}
