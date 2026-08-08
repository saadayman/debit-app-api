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
exports.CompleteMaintenanceDto = exports.UpdateMaintenanceItemDto = exports.CreateMaintenanceItemDto = exports.RecordOdometerDto = exports.AddDriveDto = exports.UpdateCarDto = exports.CreateCarDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
class CreateCarDto {
    make;
    model;
    year;
    odometerKm;
    dailyCommuteKm;
    commuteDays;
    autoTrackingEnabled;
    asOfDate;
    lastOilChangeOdometerKm;
}
exports.CreateCarDto = CreateCarDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateCarDto.prototype, "make", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateCarDto.prototype, "model", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1886),
    (0, class_validator_1.Max)(2100),
    __metadata("design:type", Number)
], CreateCarDto.prototype, "year", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 1 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCarDto.prototype, "odometerKm", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 1 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCarDto.prototype, "dailyCommuteKm", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.ArrayMaxSize)(7),
    (0, class_validator_1.IsInt)({ each: true }),
    (0, class_validator_1.Min)(0, { each: true }),
    (0, class_validator_1.Max)(6, { each: true }),
    __metadata("design:type", Array)
], CreateCarDto.prototype, "commuteDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCarDto.prototype, "autoTrackingEnabled", void 0);
__decorate([
    (0, class_validator_1.Matches)(DATE_PATTERN),
    __metadata("design:type", String)
], CreateCarDto.prototype, "asOfDate", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 1 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCarDto.prototype, "lastOilChangeOdometerKm", void 0);
class UpdateCarFieldsDto {
    make;
    model;
    year;
    dailyCommuteKm;
    commuteDays;
    autoTrackingEnabled;
    asOfDate;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateCarFieldsDto.prototype, "make", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateCarFieldsDto.prototype, "model", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1886),
    (0, class_validator_1.Max)(2100),
    __metadata("design:type", Number)
], UpdateCarFieldsDto.prototype, "year", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 1 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateCarFieldsDto.prototype, "dailyCommuteKm", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.ArrayMaxSize)(7),
    (0, class_validator_1.IsInt)({ each: true }),
    (0, class_validator_1.Min)(0, { each: true }),
    (0, class_validator_1.Max)(6, { each: true }),
    __metadata("design:type", Array)
], UpdateCarFieldsDto.prototype, "commuteDays", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCarFieldsDto.prototype, "autoTrackingEnabled", void 0);
__decorate([
    (0, class_validator_1.Matches)(DATE_PATTERN),
    __metadata("design:type", String)
], UpdateCarFieldsDto.prototype, "asOfDate", void 0);
class UpdateCarDto extends (0, swagger_1.PartialType)(UpdateCarFieldsDto) {
}
exports.UpdateCarDto = UpdateCarDto;
class AddDriveDto {
    distanceKm;
    date;
    notes;
}
exports.AddDriveDto = AddDriveDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 1 }),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Max)(5000),
    __metadata("design:type", Number)
], AddDriveDto.prototype, "distanceKm", void 0);
__decorate([
    (0, class_validator_1.Matches)(DATE_PATTERN),
    __metadata("design:type", String)
], AddDriveDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], AddDriveDto.prototype, "notes", void 0);
class RecordOdometerDto {
    odometerKm;
    date;
    notes;
}
exports.RecordOdometerDto = RecordOdometerDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 1 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RecordOdometerDto.prototype, "odometerKm", void 0);
__decorate([
    (0, class_validator_1.Matches)(DATE_PATTERN),
    __metadata("design:type", String)
], RecordOdometerDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], RecordOdometerDto.prototype, "notes", void 0);
class CreateMaintenanceItemDto {
    name;
    intervalKm;
    lastServiceOdometerKm;
    active;
    notes;
}
exports.CreateMaintenanceItemDto = CreateMaintenanceItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateMaintenanceItemDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 1 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateMaintenanceItemDto.prototype, "intervalKm", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 1 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMaintenanceItemDto.prototype, "lastServiceOdometerKm", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMaintenanceItemDto.prototype, "active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateMaintenanceItemDto.prototype, "notes", void 0);
class UpdateMaintenanceItemDto extends (0, swagger_1.PartialType)(CreateMaintenanceItemDto) {
}
exports.UpdateMaintenanceItemDto = UpdateMaintenanceItemDto;
class CompleteMaintenanceDto {
    date;
    notes;
}
exports.CompleteMaintenanceDto = CompleteMaintenanceDto;
__decorate([
    (0, class_validator_1.Matches)(DATE_PATTERN),
    __metadata("design:type", String)
], CompleteMaintenanceDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CompleteMaintenanceDto.prototype, "notes", void 0);
//# sourceMappingURL=car.dto.js.map