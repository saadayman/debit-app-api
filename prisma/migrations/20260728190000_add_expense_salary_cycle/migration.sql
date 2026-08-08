-- Link an expense to the actual salary payment that funds it. The relation is
-- optional so existing expenses remain valid and can be assigned later.
ALTER TABLE "Expense" ADD COLUMN "salaryIncomeId" TEXT;

CREATE INDEX "Expense_userId_salaryIncomeId_idx"
ON "Expense"("userId", "salaryIncomeId");

ALTER TABLE "Expense"
ADD CONSTRAINT "Expense_salaryIncomeId_fkey"
FOREIGN KEY ("salaryIncomeId") REFERENCES "Income"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
