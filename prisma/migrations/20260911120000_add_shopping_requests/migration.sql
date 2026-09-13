CREATE TYPE "ShoppingRequestStatus" AS ENUM ('PENDING', 'PURCHASED', 'REJECTED');

CREATE TABLE "ShoppingRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" TEXT,
    "notes" TEXT,
    "categoryId" TEXT NOT NULL,
    "status" "ShoppingRequestStatus" NOT NULL DEFAULT 'PENDING',
    "expenseId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShoppingRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShoppingRequest_expenseId_key" ON "ShoppingRequest"("expenseId");
CREATE INDEX "ShoppingRequest_userId_status_idx" ON "ShoppingRequest"("userId", "status");
CREATE INDEX "ShoppingRequest_userId_categoryId_idx" ON "ShoppingRequest"("userId", "categoryId");

ALTER TABLE "ShoppingRequest" ADD CONSTRAINT "ShoppingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShoppingRequest" ADD CONSTRAINT "ShoppingRequest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ShoppingRequest" ADD CONSTRAINT "ShoppingRequest_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;
