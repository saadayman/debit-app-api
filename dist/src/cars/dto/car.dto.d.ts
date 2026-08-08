export declare class CreateCarDto {
    make: string;
    model: string;
    year: number;
    odometerKm: number;
    dailyCommuteKm: number;
    commuteDays: number[];
    autoTrackingEnabled?: boolean;
    asOfDate: string;
    lastOilChangeOdometerKm: number;
}
declare class UpdateCarFieldsDto {
    make: string;
    model: string;
    year: number;
    dailyCommuteKm: number;
    commuteDays: number[];
    autoTrackingEnabled: boolean;
    asOfDate: string;
}
declare const UpdateCarDto_base: import("@nestjs/common").Type<Partial<UpdateCarFieldsDto>>;
export declare class UpdateCarDto extends UpdateCarDto_base {
}
export declare class AddDriveDto {
    distanceKm: number;
    date: string;
    notes?: string;
}
export declare class RecordOdometerDto {
    odometerKm: number;
    date: string;
    notes?: string;
}
export declare class CreateMaintenanceItemDto {
    name: string;
    intervalKm: number;
    lastServiceOdometerKm?: number;
    active?: boolean;
    notes?: string;
}
declare const UpdateMaintenanceItemDto_base: import("@nestjs/common").Type<Partial<CreateMaintenanceItemDto>>;
export declare class UpdateMaintenanceItemDto extends UpdateMaintenanceItemDto_base {
}
export declare class CompleteMaintenanceDto {
    date: string;
    notes?: string;
}
export {};
