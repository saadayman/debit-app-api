import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { endOfMonth, format } from 'date-fns';
import ExcelJS from 'exceljs';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

const HEADER_FILL = 'FF1F2937';
const ACCENT_FILL = 'FFF3F4F6';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  private num(n: unknown): number {
    return Math.round(Number(n ?? 0) * 100) / 100;
  }

  /**
   * Builds a workbook for one salary cycle. Expenses are selected by their
   * salary link, not their calendar month, so a cycle may cross month borders.
   */
  async buildSalaryWorkbook(
    userId: string,
    salaryIncomeId: string,
  ): Promise<{
    buffer: Buffer;
    salaryLabel: string;
    salaryDate: Date;
    currency: string;
  }> {
    const salary = await this.prisma.income.findFirst({
      where: { id: salaryIncomeId, userId, source: 'SALARY' },
      include: { job: true },
    });
    if (!salary) throw new NotFoundException('Salary payment not found');

    const [settings, expenses] = await Promise.all([
      this.prisma.settings.upsert({
        where: { userId },
        create: { userId },
        update: {},
      }),
      this.prisma.expense.findMany({
        where: { userId, salaryIncomeId: salary.id },
        include: { category: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    const currency = settings.currency || 'USD';
    const salaryLabel =
      salary.job?.name ||
      salary.description ||
      format(salary.date, 'MMMM yyyy');
    const dateFmt = 'yyyy-MM-dd';
    const totalIncome = this.num(salary.amount);
    const totalExpenses = this.num(
      expenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
    );
    const remaining = this.num(totalIncome - totalExpenses);

    const byCategory = new Map<string, number>();
    for (const expense of expenses) {
      const name = expense.category?.name ?? 'Uncategorized';
      byCategory.set(
        name,
        (byCategory.get(name) ?? 0) + Number(expense.amount),
      );
    }

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Debit App';
    wb.created = new Date();

    const money = `#,##0.00 "${currency}"`;
    const styleHeader = (row: ExcelJS.Row) => {
      row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: HEADER_FILL },
        };
      });
    };

    const summary = wb.addWorksheet('Summary');
    summary.columns = [{ width: 28 }, { width: 18 }, { width: 14 }];
    summary.addRow([`Salary report - ${salaryLabel}`]).font = {
      bold: true,
      size: 16,
    };
    summary.addRow([`Salary received ${format(salary.date, dateFmt)}`]).font = {
      italic: true,
      color: { argb: 'FF6B7280' },
    };
    summary.addRow([
      `Generated ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
    ]).font = { italic: true, color: { argb: 'FF6B7280' } };
    summary.addRow([]);

    const totalsHeader = summary.addRow(['Totals', 'Amount']);
    styleHeader(totalsHeader);
    const incomeRow = summary.addRow(['Salary received', totalIncome]);
    const expenseRow = summary.addRow(['Total expenses', totalExpenses]);
    const remainingRow = summary.addRow(['Remaining from salary', remaining]);
    for (const row of [incomeRow, expenseRow, remainingRow]) {
      row.getCell(2).numFmt = money;
    }
    remainingRow.font = { bold: true };
    remainingRow.getCell(2).font = {
      bold: true,
      color: { argb: remaining < 0 ? 'FFDC2626' : 'FF16A34A' },
    };

    summary.addRow([]);
    const categoryHeader = summary.addRow([
      'Spending by category',
      'Amount',
      '%',
    ]);
    styleHeader(categoryHeader);
    const sortedCategories = [...byCategory.entries()].sort(
      (a, b) => b[1] - a[1],
    );
    for (const [name, amount] of sortedCategories) {
      const row = summary.addRow([
        name,
        this.num(amount),
        totalExpenses > 0 ? amount / totalExpenses : 0,
      ]);
      row.getCell(2).numFmt = money;
      row.getCell(3).numFmt = '0.0%';
    }

    const expenseSheet = wb.addWorksheet('Expenses');
    expenseSheet.columns = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Description', key: 'description', width: 32 },
      { header: 'Payment', key: 'payment', width: 16 },
      { header: 'Amount', key: 'amount', width: 16 },
    ];
    styleHeader(expenseSheet.getRow(1));
    for (const expense of expenses) {
      const row = expenseSheet.addRow({
        date: format(expense.date, dateFmt),
        category: expense.category?.name ?? 'Uncategorized',
        description: expense.description ?? '',
        payment: expense.paymentMethod.replace(/_/g, ' ').toLowerCase(),
        amount: this.num(expense.amount),
      });
      row.getCell('amount').numFmt = money;
    }
    const expenseTotal = expenseSheet.addRow({
      description: 'Total',
      amount: totalExpenses,
    });
    expenseTotal.font = { bold: true };
    expenseTotal.getCell('amount').numFmt = money;

    const salarySheet = wb.addWorksheet('Salary');
    salarySheet.columns = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Source', key: 'source', width: 18 },
      { header: 'From', key: 'from', width: 22 },
      { header: 'Description', key: 'description', width: 32 },
      { header: 'Amount', key: 'amount', width: 16 },
    ];
    styleHeader(salarySheet.getRow(1));
    const salaryRow = salarySheet.addRow({
      date: format(salary.date, dateFmt),
      source: 'salary',
      from: salary.job?.name ?? '',
      description: salary.description ?? '',
      amount: totalIncome,
    });
    salaryRow.getCell('amount').numFmt = money;

    for (const sheet of [expenseSheet, salarySheet]) {
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1 && rowNumber % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: ACCENT_FILL },
            };
          });
        }
      });
    }

    const arrayBuffer = await wb.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      salaryLabel,
      salaryDate: salary.date,
      currency,
    };
  }

  private async latestSalaryId(userId: string): Promise<string> {
    const salary = await this.prisma.income.findFirst({
      where: { userId, source: 'SALARY' },
      orderBy: { date: 'desc' },
      select: { id: true },
    });
    if (!salary) throw new NotFoundException('No salary payment found');
    return salary.id;
  }

  /** Builds and emails a report for a selected (or latest) salary cycle. */
  async sendSalaryReport(
    userId: string,
    salaryIncomeId?: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const selectedSalaryId =
      salaryIncomeId ?? (await this.latestSalaryId(userId));
    const { buffer, salaryLabel, salaryDate } = await this.buildSalaryWorkbook(
      userId,
      selectedSalaryId,
    );
    const filename = `debit-app-salary-report-${format(salaryDate, 'yyyy-MM-dd')}.xlsx`;
    await this.mail.sendMail({
      to: user.email,
      subject: `Your ${salaryLabel} salary report`,
      html: `
        <p>Hi ${user.name || 'there'},</p>
        <p>Attached is your salary report for <strong>${salaryLabel}</strong>.
        It includes the selected salary payment and every expense assigned to
        that salary cycle.</p>
        <p>You can turn these emails off anytime in Settings.</p>
        <p>- Debit App</p>`,
      text: `Your ${salaryLabel} salary report is attached.`,
      attachments: [
        {
          filename,
          content: buffer,
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ],
    });
    this.logger.log(
      `Salary report emailed to ${user.email} (${selectedSalaryId})`,
    );
  }

  /** Email the latest salary report to opted-in users on their chosen day. */
  @Cron('0 8 * * *')
  async dispatchDueReports(): Promise<void> {
    const now = new Date();
    const today = now.getDate();
    const lastDay = endOfMonth(now).getDate();
    const recipients = await this.prisma.settings.findMany({
      where: {
        monthlyReportEmail: true,
        user: { emailVerifiedAt: { not: null } },
      },
      select: { userId: true, monthlyReportDay: true },
    });

    let sent = 0;
    for (const recipient of recipients) {
      const day = Math.min(recipient.monthlyReportDay, lastDay);
      if (day !== today) continue;
      try {
        await this.sendSalaryReport(recipient.userId);
        sent++;
      } catch (error) {
        this.logger.error(
          `Salary report failed for user ${recipient.userId}: ${String(error)}`,
        );
      }
    }
    if (sent > 0) this.logger.log(`Dispatched ${sent} salary report(s)`);
  }
}
