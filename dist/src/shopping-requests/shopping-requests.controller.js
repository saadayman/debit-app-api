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
exports.ShoppingRequestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const shopping_request_dto_1 = require("./dto/shopping-request.dto");
const shopping_requests_service_1 = require("./shopping-requests.service");
let ShoppingRequestsController = class ShoppingRequestsController {
    requests;
    constructor(requests) {
        this.requests = requests;
    }
    list(user, query) {
        return this.requests.list(user.userId, query);
    }
    create(user, dto) {
        return this.requests.create(user.userId, dto);
    }
    purchase(user, id, dto) {
        return this.requests.purchase(user.userId, id, dto);
    }
    reject(user, id) {
        return this.requests.reject(user.userId, id);
    }
    remove(user, id) {
        return this.requests.remove(user.userId, id);
    }
};
exports.ShoppingRequestsController = ShoppingRequestsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, shopping_request_dto_1.ListShoppingRequestsQueryDto]),
    __metadata("design:returntype", void 0)
], ShoppingRequestsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, shopping_request_dto_1.CreateShoppingRequestDto]),
    __metadata("design:returntype", void 0)
], ShoppingRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/purchase'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, shopping_request_dto_1.PurchaseShoppingRequestDto]),
    __metadata("design:returntype", void 0)
], ShoppingRequestsController.prototype, "purchase", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShoppingRequestsController.prototype, "reject", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShoppingRequestsController.prototype, "remove", null);
exports.ShoppingRequestsController = ShoppingRequestsController = __decorate([
    (0, swagger_1.ApiTags)('shopping requests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('shopping-requests'),
    __metadata("design:paramtypes", [shopping_requests_service_1.ShoppingRequestsService])
], ShoppingRequestsController);
//# sourceMappingURL=shopping-requests.controller.js.map