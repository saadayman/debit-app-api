import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CalendarService } from './calendar.service';
declare class CalendarQueryDto {
    month?: string;
}
export declare class CalendarController {
    private calendar;
    constructor(calendar: CalendarService);
    month(user: AuthUser, query: CalendarQueryDto): Promise<{
        month: string;
        events: import("./calendar.service").CalendarEvent[];
    }>;
}
export {};
