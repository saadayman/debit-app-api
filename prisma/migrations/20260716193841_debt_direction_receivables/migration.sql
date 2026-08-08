-- CreateEnum
CREATE TYPE "DebtDirection" AS ENUM ('OWED_BY_ME', 'OWED_TO_ME');

-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "direction" "DebtDirection" NOT NULL DEFAULT 'OWED_BY_ME',
ALTER COLUMN "monthlyPayment" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Debt_userId_direction_idx" ON "Debt"("userId", "direction");
