"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const schedule_1 = require("@nestjs/schedule");
const ai_module_1 = require("./ai/ai.module");
const alerts_module_1 = require("./alerts/alerts.module");
const analytics_module_1 = require("./analytics/analytics.module");
const auth_module_1 = require("./auth/auth.module");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const budgets_module_1 = require("./budgets/budgets.module");
const calendar_module_1 = require("./calendar/calendar.module");
const cars_module_1 = require("./cars/cars.module");
const categories_module_1 = require("./categories/categories.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const debts_module_1 = require("./debts/debts.module");
const expenses_module_1 = require("./expenses/expenses.module");
const income_module_1 = require("./income/income.module");
const installments_module_1 = require("./installments/installments.module");
const jobs_module_1 = require("./jobs/jobs.module");
const mail_module_1 = require("./mail/mail.module");
const prices_module_1 = require("./prices/prices.module");
const prisma_module_1 = require("./prisma/prisma.module");
const recurring_module_1 = require("./recurring/recurring.module");
const reports_module_1 = require("./reports/reports.module");
const savings_module_1 = require("./savings/savings.module");
const settings_module_1 = require("./settings/settings.module");
const shopping_requests_module_1 = require("./shopping-requests/shopping-requests.module");
const households_module_1 = require("./households/households.module");
const requester_access_guard_1 = require("./auth/guards/requester-access.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            mail_module_1.MailModule,
            prices_module_1.PricesModule,
            auth_module_1.AuthModule,
            settings_module_1.SettingsModule,
            shopping_requests_module_1.ShoppingRequestsModule,
            households_module_1.HouseholdsModule,
            categories_module_1.CategoriesModule,
            jobs_module_1.JobsModule,
            income_module_1.IncomeModule,
            expenses_module_1.ExpensesModule,
            debts_module_1.DebtsModule,
            installments_module_1.InstallmentsModule,
            recurring_module_1.RecurringModule,
            budgets_module_1.BudgetsModule,
            savings_module_1.SavingsModule,
            dashboard_module_1.DashboardModule,
            analytics_module_1.AnalyticsModule,
            calendar_module_1.CalendarModule,
            cars_module_1.CarsModule,
            alerts_module_1.AlertsModule,
            reports_module_1.ReportsModule,
            ai_module_1.AiModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: requester_access_guard_1.RequesterAccessGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map