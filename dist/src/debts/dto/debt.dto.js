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
exports.UpdateDebtPaymentDto = exports.CreateDebtPaymentDto = exports.ListDebtsQueryDto = exports.UpdateDebtDto = exports.CreateDebtDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateDebtDto {
    name;
    direction;
    type;
    originalAmount;
    interestRate;
    monthlyPayment;
    startDate;
    dueDate;
    counterparty;
    notes;
}
exports.CreateDebtDto = CreateDebtDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateDebtDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.DebtDirection),
    __metadata("design:type", String)
], CreateDebtDto.prototype, "direction", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.DebtType),
    __metadata("design:type", String)
], CreateDebtDto.prototype, "type", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateDebtDto.prototype, "originalAmount", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDebtDto.prototype, "interestRate", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Object)
], CreateDebtDto.prototype, "monthlyPayment", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDebtDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDebtDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateDebtDto.prototype, "counterparty", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateDebtDto.prototype, "notes", void 0);
class UpdateDebtDto extends (0, swagger_1.PartialType)(CreateDebtDto) {
}
exports.UpdateDebtDto = UpdateDebtDto;
class ListDebtsQueryDto {
    direction;
}
exports.ListDebtsQueryDto = ListDebtsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.DebtDirection),
    __metadata("design:type", String)
], ListDebtsQueryDto.prototype, "direction", void 0);
class CreateDebtPaymentDto {
    amount;
    date;
    isExtra;
    notes;
}
exports.CreateDebtPaymentDto = CreateDebtPaymentDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateDebtPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDebtPaymentDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDebtPaymentDto.prototype, "isExtra", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateDebtPaymentDto.prototype, "notes", void 0);
class UpdateDebtPaymentDto extends (0, swagger_1.PartialType)(CreateDebtPaymentDto) {
}
exports.UpdateDebtPaymentDto = UpdateDebtPaymentDto;
//# sourceMappingURL=debt.dto.js.map