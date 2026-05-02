-- Wipe existing voters; their votes cascade.
DELETE FROM "Voter";

-- AlterTable
ALTER TABLE "Voter" ADD COLUMN "googleSub" TEXT NOT NULL;
ALTER TABLE "Voter" ADD COLUMN "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Voter_googleSub_key" ON "Voter"("googleSub");
CREATE UNIQUE INDEX "Voter_email_key" ON "Voter"("email");
