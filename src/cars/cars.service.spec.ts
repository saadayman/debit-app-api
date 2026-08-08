import { calendarDate, scheduledCommuteDates } from './cars.service';

describe('scheduledCommuteDates', () => {
  it('counts Sunday through Thursday and skips Friday/Saturday', () => {
    const dates = scheduledCommuteDates(
      calendarDate('2026-08-01'),
      calendarDate('2026-08-09'),
      [0, 1, 2, 3, 4],
    );
    expect(dates.map((date) => date.toISOString().slice(0, 10))).toEqual([
      '2026-08-02',
      '2026-08-03',
      '2026-08-04',
      '2026-08-05',
      '2026-08-06',
      '2026-08-09',
    ]);
  });

  it('does not count the already-synced starting date', () => {
    expect(
      scheduledCommuteDates(
        calendarDate('2026-08-02'),
        calendarDate('2026-08-02'),
        [0],
      ),
    ).toHaveLength(0);
  });
});
