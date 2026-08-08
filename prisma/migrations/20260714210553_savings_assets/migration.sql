-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('GOLD', 'SILVER', 'CASH', 'OTHER');

-- CreateTable
CREATE TABLE "SavingsAsset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "name" TEXT NOT NULL,
    "weightGrams" DECIMAL(12,3),
    "karat" INTEGER,
    "purityPermille" INTEGER,
    "amount" DECIMAL(14,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavingsAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavingsAsset_userId_idx" ON "SavingsAsset"("userId");

-- AddForeignKey
ALTER TABLE "SavingsAsset" ADD CONSTRAINT "SavingsAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
