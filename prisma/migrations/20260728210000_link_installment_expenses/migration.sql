-- Identify expenses created by installment payments while preserving the
-- historical expense if an installment plan is later removed.
ALTER TABLE "Expense" ADD COLUMN "installmentId" TEXT;

CREATE INDEX "Expense_userId_installmentId_idx"
ON "Expense"("userId", "installmentId");

ALTER TABLE "Expense"
ADD CONSTRAINT "Expense_installmentId_fkey"
FOREIGN KEY ("installmentId") REFERENCES "Installment"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
