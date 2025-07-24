/*
  Warnings:

  - You are about to drop the column `password` on the `SecuritySettings` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `SecuritySettings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ConnectedAccounts" DROP CONSTRAINT "ConnectedAccounts_userProfileId_fkey";

-- AlterTable
ALTER TABLE "ConnectedAccounts" ALTER COLUMN "userProfileId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SecuritySettings" DROP COLUMN "password",
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "idx_campaign_type" ON "CampaignAnalytics"("type");

-- CreateIndex
CREATE INDEX "idx_leadScore" ON "LeadTypeGlobal"("leadScore");

-- AddForeignKey
ALTER TABLE "ConnectedAccounts" ADD CONSTRAINT "ConnectedAccounts_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
