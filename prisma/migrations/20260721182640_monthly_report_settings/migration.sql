-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "monthlyReportDay" INTEGER NOT NULL DEFAULT 27,
ADD COLUMN     "monthlyReportEmail" BOOLEAN NOT NULL DEFAULT false;
