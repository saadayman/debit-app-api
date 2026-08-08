import { Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { format } from 'date-fns';
import type { Response } from 'express';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReportService } from './report.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private reports: ReportService) {}

  /** Download one salary payment and only the expenses linked to it. */
  @Get('salary')
  async download(
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
    @Query('salaryIncomeId') salaryIncomeId: string,
  ) {
    const { buffer, salaryDate } = await this.reports.buildSalaryWorkbook(
      user.userId,
      salaryIncomeId,
    );
    const stamp = format(salaryDate, 'yyyy-MM-dd');
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="debit-app-salary-report-${stamp}.xlsx"`,
    });
    res.send(buffer);
  }

  /** Email the report for the selected salary payment. */
  @Post('salary/email')
  async emailNow(
    @CurrentUser() user: AuthUser,
    @Query('salaryIncomeId') salaryIncomeId: string,
  ) {
    await this.reports.sendSalaryReport(user.userId, salaryIncomeId);
    return { message: 'Report sent' };
  }
}
