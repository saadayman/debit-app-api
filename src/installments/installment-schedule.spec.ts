import { installmentDueInMonth } from './installment-schedule';

const NOW = new Date('2026-07-15T00:00:00.000Z');
const utcMonth = (ym: string) => new Date(`${ym}-01T00:00:00.000Z`);

describe('installmentDueInMonth', () => {
  it('is not due in a month before the purchase started', () => {
    // Bedroom set: starts 27 Jul 2026 over 3 months.
    const inst = {
      startDate: new Date('2026-07-27T00:00:00.000Z'),
      totalInstallments: 3,
      paidInstallments: 0,
    };
    expect(installmentDueInMonth(inst, utcMonth('2026-06'), NOW)).toBe(false);
    expect(installmentDueInMonth(inst, utcMonth('2026-07'), NOW)).toBe(true);
  });

  it('is due across its whole schedule window and not after', () => {
    // Starts May 2026, 3 payments => May, Jun, Jul.
    const inst = {
      startDate: new Date('2026-05-27T00:00:00.000Z'),
      totalInstallments: 3,
      paidInstallments: 2,
    };
    expect(installmentDueInMonth(inst, utcMonth('2026-04'), NOW)).toBe(false);
    expect(installmentDueInMonth(inst, utcMonth('2026-05'), NOW)).toBe(true);
    expect(installmentDueInMonth(inst, utcMonth('2026-06'), NOW)).toBe(true);
    expect(installmentDueInMonth(inst, utcMonth('2026-07'), NOW)).toBe(true);
    expect(installmentDueInMonth(inst, utcMonth('2026-08'), NOW)).toBe(false);
  });

  it('still counts a past month even once the purchase is fully paid', () => {
    const inst = {
      startDate: new Date('2026-05-27T00:00:00.000Z'),
      totalInstallments: 3,
      paidInstallments: 3,
    };
    expect(installmentDueInMonth(inst, utcMonth('2026-06'), NOW)).toBe(true);
  });

  it('stops charging the current month once it is fully paid off', () => {
    const inst = {
      startDate: new Date('2026-05-27T00:00:00.000Z'),
      totalInstallments: 3,
      paidInstallments: 3,
    };
    expect(installmentDueInMonth(inst, utcMonth('2026-07'), NOW)).toBe(false);
  });

  it('handles a long schedule that spans a year boundary', () => {
    // Starts Nov 2025, 15 payments => Nov 2025 .. Jan 2027.
    const inst = {
      startDate: new Date('2025-11-27T00:00:00.000Z'),
      totalInstallments: 15,
      paidInstallments: 10,
    };
    expect(installmentDueInMonth(inst, utcMonth('2025-10'), NOW)).toBe(false);
    expect(installmentDueInMonth(inst, utcMonth('2025-11'), NOW)).toBe(true);
    expect(installmentDueInMonth(inst, utcMonth('2026-07'), NOW)).toBe(true);
    expect(installmentDueInMonth(inst, utcMonth('2027-01'), NOW)).toBe(true);
    expect(installmentDueInMonth(inst, utcMonth('2027-02'), NOW)).toBe(false);
  });
});
