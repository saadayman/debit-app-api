"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installmentDueInMonth = installmentDueInMonth;
function monthIndex(year, monthZeroBased) {
    return year * 12 + monthZeroBased;
}
function installmentDueInMonth(installment, monthStart, now = new Date()) {
    const startIdx = monthIndex(installment.startDate.getUTCFullYear(), installment.startDate.getUTCMonth());
    const viewedIdx = monthIndex(monthStart.getUTCFullYear(), monthStart.getUTCMonth());
    const monthsSinceStart = viewedIdx - startIdx;
    if (monthsSinceStart < 0)
        return false;
    if (monthsSinceStart >= installment.totalInstallments)
        return false;
    const currentIdx = monthIndex(now.getFullYear(), now.getMonth());
    if (viewedIdx < currentIdx)
        return true;
    return installment.paidInstallments < installment.totalInstallments;
}
//# sourceMappingURL=installment-schedule.js.map