-- AlterTable
ALTER TABLE "DebtPayment" ADD COLUMN "incomeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DebtPayment_incomeId_key" ON "DebtPayment"("incomeId");

-- AddForeignKey
ALTER TABLE "DebtPayment" ADD CONSTRAINT "DebtPayment_incomeId_fkey" FOREIGN KEY ("incomeId") REFERENCES "Income"("id") ON DELETE SET NULL ON UPDATE CASCADE;
