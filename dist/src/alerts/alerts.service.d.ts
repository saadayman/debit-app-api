import { CarsService } from '../cars/cars.service';
import { GoldPriceService } from '../prices/gold-price.service';
import { PrismaService } from '../prisma/prisma.service';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export interface Alert {
    id: string;
    type: 'budget_exceeded' | 'budget_near' | 'low_balance' | 'upcoming_recurring' | 'upcoming_salary' | 'debt_due' | 'receivable_due' | 'gold_moved' | 'maintenance_due' | 'maintenance_soon';
    severity: AlertSeverity;
    data: Record<string, unknown>;
}
export declare class AlertsService {
    private prisma;
    private goldPrice;
    private cars;
    constructor(prisma: PrismaService, goldPrice: GoldPriceService, cars: CarsService);
    list(userId: string): Promise<{
        alerts: Alert[];
    }>;
}
