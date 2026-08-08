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
import { CarsService } from './cars.service';
import {
  AddDriveDto,
  CompleteMaintenanceDto,
  CreateCarDto,
  CreateMaintenanceItemDto,
  RecordOdometerDto,
  UpdateCarDto,
  UpdateMaintenanceItemDto,
} from './dto/car.dto';

@ApiTags('cars')
@ApiBearerAuth()
@Controller('cars')
export class CarsController {
  constructor(private cars: CarsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('date') date?: string) {
    return this.cars.list(user.userId, date);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCarDto) {
    return this.cars.create(user.userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCarDto,
  ) {
    return this.cars.update(user.userId, id, dto);
  }

  @Post(':id/drives')
  addDrive(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AddDriveDto,
  ) {
    return this.cars.addDrive(user.userId, id, dto);
  }

  @Post(':id/odometer')
  recordOdometer(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: RecordOdometerDto,
  ) {
    return this.cars.recordOdometer(user.userId, id, dto);
  }

  @Post(':id/maintenance')
  addMaintenance(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateMaintenanceItemDto,
  ) {
    return this.cars.addMaintenance(user.userId, id, dto);
  }

  @Patch(':id/maintenance/:itemId')
  updateMaintenance(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateMaintenanceItemDto,
  ) {
    return this.cars.updateMaintenance(user.userId, id, itemId, dto);
  }

  @Post(':id/maintenance/:itemId/complete')
  completeMaintenance(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: CompleteMaintenanceDto,
  ) {
    return this.cars.completeMaintenance(user.userId, id, itemId, dto);
  }

  @Delete(':id/maintenance/:itemId')
  removeMaintenance(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cars.removeMaintenance(user.userId, id, itemId);
  }
}
