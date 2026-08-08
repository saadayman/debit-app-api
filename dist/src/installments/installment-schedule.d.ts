export interface InstallmentSchedule {
    startDate: Date;
    totalInstallments: number;
    paidInstallments: number;
}
export declare function installmentDueInMonth(installment: InstallmentSchedule, monthStart: Date, now?: Date): boolean;
