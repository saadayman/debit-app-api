import type { Response } from 'express';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { ReportService } from './report.service';
export declare class ReportsController {
    private reports;
    constructor(reports: ReportService);
    download(user: AuthUser, res: Response, salaryIncomeId: string): Promise<void>;
    emailNow(user: AuthUser, salaryIncomeId: string): Promise<{
        message: string;
    }>;
}
