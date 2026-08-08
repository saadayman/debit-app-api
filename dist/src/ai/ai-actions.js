"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_TOOLS = exports.PROPOSAL_ACTIONS = void 0;
exports.summarizeProposal = summarizeProposal;
exports.PROPOSAL_ACTIONS = [
    'add_expense',
    'add_income',
    'add_installment',
    'add_debt',
    'add_savings',
];
const PAYMENT_METHODS = [
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER',
    'DIGITAL_WALLET',
];
const INCOME_SOURCES = [
    'SALARY',
    'FREELANCE',
    'BONUS',
    'INVESTMENT',
    'RENTAL',
    'OTHER',
];
const DEBT_TYPES = [
    'PERSONAL_LOAN',
    'CAR_LOAN',
    'HOME_LOAN',
    'CREDIT_CARD',
    'INSTALLMENT',
    'BNPL',
    'OTHER',
];
const GOLD_FORMS = ['JEWELLERY', 'RASHADI_LIRA', 'SOVEREIGN', 'BAR'];
exports.AI_TOOLS = [
    {
        name: 'add_expense',
        description: 'Record money the user spent. Use for purchases, bills, and outgoing payments.',
        parameters: {
            type: 'object',
            additionalProperties: false,
            properties: {
                amount: {
                    type: 'number',
                    description: 'Amount spent, in the user currency',
                },
                categoryName: {
                    type: 'string',
                    description: "Category name, matched to the user's existing categories (e.g. Food, Transport). Optional.",
                },
                description: {
                    type: 'string',
                    description: 'Short note, e.g. "lunch"',
                },
                date: {
                    type: 'string',
                    description: 'Date as YYYY-MM-DD. Defaults to today.',
                },
                paymentMethod: { type: 'string', enum: PAYMENT_METHODS },
            },
            required: ['amount'],
        },
    },
    {
        name: 'add_income',
        description: 'Record money the user received (salary, freelance payment, etc.).',
        parameters: {
            type: 'object',
            additionalProperties: false,
            properties: {
                amount: { type: 'number' },
                source: { type: 'string', enum: INCOME_SOURCES },
                description: { type: 'string' },
                date: { type: 'string', description: 'YYYY-MM-DD. Defaults to today.' },
            },
            required: ['amount'],
        },
    },
    {
        name: 'add_installment',
        description: 'Record a purchase paid over monthly installments (e.g. a phone on a 6-month plan).',
        parameters: {
            type: 'object',
            additionalProperties: false,
            properties: {
                name: { type: 'string' },
                totalPrice: { type: 'number', description: 'Total price of the item' },
                monthlyAmount: {
                    type: 'number',
                    description: 'Amount paid each month',
                },
                totalInstallments: {
                    type: 'integer',
                    description: 'Number of monthly payments',
                },
                downPayment: { type: 'number' },
                startDate: {
                    type: 'string',
                    description: 'YYYY-MM-DD. Defaults to today.',
                },
            },
            required: ['name', 'totalPrice', 'monthlyAmount', 'totalInstallments'],
        },
    },
    {
        name: 'add_debt',
        description: 'Record a debt or loan. direction OWED_BY_ME = the user owes it; OWED_TO_ME = someone owes the user.',
        parameters: {
            type: 'object',
            additionalProperties: false,
            properties: {
                name: { type: 'string' },
                type: { type: 'string', enum: DEBT_TYPES },
                originalAmount: { type: 'number' },
                direction: { type: 'string', enum: ['OWED_BY_ME', 'OWED_TO_ME'] },
                counterparty: {
                    type: 'string',
                    description: 'The lender or the person who owes the user',
                },
                monthlyPayment: { type: 'number' },
                startDate: {
                    type: 'string',
                    description: 'YYYY-MM-DD. Defaults to today.',
                },
                dueDate: { type: 'string', description: 'YYYY-MM-DD, optional' },
            },
            required: ['name', 'type', 'originalAmount'],
        },
    },
    {
        name: 'add_savings',
        description: 'Record a savings asset. For GOLD coins use goldForm (RASHADI_LIRA/SOVEREIGN) with quantity; for gold by weight use JEWELLERY/BAR with weightGrams and karat; for CASH/OTHER use amount.',
        parameters: {
            type: 'object',
            additionalProperties: false,
            properties: {
                assetType: {
                    type: 'string',
                    enum: ['GOLD', 'SILVER', 'CASH', 'OTHER'],
                },
                name: { type: 'string' },
                goldForm: { type: 'string', enum: GOLD_FORMS },
                quantity: {
                    type: 'integer',
                    description: 'Number of coins for RASHADI_LIRA/SOVEREIGN',
                },
                weightGrams: { type: 'number' },
                karat: { type: 'integer', description: '24, 21, 18, or 14' },
                amount: { type: 'number', description: 'Value for CASH/OTHER assets' },
            },
            required: ['assetType', 'name'],
        },
    },
];
function summarizeProposal(action, input) {
    const display = (value, fallback = '') => typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : fallback;
    switch (action) {
        case 'add_expense':
            return [
                'Expense',
                display(input.amount),
                display(input.categoryName) && `· ${display(input.categoryName)}`,
                display(input.description) && `· ${display(input.description)}`,
            ]
                .filter(Boolean)
                .join(' ');
        case 'add_income':
            return [
                'Income',
                display(input.amount),
                display(input.source) && `· ${display(input.source)}`,
            ]
                .filter(Boolean)
                .join(' ');
        case 'add_installment':
            return `Installment: ${display(input.name)} — ${display(input.totalPrice)} over ${display(input.totalInstallments)}×${display(input.monthlyAmount)}`;
        case 'add_debt':
            return `Debt (${display(input.direction, 'OWED_BY_ME')}): ${display(input.name)} — ${display(input.originalAmount)}`;
        case 'add_savings':
            return `Savings: ${display(input.name)} (${display(input.assetType)}${display(input.goldForm) ? ` · ${display(input.goldForm)}` : ''})`;
        default:
            return action;
    }
}
//# sourceMappingURL=ai-actions.js.map