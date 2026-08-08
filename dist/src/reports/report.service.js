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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ReportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const date_fns_1 = require("date-fns");
const exceljs_1 = __importDefault(require("exceljs"));
const mail_service_1 = require("../mail/mail.service");
const prisma_service_1 = require("../prisma/prisma.service");
const HEADER_FILL = 'FF1F2937';
const ACCENT_FILL = 'FFF3F4F6';
let ReportService = ReportService_1 = class ReportService {
    prisma;
    mail;
    logger = new common_1.Logger(ReportService_1.name);
    constructor(prisma, mail) {
        this.prisma = prisma;
        this.mail = mail;
    }
    num(n) {
        return Math.round(Number(n ?? 0) * 100) / 100;
    }
    async buildSalaryWorkbook(userId, salaryIncomeId) {
        const salary = await this.prisma.income.findFirst({
            where: { id: salaryIncomeId, userId, source: 'SALARY' },
            include: { job: true },
        });
        if (!salary)
            throw new common_1.NotFoundException('Salary payment not found');
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
        const salaryLabel = salary.job?.name ||
            salary.description ||
            (0, date_fns_1.format)(salary.date, 'MMMM yyyy');
        const dateFmt = 'yyyy-MM-dd';
        const totalIncome = this.num(salary.amount);
        const totalExpenses = this.num(expenses.reduce((sum, expense) => sum + Number(expense.amount), 0));
        const remaining = this.num(totalIncome - totalExpenses);
        const byCategory = new Map();
        for (const expense of expenses) {
            const name = expense.category?.name ?? 'Uncategorized';
            byCategory.set(name, (byCategory.get(name) ?? 0) + Number(expense.amount));
        }
        const wb = new exceljs_1.default.Workbook();
        wb.creator = 'Debit App';
        wb.created = new Date();
        const money = `#,##0.00 "${currency}"`;
        const styleHeader = (row) => {
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
        summary.addRow([`Salary received ${(0, date_fns_1.format)(salary.date, dateFmt)}`]).font = {
            italic: true,
            color: { argb: 'FF6B7280' },
        };
        summary.addRow([
            `Generated ${(0, date_fns_1.format)(new Date(), 'yyyy-MM-dd HH:mm')}`,
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
        const sortedCategories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
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
                date: (0, date_fns_1.format)(expense.date, dateFmt),
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
            date: (0, date_fns_1.format)(salary.date, dateFmt),
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
    async latestSalaryId(userId) {
        const salary = await this.prisma.income.findFirst({
            where: { userId, source: 'SALARY' },
            orderBy: { date: 'desc' },
            select: { id: true },
        });
        if (!salary)
            throw new common_1.NotFoundException('No salary payment found');
        return salary.id;
    }
    async sendSalaryReport(userId, salaryIncomeId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return;
        const selectedSalaryId = salaryIncomeId ?? (await this.latestSalaryId(userId));
        const { buffer, salaryLabel, salaryDate } = await this.buildSalaryWorkbook(userId, selectedSalaryId);
        const filename = `debit-app-salary-report-${(0, date_fns_1.format)(salaryDate, 'yyyy-MM-dd')}.xlsx`;
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
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            ],
        });
        this.logger.log(`Salary report emailed to ${user.email} (${selectedSalaryId})`);
    }
    async dispatchDueReports() {
        const now = new Date();
        const today = now.getDate();
        const lastDay = (0, date_fns_1.endOfMonth)(now).getDate();
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
            if (day !== today)
                continue;
            try {
                await this.sendSalaryReport(recipient.userId);
                sent++;
            }
            catch (error) {
                this.logger.error(`Salary report failed for user ${recipient.userId}: ${String(error)}`);
            }
        }
        if (sent > 0)
            this.logger.log(`Dispatched ${sent} salary report(s)`);
    }
};
exports.ReportService = ReportService;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportService.prototype, "dispatchDueReports", null);
exports.ReportService = ReportService = ReportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], ReportService);
//# sourceMappingURL=report.service.js.map