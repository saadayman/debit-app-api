"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOLD_FORM_KEYS = exports.GOLD_FORMS = void 0;
exports.roundGrams = roundGrams;
exports.GOLD_FORMS = {
    RASHADI_LIRA: { gramsPerUnit: 7.216, karat: 21, counted: true },
    SOVEREIGN: { gramsPerUnit: 7.99, karat: 22, counted: true },
    BAR: { gramsPerUnit: null, karat: null, counted: false },
    JEWELLERY: { gramsPerUnit: null, karat: null, counted: false },
};
exports.GOLD_FORM_KEYS = Object.keys(exports.GOLD_FORMS);
function roundGrams(g) {
    return Math.round(g * 1000) / 1000;
}
//# sourceMappingURL=gold-forms.js.map