import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CarsService } from './cars.service';
import { AddDriveDto, CompleteMaintenanceDto, CreateCarDto, CreateMaintenanceItemDto, RecordOdometerDto, UpdateCarDto, UpdateMaintenanceItemDto } from './dto/car.dto';
export declare class CarsController {
    private cars;
    constructor(cars: CarsService);
    list(user: AuthUser, date?: string): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: import("@prisma/client/runtime/library").Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: import("@prisma/client/runtime/library").Decimal;
            lastServiceOdometerKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        } & {
            dueAtKm: number;
            remainingKm: number;
            progressPercent: number;
            status: "OVERDUE" | "DUE_SOON" | "OK";
            estimatedDueDate: string | null;
        })[];
        drives: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.DriveType;
            notes: string | null;
            date: Date;
            distanceKm: import("@prisma/client/runtime/library").Decimal;
            odometerAfterKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: import("@prisma/client/runtime/library").Decimal;
        dailyCommuteKm: import("@prisma/client/runtime/library").Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }[]>;
    create(user: AuthUser, dto: CreateCarDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: import("@prisma/client/runtime/library").Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: import("@prisma/client/runtime/library").Decimal;
            lastServiceOdometerKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        } & {
            dueAtKm: number;
            remainingKm: number;
            progressPercent: number;
            status: "OVERDUE" | "DUE_SOON" | "OK";
            estimatedDueDate: string | null;
        })[];
        drives: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.DriveType;
            notes: string | null;
            date: Date;
            distanceKm: import("@prisma/client/runtime/library").Decimal;
            odometerAfterKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: import("@prisma/client/runtime/library").Decimal;
        dailyCommuteKm: import("@prisma/client/runtime/library").Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    update(user: AuthUser, id: string, dto: UpdateCarDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: import("@prisma/client/runtime/library").Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: import("@prisma/client/runtime/library").Decimal;
            lastServiceOdometerKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        } & {
            dueAtKm: number;
            remainingKm: number;
            progressPercent: number;
            status: "OVERDUE" | "DUE_SOON" | "OK";
            estimatedDueDate: string | null;
        })[];
        drives: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.DriveType;
            notes: string | null;
            date: Date;
            distanceKm: import("@prisma/client/runtime/library").Decimal;
            odometerAfterKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: import("@prisma/client/runtime/library").Decimal;
        dailyCommuteKm: import("@prisma/client/runtime/library").Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    addDrive(user: AuthUser, id: string, dto: AddDriveDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: import("@prisma/client/runtime/library").Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: import("@prisma/client/runtime/library").Decimal;
            lastServiceOdometerKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        } & {
            dueAtKm: number;
            remainingKm: number;
            progressPercent: number;
            status: "OVERDUE" | "DUE_SOON" | "OK";
            estimatedDueDate: string | null;
        })[];
        drives: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.DriveType;
            notes: string | null;
            date: Date;
            distanceKm: import("@prisma/client/runtime/library").Decimal;
            odometerAfterKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: import("@prisma/client/runtime/library").Decimal;
        dailyCommuteKm: import("@prisma/client/runtime/library").Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    recordOdometer(user: AuthUser, id: string, dto: RecordOdometerDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: import("@prisma/client/runtime/library").Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: import("@prisma/client/runtime/library").Decimal;
            lastServiceOdometerKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        } & {
            dueAtKm: number;
            remainingKm: number;
            progressPercent: number;
            status: "OVERDUE" | "DUE_SOON" | "OK";
            estimatedDueDate: string | null;
        })[];
        drives: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.DriveType;
            notes: string | null;
            date: Date;
            distanceKm: import("@prisma/client/runtime/library").Decimal;
            odometerAfterKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: import("@prisma/client/runtime/library").Decimal;
        dailyCommuteKm: import("@prisma/client/runtime/library").Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    addMaintenance(user: AuthUser, id: string, dto: CreateMaintenanceItemDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: import("@prisma/client/runtime/library").Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: import("@prisma/client/runtime/library").Decimal;
            lastServiceOdometerKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        } & {
            dueAtKm: number;
            remainingKm: number;
            progressPercent: number;
            status: "OVERDUE" | "DUE_SOON" | "OK";
            estimatedDueDate: string | null;
        })[];
        drives: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.DriveType;
            notes: string | null;
            date: Date;
            distanceKm: import("@prisma/client/runtime/library").Decimal;
            odometerAfterKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: import("@prisma/client/runtime/library").Decimal;
        dailyCommuteKm: import("@prisma/client/runtime/library").Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    updateMaintenance(user: AuthUser, id: string, itemId: string, dto: UpdateMaintenanceItemDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: import("@prisma/client/runtime/library").Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: import("@prisma/client/runtime/library").Decimal;
            lastServiceOdometerKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        } & {
            dueAtKm: number;
            remainingKm: number;
            progressPercent: number;
            status: "OVERDUE" | "DUE_SOON" | "OK";
            estimatedDueDate: string | null;
        })[];
        drives: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.DriveType;
            notes: string | null;
            date: Date;
            distanceKm: import("@prisma/client/runtime/library").Decimal;
            odometerAfterKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: import("@prisma/client/runtime/library").Decimal;
        dailyCommuteKm: import("@prisma/client/runtime/library").Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    completeMaintenance(user: AuthUser, id: string, itemId: string, dto: CompleteMaintenanceDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: import("@prisma/client/runtime/library").Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: import("@prisma/client/runtime/library").Decimal;
            lastServiceOdometerKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        } & {
            dueAtKm: number;
            remainingKm: number;
            progressPercent: number;
            status: "OVERDUE" | "DUE_SOON" | "OK";
            estimatedDueDate: string | null;
        })[];
        drives: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.DriveType;
            notes: string | null;
            date: Date;
            distanceKm: import("@prisma/client/runtime/library").Decimal;
            odometerAfterKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: import("@prisma/client/runtime/library").Decimal;
        dailyCommuteKm: import("@prisma/client/runtime/library").Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    removeMaintenance(user: AuthUser, id: string, itemId: string): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: import("@prisma/client/runtime/library").Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: import("@prisma/client/runtime/library").Decimal;
            lastServiceOdometerKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        } & {
            dueAtKm: number;
            remainingKm: number;
            progressPercent: number;
            status: "OVERDUE" | "DUE_SOON" | "OK";
            estimatedDueDate: string | null;
        })[];
        drives: {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.DriveType;
            notes: string | null;
            date: Date;
            distanceKm: import("@prisma/client/runtime/library").Decimal;
            odometerAfterKm: import("@prisma/client/runtime/library").Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: import("@prisma/client/runtime/library").Decimal;
        dailyCommuteKm: import("@prisma/client/runtime/library").Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
}
