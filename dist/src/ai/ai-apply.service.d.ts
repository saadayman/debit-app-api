import { DebtsService } from '../debts/debts.service';
import { ExpensesService } from '../expenses/expenses.service';
import { IncomeService } from '../income/income.service';
import { InstallmentsService } from '../installments/installments.service';
import { PrismaService } from '../prisma/prisma.service';
import { SavingsService } from '../savings/savings.service';
import { ProposalAction } from './ai-actions';
type Input = Record<string, any>;
export declare class AiApplyService {
    private prisma;
    private expenses;
    private income;
    private installments;
    private debts;
    private savings;
    constructor(prisma: PrismaService, expenses: ExpensesService, income: IncomeService, installments: InstallmentsService, debts: DebtsService, savings: SavingsService);
    private today;
    private num;
    private resolveCategoryId;
    apply(userId: string, action: ProposalAction, input: Input): Promise<{
        action: ProposalAction;
        summary: string;
        id: string;
    }>;
}
export {};
