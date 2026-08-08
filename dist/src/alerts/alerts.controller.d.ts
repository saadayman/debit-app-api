import type { AuthUser } from '../common/decorators/current-user.decorator';
import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private alerts;
    constructor(alerts: AlertsService);
    list(user: AuthUser): Promise<{
        alerts: import("./alerts.service").Alert[];
    }>;
}
