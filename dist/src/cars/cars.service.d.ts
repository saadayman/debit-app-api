import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddDriveDto, CompleteMaintenanceDto, CreateCarDto, CreateMaintenanceItemDto, RecordOdometerDto, UpdateCarDto, UpdateMaintenanceItemDto } from './dto/car.dto';
export declare function calendarDate(value: string | Date): Date;
export declare function scheduledCommuteDates(after: Date, through: Date, commuteDays: number[]): Date[];
export declare class CarsService {
    private prisma;
    constructor(prisma: PrismaService);
    private todayDate;
    private findOwn;
    private syncCar;
    private syncOwn;
    private maintenanceComputed;
    private fullCar;
    list(userId: string, date?: string): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: Prisma.Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: Prisma.Decimal;
            lastServiceOdometerKm: Prisma.Decimal;
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
            distanceKm: Prisma.Decimal;
            odometerAfterKm: Prisma.Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: Prisma.Decimal;
        dailyCommuteKm: Prisma.Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }[]>;
    create(userId: string, dto: CreateCarDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: Prisma.Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: Prisma.Decimal;
            lastServiceOdometerKm: Prisma.Decimal;
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
            distanceKm: Prisma.Decimal;
            odometerAfterKm: Prisma.Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: Prisma.Decimal;
        dailyCommuteKm: Prisma.Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    update(userId: string, id: string, dto: UpdateCarDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: Prisma.Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: Prisma.Decimal;
            lastServiceOdometerKm: Prisma.Decimal;
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
            distanceKm: Prisma.Decimal;
            odometerAfterKm: Prisma.Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: Prisma.Decimal;
        dailyCommuteKm: Prisma.Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    addDrive(userId: string, id: string, dto: AddDriveDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: Prisma.Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: Prisma.Decimal;
            lastServiceOdometerKm: Prisma.Decimal;
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
            distanceKm: Prisma.Decimal;
            odometerAfterKm: Prisma.Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: Prisma.Decimal;
        dailyCommuteKm: Prisma.Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    recordOdometer(userId: string, id: string, dto: RecordOdometerDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: Prisma.Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: Prisma.Decimal;
            lastServiceOdometerKm: Prisma.Decimal;
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
            distanceKm: Prisma.Decimal;
            odometerAfterKm: Prisma.Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: Prisma.Decimal;
        dailyCommuteKm: Prisma.Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    addMaintenance(userId: string, carId: string, dto: CreateMaintenanceItemDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: Prisma.Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: Prisma.Decimal;
            lastServiceOdometerKm: Prisma.Decimal;
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
            distanceKm: Prisma.Decimal;
            odometerAfterKm: Prisma.Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: Prisma.Decimal;
        dailyCommuteKm: Prisma.Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    private findOwnItem;
    updateMaintenance(userId: string, carId: string, itemId: string, dto: UpdateMaintenanceItemDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: Prisma.Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: Prisma.Decimal;
            lastServiceOdometerKm: Prisma.Decimal;
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
            distanceKm: Prisma.Decimal;
            odometerAfterKm: Prisma.Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: Prisma.Decimal;
        dailyCommuteKm: Prisma.Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    completeMaintenance(userId: string, carId: string, itemId: string, dto: CompleteMaintenanceDto): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: Prisma.Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: Prisma.Decimal;
            lastServiceOdometerKm: Prisma.Decimal;
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
            distanceKm: Prisma.Decimal;
            odometerAfterKm: Prisma.Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: Prisma.Decimal;
        dailyCommuteKm: Prisma.Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
    removeMaintenance(userId: string, carId: string, itemId: string): Promise<{
        maintenanceItems: ({
            records: {
                id: string;
                createdAt: Date;
                notes: string | null;
                date: Date;
                odometerKm: Prisma.Decimal;
                itemId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            notes: string | null;
            intervalKm: Prisma.Decimal;
            lastServiceOdometerKm: Prisma.Decimal;
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
            distanceKm: Prisma.Decimal;
            odometerAfterKm: Prisma.Decimal;
            vehicleId: string;
        }[];
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        make: string;
        model: string;
        year: number;
        odometerKm: Prisma.Decimal;
        dailyCommuteKm: Prisma.Decimal;
        commuteDays: number[];
        autoTrackingEnabled: boolean;
        lastAutoSyncDate: Date;
    }>;
}
