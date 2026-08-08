import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ReportService {
    private prisma;
    private mail;
    private readonly logger;
    constructor(prisma: PrismaService, mail: MailService);
    private num;
    buildSalaryWorkbook(userId: string, salaryIncomeId: string): Promise<{
        buffer: Buffer;
        salaryLabel: string;
        salaryDate: Date;
        currency: string;
    }>;
    private latestSalaryId;
    sendSalaryReport(userId: string, salaryIncomeId?: string): Promise<void>;
    dispatchDueReports(): Promise<void>;
}
