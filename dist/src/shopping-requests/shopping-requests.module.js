"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const shopping_requests_controller_1 = require("./shopping-requests.controller");
const shopping_requests_service_1 = require("./shopping-requests.service");
let ShoppingRequestsModule = class ShoppingRequestsModule {
};
exports.ShoppingRequestsModule = ShoppingRequestsModule;
exports.ShoppingRequestsModule = ShoppingRequestsModule = __decorate([
    (0, common_1.Module)({
        controllers: [shopping_requests_controller_1.ShoppingRequestsController],
        providers: [shopping_requests_service_1.ShoppingRequestsService],
    })
], ShoppingRequestsModule);
//# sourceMappingURL=shopping-requests.module.js.map