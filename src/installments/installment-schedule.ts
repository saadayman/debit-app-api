export interface InstallmentSchedule {
  startDate: Date;
  totalInstallments: number;
  paidInstallments: number;
}

/** Month index since year 0 — lets us compare months without timezone drift. */
function monthIndex(year: number, monthZeroBased: number): number {
  return year * 12 + monthZeroBased;
}

/**
 * Is an installment payment due in the given month?
 *
 * A purchase is only paid across its own schedule window — from its start month
 * through `totalInstallments` months — so viewing an earlier month must not
 * deduct a purchase that had not started yet.
 *
 * @param monthStart first day of the month being viewed, built in UTC
 */
export function installmentDueInMonth(
  installment: InstallmentSchedule,
  monthStart: Date,
  now: Date = new Date(),
): boolean {
  const startIdx = monthIndex(
    installment.startDate.getUTCFullYear(),
    installment.startDate.getUTCMonth(),
  );
  const viewedIdx = monthIndex(
    monthStart.getUTCFullYear(),
    monthStart.getUTCMonth(),
  );

  const monthsSinceStart = viewedIdx - startIdx;
  if (monthsSinceStart < 0) return false; // hadn't started yet
  if (monthsSinceStart >= installment.totalInstallments) return false; // finished

  // A month that has already passed was owed regardless of today's progress;
  // only for the current/future month does paying it off early stop the payment.
  const currentIdx = monthIndex(now.getFullYear(), now.getMonth());
  if (viewedIdx < currentIdx) return true;
  return installment.paidInstallments < installment.totalInstallments;
}
