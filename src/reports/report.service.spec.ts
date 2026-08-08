import { NotFoundException } from '@nestjs/common';
import { ReportService } from './report.service';

describe('ReportService salary reports', () => {
  const incomeFindFirst = jest.fn();
  const settingsUpsert = jest.fn();
  const expenseFindMany = jest.fn();

  const service = new ReportService(
    {
      income: { findFirst: incomeFindFirst },
      settings: { upsert: settingsUpsert },
      expense: { findMany: expenseFindMany },
    } as never,
    {} as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    incomeFindFirst.mockResolvedValue({
      id: 'salary-1',
      userId: 'user-1',
      amount: 2000,
      date: new Date('2026-07-27T00:00:00.000Z'),
      source: 'SALARY',
      description: 'July salary',
      job: { name: 'Main job' },
    });
    settingsUpsert.mockResolvedValue({ currency: 'JOD' });
    expenseFindMany.mockResolvedValue([
      {
        id: 'expense-1',
        amount: 250,
        date: new Date('2026-08-02T00:00:00.000Z'),
        description: 'Groceries',
        paymentMethod: 'DEBIT_CARD',
        category: { name: 'Food' },
      },
    ]);
  });

  it('selects expenses by salary link even when their dates cross months', async () => {
    const result = await service.buildSalaryWorkbook('user-1', 'salary-1');

    expect(incomeFindFirst).toHaveBeenCalledWith({
      where: { id: 'salary-1', userId: 'user-1', source: 'SALARY' },
      include: { job: true },
    });
    expect(expenseFindMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', salaryIncomeId: 'salary-1' },
      include: { category: true },
      orderBy: { date: 'asc' },
    });
    expect(result.buffer.length).toBeGreaterThan(0);
    expect(result.salaryLabel).toBe('Main job');
  });

  it('rejects a salary payment that does not belong to the user', async () => {
    incomeFindFirst.mockResolvedValue(null);

    await expect(
      service.buildSalaryWorkbook('user-1', 'another-users-salary'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(expenseFindMany).not.toHaveBeenCalled();
  });
});
