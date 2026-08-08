import { PrismaService } from '../prisma/prisma.service';
export type CalendarEventType = 'salary' | 'income' | 'expectedSalary' | 'recurring' | 'debt' | 'receivable' | 'installment';
export interface CalendarEvent {
    date: string;
    type: CalendarEventType;
    label: string;
    amount: number;
}
export declare class CalendarService {
    private prisma;
    constructor(prisma: PrismaService);
    private iso;
    private recurringOccurrences;
    month(userId: string, month?: string): Promise<{
        month: string;
        events: CalendarEvent[];
    }>;
}
