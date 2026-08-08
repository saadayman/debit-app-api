"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const date_fns_1 = require("date-fns");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const report_service_1 = require("./report.service");
let ReportsController = class ReportsController {
    reports;
    constructor(reports) {
        this.reports = reports;
    }
    async download(user, res, salaryIncomeId) {
        const { buffer, salaryDate } = await this.reports.buildSalaryWorkbook(user.userId, salaryIncomeId);
        const stamp = (0, date_fns_1.format)(salaryDate, 'yyyy-MM-dd');
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="debit-app-salary-report-${stamp}.xlsx"`,
        });
        res.send(buffer);
    }
    async emailNow(user, salaryIncomeId) {
        await this.reports.sendSalaryReport(user.userId, salaryIncomeId);
        return { message: 'Report sent' };
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('salary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('salaryIncomeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "download", null);
__decorate([
    (0, common_1.Post)('salary/email'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('salaryIncomeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "emailNow", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [report_service_1.ReportService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map