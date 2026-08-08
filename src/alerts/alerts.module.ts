import { Module } from '@nestjs/common';
import { CarsModule } from '../cars/cars.module';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  imports: [CarsModule],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
