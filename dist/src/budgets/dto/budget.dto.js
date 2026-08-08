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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListBudgetsQueryDto = exports.UpdateBudgetDto = exports.CreateBudgetDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
class CreateBudgetDto {
    month;
    amount;
    categoryId;
}
exports.CreateBudgetDto = CreateBudgetDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(MONTH_PATTERN, { message: 'month must be in YYYY-MM format' }),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "month", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateBudgetDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBudgetDto.prototype, "categoryId", void 0);
class UpdateBudgetDto extends (0, swagger_1.PartialType)(CreateBudgetDto) {
}
exports.UpdateBudgetDto = UpdateBudgetDto;
class ListBudgetsQueryDto {
    month;
}
exports.ListBudgetsQueryDto = ListBudgetsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(MONTH_PATTERN, { message: 'month must be in YYYY-MM format' }),
    __metadata("design:type", String)
], ListBudgetsQueryDto.prototype, "month", void 0);
//# sourceMappingURL=budget.dto.js.map