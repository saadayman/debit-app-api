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
exports.CarsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const cars_service_1 = require("./cars.service");
const car_dto_1 = require("./dto/car.dto");
let CarsController = class CarsController {
    cars;
    constructor(cars) {
        this.cars = cars;
    }
    list(user, date) {
        return this.cars.list(user.userId, date);
    }
    create(user, dto) {
        return this.cars.create(user.userId, dto);
    }
    update(user, id, dto) {
        return this.cars.update(user.userId, id, dto);
    }
    addDrive(user, id, dto) {
        return this.cars.addDrive(user.userId, id, dto);
    }
    recordOdometer(user, id, dto) {
        return this.cars.recordOdometer(user.userId, id, dto);
    }
    addMaintenance(user, id, dto) {
        return this.cars.addMaintenance(user.userId, id, dto);
    }
    updateMaintenance(user, id, itemId, dto) {
        return this.cars.updateMaintenance(user.userId, id, itemId, dto);
    }
    completeMaintenance(user, id, itemId, dto) {
        return this.cars.completeMaintenance(user.userId, id, itemId, dto);
    }
    removeMaintenance(user, id, itemId) {
        return this.cars.removeMaintenance(user.userId, id, itemId);
    }
};
exports.CarsController = CarsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, car_dto_1.CreateCarDto]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, car_dto_1.UpdateCarDto]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/drives'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, car_dto_1.AddDriveDto]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "addDrive", null);
__decorate([
    (0, common_1.Post)(':id/odometer'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, car_dto_1.RecordOdometerDto]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "recordOdometer", null);
__decorate([
    (0, common_1.Post)(':id/maintenance'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, car_dto_1.CreateMaintenanceItemDto]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "addMaintenance", null);
__decorate([
    (0, common_1.Patch)(':id/maintenance/:itemId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, car_dto_1.UpdateMaintenanceItemDto]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "updateMaintenance", null);
__decorate([
    (0, common_1.Post)(':id/maintenance/:itemId/complete'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, car_dto_1.CompleteMaintenanceDto]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "completeMaintenance", null);
__decorate([
    (0, common_1.Delete)(':id/maintenance/:itemId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "removeMaintenance", null);
exports.CarsController = CarsController = __decorate([
    (0, swagger_1.ApiTags)('cars'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('cars'),
    __metadata("design:paramtypes", [cars_service_1.CarsService])
], CarsController);
//# sourceMappingURL=cars.controller.js.map