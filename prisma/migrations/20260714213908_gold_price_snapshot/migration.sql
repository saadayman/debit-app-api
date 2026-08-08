-- CreateTable
CREATE TABLE "GoldPriceSnapshot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "spotUsdPerOz" DECIMAL(12,2) NOT NULL,
    "perGram24kJod" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoldPriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoldPriceSnapshot_date_key" ON "GoldPriceSnapshot"("date");
