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
exports.SavingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const savings_dto_1 = require("./dto/savings.dto");
const savings_service_1 = require("./savings.service");
let SavingsController = class SavingsController {
    savings;
    constructor(savings) {
        this.savings = savings;
    }
    list(user) {
        return this.savings.list(user.userId);
    }
    create(user, dto) {
        return this.savings.create(user.userId, dto);
    }
    update(user, id, dto) {
        return this.savings.update(user.userId, id, dto);
    }
    remove(user, id) {
        return this.savings.remove(user.userId, id);
    }
};
exports.SavingsController = SavingsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SavingsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, savings_dto_1.CreateSavingsAssetDto]),
    __metadata("design:returntype", void 0)
], SavingsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, savings_dto_1.UpdateSavingsAssetDto]),
    __metadata("design:returntype", void 0)
], SavingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SavingsController.prototype, "remove", null);
exports.SavingsController = SavingsController = __decorate([
    (0, swagger_1.ApiTags)('savings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('savings'),
    __metadata("design:paramtypes", [savings_service_1.SavingsService])
], SavingsController);
//# sourceMappingURL=savings.controller.js.map