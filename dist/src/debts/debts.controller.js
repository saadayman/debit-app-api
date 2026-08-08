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
exports.DebtsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const debts_service_1 = require("./debts.service");
const debt_dto_1 = require("./dto/debt.dto");
let DebtsController = class DebtsController {
    debts;
    constructor(debts) {
        this.debts = debts;
    }
    list(user, query) {
        return this.debts.list(user.userId, query.direction);
    }
    getOne(user, id) {
        return this.debts.getOne(user.userId, id);
    }
    create(user, dto) {
        return this.debts.create(user.userId, dto);
    }
    update(user, id, dto) {
        return this.debts.update(user.userId, id, dto);
    }
    remove(user, id) {
        return this.debts.remove(user.userId, id);
    }
    addPayment(user, id, dto) {
        return this.debts.addPayment(user.userId, id, dto);
    }
    updatePayment(user, id, paymentId, dto) {
        return this.debts.updatePayment(user.userId, id, paymentId, dto);
    }
    removePayment(user, id, paymentId) {
        return this.debts.removePayment(user.userId, id, paymentId);
    }
};
exports.DebtsController = DebtsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, debt_dto_1.ListDebtsQueryDto]),
    __metadata("design:returntype", void 0)
], DebtsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DebtsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, debt_dto_1.CreateDebtDto]),
    __metadata("design:returntype", void 0)
], DebtsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, debt_dto_1.UpdateDebtDto]),
    __metadata("design:returntype", void 0)
], DebtsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DebtsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/payments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, debt_dto_1.CreateDebtPaymentDto]),
    __metadata("design:returntype", void 0)
], DebtsController.prototype, "addPayment", null);
__decorate([
    (0, common_1.Patch)(':id/payments/:paymentId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('paymentId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, debt_dto_1.UpdateDebtPaymentDto]),
    __metadata("design:returntype", void 0)
], DebtsController.prototype, "updatePayment", null);
__decorate([
    (0, common_1.Delete)(':id/payments/:paymentId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], DebtsController.prototype, "removePayment", null);
exports.DebtsController = DebtsController = __decorate([
    (0, swagger_1.ApiTags)('debts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('debts'),
    __metadata("design:paramtypes", [debts_service_1.DebtsService])
], DebtsController);
//# sourceMappingURL=debts.controller.js.map