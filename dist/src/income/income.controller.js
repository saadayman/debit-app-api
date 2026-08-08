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
exports.IncomeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const income_dto_1 = require("./dto/income.dto");
const income_service_1 = require("./income.service");
let IncomeController = class IncomeController {
    income;
    constructor(income) {
        this.income = income;
    }
    list(user, query) {
        return this.income.list(user.userId, query);
    }
    create(user, dto) {
        return this.income.create(user.userId, dto);
    }
    update(user, id, dto) {
        return this.income.update(user.userId, id, dto);
    }
    remove(user, id) {
        return this.income.remove(user.userId, id);
    }
};
exports.IncomeController = IncomeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, income_dto_1.ListIncomeQueryDto]),
    __metadata("design:returntype", void 0)
], IncomeController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, income_dto_1.CreateIncomeDto]),
    __metadata("design:returntype", void 0)
], IncomeController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, income_dto_1.UpdateIncomeDto]),
    __metadata("design:returntype", void 0)
], IncomeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IncomeController.prototype, "remove", null);
exports.IncomeController = IncomeController = __decorate([
    (0, swagger_1.ApiTags)('income'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('income'),
    __metadata("design:paramtypes", [income_service_1.IncomeService])
], IncomeController);
//# sourceMappingURL=income.controller.js.map