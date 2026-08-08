import { Module } from '@nestjs/common';
import { RecurringModule } from '../recurring/recurring.module';
import { SavingsModule } from '../savings/savings.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [RecurringModule, SavingsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
