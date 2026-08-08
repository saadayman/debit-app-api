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
exports.AiApplyService = void 0;
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const debts_service_1 = require("../debts/debts.service");
const expenses_service_1 = require("../expenses/expenses.service");
const income_service_1 = require("../income/income.service");
const installments_service_1 = require("../installments/installments.service");
const prisma_service_1 = require("../prisma/prisma.service");
const savings_service_1 = require("../savings/savings.service");
const ai_actions_1 = require("./ai-actions");
let AiApplyService = class AiApplyService {
    prisma;
    expenses;
    income;
    installments;
    debts;
    savings;
    constructor(prisma, expenses, income, installments, debts, savings) {
        this.prisma = prisma;
        this.expenses = expenses;
        this.income = income;
        this.installments = installments;
        this.debts = debts;
        this.savings = savings;
    }
    today() {
        return (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd');
    }
    num(v, field) {
        const n = Number(v);
        if (!Number.isFinite(n)) {
            throw new common_1.BadRequestException(`${field} must be a number`);
        }
        return n;
    }
    async resolveCategoryId(userId, name) {
        const cats = await this.prisma.category.findMany({
            where: { OR: [{ userId }, { isDefault: true }] },
            select: { id: true, name: true, isDefault: true },
        });
        if (cats.length === 0) {
            throw new common_1.BadRequestException('No categories exist to file this expense under');
        }
        if (name) {
            const match = cats.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
            if (match)
                return match.id;
        }
        const fallback = cats.find((c) => /other|misc|uncategor/i.test(c.name)) ??
            cats.find((c) => c.isDefault) ??
            cats[0];
        return fallback.id;
    }
    async apply(userId, action, input) {
        let created;
        switch (action) {
            case 'add_expense': {
                const categoryId = await this.resolveCategoryId(userId, input.categoryName);
                created = await this.expenses.create(userId, {
                    amount: this.num(input.amount, 'amount'),
                    date: input.date || this.today(),
                    categoryId,
                    paymentMethod: input.paymentMethod || 'CASH',
                    description: input.description,
                });
                break;
            }
            case 'add_income': {
                created = await this.income.create(userId, {
                    amount: this.num(input.amount, 'amount'),
                    date: input.date || this.today(),
                    source: input.source || 'OTHER',
                    description: input.description,
                });
                break;
            }
            case 'add_installment': {
                created = await this.installments.create(userId, {
                    name: String(input.name ?? 'Installment'),
                    totalPrice: this.num(input.totalPrice, 'totalPrice'),
                    monthlyAmount: this.num(input.monthlyAmount, 'monthlyAmount'),
                    totalInstallments: Math.trunc(this.num(input.totalInstallments, 'totalInstallments')),
                    downPayment: input.downPayment != null
                        ? this.num(input.downPayment, 'downPayment')
                        : undefined,
                    startDate: input.startDate || this.today(),
                });
                break;
            }
            case 'add_debt': {
                created = await this.debts.create(userId, {
                    name: String(input.name ?? 'Debt'),
                    type: input.type || 'OTHER',
                    originalAmount: this.num(input.originalAmount, 'originalAmount'),
                    direction: input.direction || 'OWED_BY_ME',
                    counterparty: input.counterparty,
                    monthlyPayment: input.monthlyPayment != null
                        ? this.num(input.monthlyPayment, 'monthlyPayment')
                        : undefined,
                    startDate: input.startDate || this.today(),
                    dueDate: input.dueDate || undefined,
                });
                break;
            }
            case 'add_savings': {
                created = await this.savings.create(userId, {
                    type: input.assetType,
                    name: String(input.name ?? 'Asset'),
                    goldForm: input.goldForm,
                    quantity: input.quantity != null ? Math.trunc(Number(input.quantity)) : undefined,
                    weightGrams: input.weightGrams != null ? Number(input.weightGrams) : undefined,
                    karat: input.karat != null ? Math.trunc(Number(input.karat)) : undefined,
                    amount: input.amount != null ? Number(input.amount) : undefined,
                });
                break;
            }
            default:
                throw new common_1.BadRequestException(`Unknown action: ${action}`);
        }
        return { action, summary: (0, ai_actions_1.summarizeProposal)(action, input), id: created.id };
    }
};
exports.AiApplyService = AiApplyService;
exports.AiApplyService = AiApplyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        expenses_service_1.ExpensesService,
        income_service_1.IncomeService,
        installments_service_1.InstallmentsService,
        debts_service_1.DebtsService,
        savings_service_1.SavingsService])
], AiApplyService);
//# sourceMappingURL=ai-apply.service.js.map