-- CreateEnum
CREATE TYPE "RecurringApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REMOVED');

-- CreateTable
CREATE TABLE "RecurringApproval" (
    "id" TEXT NOT NULL,
    "recurringPaymentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "RecurringApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringApproval_recurringPaymentId_status_idx" ON "RecurringApproval"("recurringPaymentId", "status");

-- CreateIndex
CREATE INDEX "RecurringApproval_userId_status_idx" ON "RecurringApproval"("userId", "status");

-- AddForeignKey
ALTER TABLE "RecurringApproval" ADD CONSTRAINT "RecurringApproval_recurringPaymentId_fkey" FOREIGN KEY ("recurringPaymentId") REFERENCES "RecurringPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
