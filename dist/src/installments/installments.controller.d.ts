import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateInstallmentDto, PayInstallmentDto, UpdateInstallmentDto } from './dto/installment.dto';
import { InstallmentsService } from './installments.service';
export declare class InstallmentsController {
    private installments;
    constructor(installments: InstallmentsService);
    list(user: AuthUser): Promise<{
        paidInstallments: number;
        historicalPaidInstallments: number;
        recordedExpenseCount: number;
        remainingInstallments: number;
        paidAmount: number;
        remainingBalance: number;
        percentPaid: number;
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        downPayment: import("@prisma/client/runtime/library").Decimal;
        monthlyAmount: import("@prisma/client/runtime/library").Decimal;
        totalInstallments: number;
        startDate: Date;
        salaryIncomeId: string | null;
        _count?: {
            expenses: number;
        };
    }[]>;
    create(user: AuthUser, dto: CreateInstallmentDto): Promise<{
        paidInstallments: number;
        historicalPaidInstallments: number;
        recordedExpenseCount: number;
        remainingInstallments: number;
        paidAmount: number;
        remainingBalance: number;
        percentPaid: number;
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        downPayment: import("@prisma/client/runtime/library").Decimal;
        monthlyAmount: import("@prisma/client/runtime/library").Decimal;
        totalInstallments: number;
        startDate: Date;
        salaryIncomeId: string | null;
        _count?: {
            expenses: number;
        };
    }>;
    update(user: AuthUser, id: string, dto: UpdateInstallmentDto): Promise<{
        paidInstallments: number;
        historicalPaidInstallments: number;
        recordedExpenseCount: number;
        remainingInstallments: number;
        paidAmount: number;
        remainingBalance: number;
        percentPaid: number;
        id: string;
        name: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        downPayment: import("@prisma/client/runtime/library").Decimal;
        monthlyAmount: import("@prisma/client/runtime/library").Decimal;
        totalInstallments: number;
        startDate: Date;
        salaryIncomeId: string | null;
        _count?: {
            expenses: number;
        };
    }>;
    pay(user: AuthUser, id: string, dto: PayInstallmentDto): Promise<{
        installment: {
            paidInstallments: number;
            historicalPaidInstallments: number;
            recordedExpenseCount: number;
            remainingInstallments: number;
            paidAmount: number;
            remainingBalance: number;
            percentPaid: number;
            id: string;
            name: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
            downPayment: import("@prisma/client/runtime/library").Decimal;
            monthlyAmount: import("@prisma/client/runtime/library").Decimal;
            totalInstallments: number;
            startDate: Date;
            salaryIncomeId: string | null;
            _count?: {
                expenses: number;
            };
        };
        expense: {
            category: {
                id: string;
                name: string;
                nameAr: string | null;
                icon: string | null;
                color: string | null;
                isDefault: boolean;
                userId: string | null;
                createdAt: Date;
            };
            salaryIncome: ({
                job: {
                    id: string;
                    name: string;
                    userId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    type: import("@prisma/client").$Enums.JobType;
                    employer: string | null;
                    expectedAmount: import("@prisma/client/runtime/library").Decimal | null;
                    payDayOfMonth: number | null;
                    active: boolean;
                    notes: string | null;
                } | null;
            } & {
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                date: Date;
                source: import("@prisma/client").$Enums.IncomeSource;
                description: string | null;
                jobId: string | null;
            }) | null;
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            date: Date;
            description: string | null;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            categoryId: string;
            salaryIncomeId: string | null;
            installmentId: string | null;
            recurringPaymentId: string | null;
        };
    }>;
    remove(user: AuthUser, id: string): Promise<{
        message: string;
    }>;
}
