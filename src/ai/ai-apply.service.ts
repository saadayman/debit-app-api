import { BadRequestException, Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { DebtsService } from '../debts/debts.service';
import { ExpensesService } from '../expenses/expenses.service';
import { IncomeService } from '../income/income.service';
import { InstallmentsService } from '../installments/installments.service';
import { PrismaService } from '../prisma/prisma.service';
import { SavingsService } from '../savings/savings.service';
import { ProposalAction, summarizeProposal } from './ai-actions';

type Input = Record<string, any>;

@Injectable()
export class AiApplyService {
  constructor(
    private prisma: PrismaService,
    private expenses: ExpensesService,
    private income: IncomeService,
    private installments: InstallmentsService,
    private debts: DebtsService,
    private savings: SavingsService,
  ) {}

  private today(): string {
    return format(new Date(), 'yyyy-MM-dd');
  }

  private num(v: unknown, field: string): number {
    const n = Number(v);
    if (!Number.isFinite(n)) {
      throw new BadRequestException(`${field} must be a number`);
    }
    return n;
  }

  /** Resolves a category name to an id owned by (or default-available to) the user. */
  private async resolveCategoryId(
    userId: string,
    name?: string,
  ): Promise<string> {
    const cats = await this.prisma.category.findMany({
      where: { OR: [{ userId }, { isDefault: true }] },
      select: { id: true, name: true, isDefault: true },
    });
    if (cats.length === 0) {
      throw new BadRequestException('No categories exist to file this expense under');
    }
    if (name) {
      const match = cats.find(
        (c) => c.name.toLowerCase() === name.trim().toLowerCase(),
      );
      if (match) return match.id;
    }
    // Fall back to an "Other"/default category, else the first available.
    const fallback =
      cats.find((c) => /other|misc|uncategor/i.test(c.name)) ??
      cats.find((c) => c.isDefault) ??
      cats[0];
    return fallback.id;
  }

  /** Executes an approved proposal, returning a summary of what was created. */
  async apply(
    userId: string,
    action: ProposalAction,
    input: Input,
  ): Promise<{ action: ProposalAction; summary: string; id: string }> {
    let created: { id: string };

    switch (action) {
      case 'add_expense': {
        const categoryId = await this.resolveCategoryId(
          userId,
          input.categoryName,
        );
        created = await this.expenses.create(userId, {
          amount: this.num(input.amount, 'amount'),
          date: input.date || this.today(),
          categoryId,
          paymentMethod: input.paymentMethod || 'CASH',
          description: input.description,
        });
        break;
      }
      case 'add_income': {
        created = await this.income.create(userId, {
          amount: this.num(input.amount, 'amount'),
          date: input.date || this.today(),
          source: input.source || 'OTHER',
          description: input.description,
        });
        break;
      }
      case 'add_installment': {
        created = await this.installments.create(userId, {
          name: String(input.name ?? 'Installment'),
          totalPrice: this.num(input.totalPrice, 'totalPrice'),
          monthlyAmount: this.num(input.monthlyAmount, 'monthlyAmount'),
          totalInstallments: Math.trunc(
            this.num(input.totalInstallments, 'totalInstallments'),
          ),
          downPayment:
            input.downPayment != null
              ? this.num(input.downPayment, 'downPayment')
              : undefined,
          startDate: input.startDate || this.today(),
        });
        break;
      }
      case 'add_debt': {
        created = await this.debts.create(userId, {
          name: String(input.name ?? 'Debt'),
          type: input.type || 'OTHER',
          originalAmount: this.num(input.originalAmount, 'originalAmount'),
          direction: input.direction || 'OWED_BY_ME',
          counterparty: input.counterparty,
          monthlyPayment:
            input.monthlyPayment != null
              ? this.num(input.monthlyPayment, 'monthlyPayment')
              : undefined,
          startDate: input.startDate || this.today(),
          dueDate: input.dueDate || undefined,
        });
        break;
      }
      case 'add_savings': {
        created = await this.savings.create(userId, {
          type: input.assetType,
          name: String(input.name ?? 'Asset'),
          goldForm: input.goldForm,
          quantity:
            input.quantity != null ? Math.trunc(Number(input.quantity)) : undefined,
          weightGrams:
            input.weightGrams != null ? Number(input.weightGrams) : undefined,
          karat: input.karat != null ? Math.trunc(Number(input.karat)) : undefined,
          amount: input.amount != null ? Number(input.amount) : undefined,
        });
        break;
      }
      default:
        throw new BadRequestException(`Unknown action: ${action as string}`);
    }

    return { action, summary: summarizeProposal(action, input), id: created.id };
  }
}
