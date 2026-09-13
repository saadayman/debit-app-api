import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AiModule } from './ai/ai.module';
import { AlertsModule } from './alerts/alerts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { BudgetsModule } from './budgets/budgets.module';
import { CalendarModule } from './calendar/calendar.module';
import { CarsModule } from './cars/cars.module';
import { CategoriesModule } from './categories/categories.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DebtsModule } from './debts/debts.module';
import { ExpensesModule } from './expenses/expenses.module';
import { IncomeModule } from './income/income.module';
import { InstallmentsModule } from './installments/installments.module';
import { JobsModule } from './jobs/jobs.module';
import { MailModule } from './mail/mail.module';
import { PricesModule } from './prices/prices.module';
import { PrismaModule } from './prisma/prisma.module';
import { RecurringModule } from './recurring/recurring.module';
import { ReportsModule } from './reports/reports.module';
import { SavingsModule } from './savings/savings.module';
import { SettingsModule } from './settings/settings.module';
import { ShoppingRequestsModule } from './shopping-requests/shopping-requests.module';
import { HouseholdsModule } from './households/households.module';
import { RequesterAccessGuard } from './auth/guards/requester-access.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    MailModule,
    PricesModule,
    AuthModule,
    SettingsModule,
    ShoppingRequestsModule,
    HouseholdsModule,
    CategoriesModule,
    JobsModule,
    IncomeModule,
    ExpensesModule,
    DebtsModule,
    InstallmentsModule,
    RecurringModule,
    BudgetsModule,
    SavingsModule,
    DashboardModule,
    AnalyticsModule,
    CalendarModule,
    CarsModule,
    AlertsModule,
    ReportsModule,
    AiModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RequesterAccessGuard },
  ],
})
export class AppModule {}
