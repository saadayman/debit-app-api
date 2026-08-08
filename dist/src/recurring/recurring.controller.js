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
exports.RecurringController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const recurring_dto_1 = require("./dto/recurring.dto");
const recurring_service_1 = require("./recurring.service");
let RecurringController = class RecurringController {
    recurring;
    constructor(recurring) {
        this.recurring = recurring;
    }
    list(user) {
        return this.recurring.list(user.userId);
    }
    create(user, dto) {
        return this.recurring.create(user.userId, dto);
    }
    generate(user) {
        return this.recurring.generateDueExpenses(user.userId);
    }
    approvals(user) {
        return this.recurring.listApprovals(user.userId);
    }
    approve(user, id) {
        return this.recurring.approve(user.userId, id);
    }
    removeApproval(user, id) {
        return this.recurring.removeApproval(user.userId, id);
    }
    update(user, id, dto) {
        return this.recurring.update(user.userId, id, dto);
    }
    remove(user, id) {
        return this.recurring.remove(user.userId, id);
    }
};
exports.RecurringController = RecurringController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecurringController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, recurring_dto_1.CreateRecurringPaymentDto]),
    __metadata("design:returntype", void 0)
], RecurringController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecurringController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)('approvals'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecurringController.prototype, "approvals", null);
__decorate([
    (0, common_1.Post)('approvals/:id/approve'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecurringController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('approvals/:id/remove'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecurringController.prototype, "removeApproval", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, recurring_dto_1.UpdateRecurringPaymentDto]),
    __metadata("design:returntype", void 0)
], RecurringController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecurringController.prototype, "remove", null);
exports.RecurringController = RecurringController = __decorate([
    (0, swagger_1.ApiTags)('recurring'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('recurring'),
    __metadata("design:paramtypes", [recurring_service_1.RecurringService])
], RecurringController);
//# sourceMappingURL=recurring.controller.js.map