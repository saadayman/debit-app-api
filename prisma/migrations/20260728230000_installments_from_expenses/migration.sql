-- New installment plans belong to a salary cycle. Existing plans are linked
-- to the salary of their most recent recorded installment expense when known.
ALTER TABLE "Installment" ADD COLUMN "salaryIncomeId" TEXT;

UPDATE "Installment" AS installment
SET "salaryIncomeId" = linked."salaryIncomeId"
FROM (
  SELECT DISTINCT ON ("installmentId")
    "installmentId",
    "salaryIncomeId"
  FROM "Expense"
  WHERE "installmentId" IS NOT NULL
    AND "salaryIncomeId" IS NOT NULL
  ORDER BY "installmentId", "date" DESC
) AS linked
WHERE installment."id" = linked."installmentId";

-- Payments created by the app previously incremented paidInstallments and
-- created an Expense. Convert the stored value to a historical baseline so
-- the derived total (baseline + expense count) does not double-count them.
UPDATE "Installment" AS installment
SET "paidInstallments" = GREATEST(
  installment."paidInstallments" - linked."expenseCount",
  0
)
FROM (
  SELECT "installmentId", COUNT(*)::INTEGER AS "expenseCount"
  FROM "Expense"
  WHERE "installmentId" IS NOT NULL
  GROUP BY "installmentId"
) AS linked
WHERE installment."id" = linked."installmentId";

CREATE INDEX "Installment_userId_salaryIncomeId_idx"
ON "Installment"("userId", "salaryIncomeId");

ALTER TABLE "Installment"
ADD CONSTRAINT "Installment_salaryIncomeId_fkey"
FOREIGN KEY ("salaryIncomeId") REFERENCES "Income"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
