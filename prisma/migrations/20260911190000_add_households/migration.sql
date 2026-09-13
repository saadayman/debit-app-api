CREATE TYPE "HouseholdRole" AS ENUM ('OWNER', 'REQUESTER');

CREATE TABLE "Household" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HouseholdMember" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "HouseholdRole" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HouseholdInvitation" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "HouseholdRole" NOT NULL DEFAULT 'REQUESTER',
  "token" TEXT NOT NULL,
  "invitedById" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HouseholdInvitation_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ShoppingRequest" ADD COLUMN "householdId" TEXT;

-- Every existing account starts as the owner of its own household.
INSERT INTO "Household" ("id", "name", "updatedAt")
SELECT 'household_' || "id", "name" || '''s household', CURRENT_TIMESTAMP FROM "User";
INSERT INTO "HouseholdMember" ("id", "householdId", "userId", "role")
SELECT 'member_' || "id", 'household_' || "id", "id", 'OWNER'::"HouseholdRole" FROM "User";
UPDATE "ShoppingRequest" SET "householdId" = 'household_' || "userId";
ALTER TABLE "ShoppingRequest" ALTER COLUMN "householdId" SET NOT NULL;

CREATE UNIQUE INDEX "HouseholdMember_userId_key" ON "HouseholdMember"("userId");
CREATE INDEX "HouseholdMember_householdId_role_idx" ON "HouseholdMember"("householdId", "role");
CREATE UNIQUE INDEX "HouseholdInvitation_token_key" ON "HouseholdInvitation"("token");
CREATE INDEX "HouseholdInvitation_householdId_idx" ON "HouseholdInvitation"("householdId");
CREATE INDEX "HouseholdInvitation_email_idx" ON "HouseholdInvitation"("email");
CREATE INDEX "ShoppingRequest_householdId_status_idx" ON "ShoppingRequest"("householdId", "status");

ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HouseholdInvitation" ADD CONSTRAINT "HouseholdInvitation_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HouseholdInvitation" ADD CONSTRAINT "HouseholdInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShoppingRequest" ADD CONSTRAINT "ShoppingRequest_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
