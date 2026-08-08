-- CreateEnum
CREATE TYPE "DriveType" AS ENUM ('COMMUTE', 'PERSONAL', 'ODOMETER_READING');

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "odometerKm" DECIMAL(12,1) NOT NULL,
    "dailyCommuteKm" DECIMAL(8,1) NOT NULL DEFAULT 0,
    "commuteDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "autoTrackingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastAutoSyncDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriveLog" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" "DriveType" NOT NULL,
    "date" DATE NOT NULL,
    "distanceKm" DECIMAL(10,1) NOT NULL,
    "odometerAfterKm" DECIMAL(12,1) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriveLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceItem" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "intervalKm" DECIMAL(10,1) NOT NULL,
    "lastServiceOdometerKm" DECIMAL(12,1) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "odometerKm" DECIMAL(12,1) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vehicle_userId_idx" ON "Vehicle"("userId");
CREATE INDEX "DriveLog_vehicleId_date_idx" ON "DriveLog"("vehicleId", "date");
CREATE INDEX "MaintenanceItem_vehicleId_idx" ON "MaintenanceItem"("vehicleId");
CREATE INDEX "MaintenanceRecord_itemId_date_idx" ON "MaintenanceRecord"("itemId", "date");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DriveLog" ADD CONSTRAINT "DriveLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaintenanceItem" ADD CONSTRAINT "MaintenanceItem_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MaintenanceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
