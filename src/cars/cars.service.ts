import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DriveType, Prisma, Vehicle } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddDriveDto,
  CompleteMaintenanceDto,
  CreateCarDto,
  CreateMaintenanceItemDto,
  RecordOdometerDto,
  UpdateCarDto,
  UpdateMaintenanceItemDto,
} from './dto/car.dto';

const OIL_CHANGE_INTERVAL_KM = 5000;
const DUE_SOON_KM = 500;

export function calendarDate(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
    );
  }
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function scheduledCommuteDates(
  after: Date,
  through: Date,
  commuteDays: number[],
): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(after);
  cursor.setUTCDate(cursor.getUTCDate() + 1);
  while (cursor <= through) {
    if (commuteDays.includes(cursor.getUTCDay())) dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  private todayDate() {
    return calendarDate(new Date());
  }

  private async findOwn(userId: string, id: string) {
    const car = await this.prisma.vehicle.findFirst({ where: { id, userId } });
    if (!car) throw new NotFoundException('Car not found');
    return car;
  }

  private async syncCar(car: Vehicle, through: Date): Promise<void> {
    if (through <= car.lastAutoSyncDate) return;

    const dates = car.autoTrackingEnabled
      ? scheduledCommuteDates(car.lastAutoSyncDate, through, car.commuteDays)
      : [];
    const dailyKm = Number(car.dailyCommuteKm);
    const totalKm = dates.length * dailyKm;

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.vehicle.updateMany({
        where: { id: car.id, lastAutoSyncDate: car.lastAutoSyncDate },
        data: {
          lastAutoSyncDate: through,
          ...(totalKm > 0 ? { odometerKm: { increment: totalKm } } : {}),
        },
      });
      if (updated.count === 0 || totalKm <= 0) return;

      let running = Number(car.odometerKm);
      await tx.driveLog.createMany({
        data: dates.map((date) => {
          running += dailyKm;
          return {
            vehicleId: car.id,
            type: DriveType.COMMUTE,
            date,
            distanceKm: dailyKm,
            odometerAfterKm: running,
            notes: 'Automatic scheduled commute',
          };
        }),
      });
    });
  }

  private async syncOwn(userId: string, id: string, date?: string) {
    const car = await this.findOwn(userId, id);
    await this.syncCar(car, date ? calendarDate(date) : this.todayDate());
  }

  private maintenanceComputed<
    T extends {
      intervalKm: Prisma.Decimal;
      lastServiceOdometerKm: Prisma.Decimal;
    },
  >(
    item: T,
    odometerKm: number,
    car: { dailyCommuteKm: Prisma.Decimal; commuteDays: number[] },
  ) {
    const interval = Number(item.intervalKm);
    const last = Number(item.lastServiceOdometerKm);
    const dueAtKm = last + interval;
    const remainingKm = Math.round((dueAtKm - odometerKm) * 10) / 10;
    const progressPercent = Math.max(
      0,
      Math.min(100, Math.round(((odometerKm - last) / interval) * 100)),
    );
    const weeklyKm = Number(car.dailyCommuteKm) * car.commuteDays.length;
    const daysUntilDue =
      remainingKm > 0 && weeklyKm > 0
        ? Math.ceil((remainingKm / weeklyKm) * 7)
        : remainingKm <= 0
          ? 0
          : null;
    return {
      ...item,
      dueAtKm,
      remainingKm,
      progressPercent,
      status:
        remainingKm <= 0
          ? ('OVERDUE' as const)
          : remainingKm <= Math.max(DUE_SOON_KM, interval * 0.1)
            ? ('DUE_SOON' as const)
            : ('OK' as const),
      estimatedDueDate:
        daysUntilDue == null
          ? null
          : new Date(Date.now() + daysUntilDue * 86_400_000).toISOString(),
    };
  }

  private async fullCar(id: string) {
    const car = await this.prisma.vehicle.findUniqueOrThrow({
      where: { id },
      include: {
        maintenanceItems: {
          include: { records: { orderBy: { date: 'desc' }, take: 5 } },
          orderBy: [{ active: 'desc' }, { createdAt: 'asc' }],
        },
        drives: {
          orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
          take: 20,
        },
      },
    });
    const odometer = Number(car.odometerKm);
    return {
      ...car,
      maintenanceItems: car.maintenanceItems.map((item) =>
        this.maintenanceComputed(item, odometer, car),
      ),
    };
  }

  async list(userId: string, date?: string) {
    const cars = await this.prisma.vehicle.findMany({ where: { userId } });
    const through = date ? calendarDate(date) : this.todayDate();
    await Promise.all(cars.map((car) => this.syncCar(car, through)));
    return Promise.all(cars.map((car) => this.fullCar(car.id)));
  }

  async create(userId: string, dto: CreateCarDto) {
    if (dto.lastOilChangeOdometerKm > dto.odometerKm) {
      throw new BadRequestException(
        'Last oil change reading cannot exceed the current odometer',
      );
    }
    const car = await this.prisma.vehicle.create({
      data: {
        userId,
        make: dto.make.trim(),
        model: dto.model.trim(),
        year: dto.year,
        odometerKm: dto.odometerKm,
        dailyCommuteKm: dto.dailyCommuteKm,
        commuteDays: dto.commuteDays,
        autoTrackingEnabled: dto.autoTrackingEnabled ?? true,
        lastAutoSyncDate: calendarDate(dto.asOfDate),
        maintenanceItems: {
          create: {
            name: 'Engine oil',
            intervalKm: OIL_CHANGE_INTERVAL_KM,
            lastServiceOdometerKm: dto.lastOilChangeOdometerKm,
          },
        },
      },
    });
    return this.fullCar(car.id);
  }

  async update(userId: string, id: string, dto: UpdateCarDto) {
    await this.syncOwn(userId, id, dto.asOfDate);
    await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(dto.make !== undefined ? { make: dto.make.trim() } : {}),
        ...(dto.model !== undefined ? { model: dto.model.trim() } : {}),
        ...(dto.year !== undefined ? { year: dto.year } : {}),
        ...(dto.dailyCommuteKm !== undefined
          ? { dailyCommuteKm: dto.dailyCommuteKm }
          : {}),
        ...(dto.commuteDays !== undefined
          ? { commuteDays: dto.commuteDays }
          : {}),
        ...(dto.autoTrackingEnabled !== undefined
          ? { autoTrackingEnabled: dto.autoTrackingEnabled }
          : {}),
      },
    });
    return this.fullCar(id);
  }

  async addDrive(userId: string, id: string, dto: AddDriveDto) {
    await this.syncOwn(userId, id, dto.date);
    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.vehicle.update({
        where: { id },
        data: { odometerKm: { increment: dto.distanceKm } },
      });
      await tx.driveLog.create({
        data: {
          vehicleId: id,
          type: DriveType.PERSONAL,
          date: calendarDate(dto.date),
          distanceKm: dto.distanceKm,
          odometerAfterKm: next.odometerKm,
          notes: dto.notes?.trim() || null,
        },
      });
      return next;
    });
    return this.fullCar(updated.id);
  }

  async recordOdometer(userId: string, id: string, dto: RecordOdometerDto) {
    await this.syncOwn(userId, id, dto.date);
    const car = await this.findOwn(userId, id);
    const difference = dto.odometerKm - Number(car.odometerKm);
    await this.prisma.$transaction([
      this.prisma.vehicle.update({
        where: { id },
        data: { odometerKm: dto.odometerKm },
      }),
      this.prisma.driveLog.create({
        data: {
          vehicleId: id,
          type: DriveType.ODOMETER_READING,
          date: calendarDate(dto.date),
          distanceKm: difference,
          odometerAfterKm: dto.odometerKm,
          notes:
            dto.notes?.trim() || 'Odometer corrected from dashboard reading',
        },
      }),
    ]);
    return this.fullCar(id);
  }

  async addMaintenance(
    userId: string,
    carId: string,
    dto: CreateMaintenanceItemDto,
  ) {
    const car = await this.findOwn(userId, carId);
    const last = dto.lastServiceOdometerKm ?? Number(car.odometerKm);
    if (last > Number(car.odometerKm)) {
      throw new BadRequestException(
        'Last service reading cannot exceed the current odometer',
      );
    }
    await this.prisma.maintenanceItem.create({
      data: {
        vehicleId: carId,
        name: dto.name.trim(),
        intervalKm: dto.intervalKm,
        lastServiceOdometerKm: last,
        active: dto.active ?? true,
        notes: dto.notes?.trim() || null,
      },
    });
    return this.fullCar(carId);
  }

  private async findOwnItem(userId: string, carId: string, itemId: string) {
    const item = await this.prisma.maintenanceItem.findFirst({
      where: { id: itemId, vehicleId: carId, vehicle: { userId } },
    });
    if (!item) throw new NotFoundException('Maintenance item not found');
    return item;
  }

  async updateMaintenance(
    userId: string,
    carId: string,
    itemId: string,
    dto: UpdateMaintenanceItemDto,
  ) {
    await this.findOwnItem(userId, carId, itemId);
    await this.prisma.maintenanceItem.update({
      where: { id: itemId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.intervalKm !== undefined ? { intervalKm: dto.intervalKm } : {}),
        ...(dto.lastServiceOdometerKm !== undefined
          ? { lastServiceOdometerKm: dto.lastServiceOdometerKm }
          : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        ...(dto.notes !== undefined
          ? { notes: dto.notes?.trim() || null }
          : {}),
      },
    });
    return this.fullCar(carId);
  }

  async completeMaintenance(
    userId: string,
    carId: string,
    itemId: string,
    dto: CompleteMaintenanceDto,
  ) {
    await this.syncOwn(userId, carId, dto.date);
    await this.findOwnItem(userId, carId, itemId);
    const car = await this.findOwn(userId, carId);
    await this.prisma.$transaction([
      this.prisma.maintenanceItem.update({
        where: { id: itemId },
        data: { lastServiceOdometerKm: car.odometerKm },
      }),
      this.prisma.maintenanceRecord.create({
        data: {
          itemId,
          date: calendarDate(dto.date),
          odometerKm: car.odometerKm,
          notes: dto.notes?.trim() || null,
        },
      }),
    ]);
    return this.fullCar(carId);
  }

  async removeMaintenance(userId: string, carId: string, itemId: string) {
    await this.findOwnItem(userId, carId, itemId);
    await this.prisma.maintenanceItem.delete({ where: { id: itemId } });
    return this.fullCar(carId);
  }
}
