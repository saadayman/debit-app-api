-- AlterTable
ALTER TABLE "DebtPayment" ADD COLUMN "savingsAssetId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DebtPayment_savingsAssetId_key" ON "DebtPayment"("savingsAssetId");

-- AddForeignKey
ALTER TABLE "DebtPayment" ADD CONSTRAINT "DebtPayment_savingsAssetId_fkey" FOREIGN KEY ("savingsAssetId") REFERENCES "SavingsAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
