import { PrismaService } from '../prisma/prisma.service';
import { SavingsService } from '../savings/savings.service';
export declare class AiContextService {
    private prisma;
    private savings;
    constructor(prisma: PrismaService, savings: SavingsService);
    build(userId: string): Promise<{
        currency: string;
        locale: string;
        today: string;
        categories: string[];
        text: string;
    }>;
}
