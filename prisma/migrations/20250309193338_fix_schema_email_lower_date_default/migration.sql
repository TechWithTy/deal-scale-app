/*
  Warnings:

  - You are about to drop the column `userProfileId` on the `AIKnowledgebase` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `BillingHistoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `companyCampaignsUserProfileId` on the `CallCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `CampaignAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `CompanyCampaignsUserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `companyCampaignsUserProfileId` on the `CompanyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `CompanyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `ConnectedAccounts` table. All the data in the column will be lost.
  - You are about to drop the column `companyCampaignsUserProfileId` on the `EmailCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `KanbanState` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `KanbanTask` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `LeadList` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `LeadPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `NotificationPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `OAuthData` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `PaymentDetails` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `SavedSearch` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `SecuritySettings` table. All the data in the column will be lost.
  - You are about to drop the column `companyCampaignsUserProfileId` on the `SocialMediaCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `companyCampaignsUserProfileId` on the `TextCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `TwoFactorAuth` table. All the data in the column will be lost.
  - You are about to drop the column `uniqueIdentifier` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `UserProfileSubscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `AIKnowledgebase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `CompanyInfo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `ConnectedAccounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Integration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `LeadPreferences` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `NotificationPreferences` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `PaymentDetails` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `SecuritySettings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `TwoFactorAuth` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `UserProfileSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `AIKnowledgebase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `BillingHistoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyCampaignsuser_id` to the `CallCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `CampaignAnalytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `CompanyCampaignsUserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyCampaignsuser_id` to the `CompanyInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `CompanyInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyCampaignsuser_id` to the `EmailCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `KanbanState` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `KanbanTask` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `priority` on the `KanbanTask` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `user_id` to the `LeadList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `LeadPreferences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `NotificationPreferences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `PaymentDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `SavedSearch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `SecuritySettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyCampaignsuser_id` to the `SocialMediaCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `TeamMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyCampaignsuser_id` to the `TextCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `TwoFactorAuth` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserProfileSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateEnum
CREATE TYPE "public"."LeadPriority" AS ENUM ('low', 'medium', 'high');

-- DropForeignKey
ALTER TABLE "public"."AIKnowledgebase" DROP CONSTRAINT "AIKnowledgebase_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ActivityLog" DROP CONSTRAINT "ActivityLog_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BillingHistoryItem" DROP CONSTRAINT "BillingHistoryItem_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CallCampaign" DROP CONSTRAINT "CallCampaign_companyCampaignsUserProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CampaignAnalytics" DROP CONSTRAINT "CampaignAnalytics_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CompanyCampaignsUserProfile" DROP CONSTRAINT "CompanyCampaignsUserProfile_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CompanyInfo" DROP CONSTRAINT "CompanyInfo_companyCampaignsUserProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CompanyInfo" DROP CONSTRAINT "CompanyInfo_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ConnectedAccounts" DROP CONSTRAINT "ConnectedAccounts_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EmailCampaign" DROP CONSTRAINT "EmailCampaign_companyCampaignsUserProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Integration" DROP CONSTRAINT "Integration_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."KanbanState" DROP CONSTRAINT "KanbanState_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."KanbanTask" DROP CONSTRAINT "KanbanTask_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LeadList" DROP CONSTRAINT "LeadList_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LeadPreferences" DROP CONSTRAINT "LeadPreferences_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NotificationPreferences" DROP CONSTRAINT "NotificationPreferences_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentDetails" DROP CONSTRAINT "PaymentDetails_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SavedSearch" DROP CONSTRAINT "SavedSearch_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SecuritySettings" DROP CONSTRAINT "SecuritySettings_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SocialMediaCampaign" DROP CONSTRAINT "SocialMediaCampaign_companyCampaignsUserProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamMember" DROP CONSTRAINT "TeamMember_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TextCampaign" DROP CONSTRAINT "TextCampaign_companyCampaignsUserProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TwoFactorAuth" DROP CONSTRAINT "TwoFactorAuth_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserProfileSubscription" DROP CONSTRAINT "FK_UserProfile_Subscription";

-- DropIndex
DROP INDEX "public"."AIKnowledgebase_userProfileId_key";

-- DropIndex
DROP INDEX "public"."idx_campaign_user";

-- DropIndex
DROP INDEX "public"."CompanyInfo_userProfileId_key";

-- DropIndex
DROP INDEX "public"."ConnectedAccounts_userProfileId_key";

-- DropIndex
DROP INDEX "public"."idx_connected_accounts_user";

-- DropIndex
DROP INDEX "public"."idx_leadlist_user";

-- DropIndex
DROP INDEX "public"."LeadPreferences_userProfileId_key";

-- DropIndex
DROP INDEX "public"."NotificationPreferences_userProfileId_key";

-- DropIndex
DROP INDEX "public"."idx_notifications_user";

-- DropIndex
DROP INDEX "public"."idx_oauth_provider_user";

-- DropIndex
DROP INDEX "public"."PaymentDetails_userProfileId_key";

-- DropIndex
DROP INDEX "public"."SecuritySettings_userProfileId_key";

-- DropIndex
DROP INDEX "public"."idx_security_user";

-- DropIndex
DROP INDEX "public"."TwoFactorAuth_userProfileId_key";

-- DropIndex
DROP INDEX "public"."UserProfile_uniqueIdentifier_key";

-- DropIndex
DROP INDEX "public"."idx_uniqueIdentifier";

-- DropIndex
DROP INDEX "public"."UserProfileSubscription_userProfileId_key";

-- DropIndex
DROP INDEX "public"."idx_userProfile_subscription";

-- AlterTable
ALTER TABLE "public"."AIKnowledgebase" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ActivityLog" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."BillingHistoryItem" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CallCampaign" DROP COLUMN "companyCampaignsUserProfileId",
ADD COLUMN     "companyCampaignsuser_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CampaignAnalytics" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CompanyCampaignsUserProfile" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CompanyInfo" DROP COLUMN "companyCampaignsUserProfileId",
DROP COLUMN "userProfileId",
ADD COLUMN     "companyCampaignsuser_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ConnectedAccounts" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "public"."EmailCampaign" DROP COLUMN "companyCampaignsUserProfileId",
ADD COLUMN     "companyCampaignsuser_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Integration" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."KanbanState" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."KanbanTask" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL,
DROP COLUMN "priority",
ADD COLUMN     "priority" "public"."LeadPriority" NOT NULL;

-- AlterTable
ALTER TABLE "public"."LeadList" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."LeadPreferences" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."NotificationPreferences" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."OAuthData" DROP COLUMN "id";

-- AlterTable
ALTER TABLE "public"."PaymentDetails" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SavedSearch" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SecuritySettings" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SocialMediaCampaign" DROP COLUMN "companyCampaignsUserProfileId",
ADD COLUMN     "companyCampaignsuser_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."TeamMember" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."TextCampaign" DROP COLUMN "companyCampaignsUserProfileId",
ADD COLUMN     "companyCampaignsuser_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."TwoFactorAuth" DROP COLUMN "userProfileId",
ADD COLUMN     "backupCodes" JSONB,
ADD COLUMN     "totpSecret" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserProfile" DROP COLUMN "uniqueIdentifier",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserProfileSubscription" DROP COLUMN "userProfileId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."Priority";

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIKnowledgebase_user_id_key" ON "public"."AIKnowledgebase"("user_id");

-- CreateIndex
CREATE INDEX "idx_activityLog" ON "public"."ActivityLog"("user_id");

-- CreateIndex
CREATE INDEX "idx_billing_user" ON "public"."BillingHistoryItem"("user_id");

-- CreateIndex
CREATE INDEX "idx_campaign_user" ON "public"."CampaignAnalytics"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyInfo_user_id_key" ON "public"."CompanyInfo"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedAccounts_user_id_key" ON "public"."ConnectedAccounts"("user_id");

-- CreateIndex
CREATE INDEX "idx_connected_accounts_user" ON "public"."ConnectedAccounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_user_id_key" ON "public"."Integration"("user_id");

-- CreateIndex
CREATE INDEX "idx_kanbantask_user" ON "public"."KanbanTask"("user_id");

-- CreateIndex
CREATE INDEX "idx_leadlist_user" ON "public"."LeadList"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "LeadPreferences_user_id_key" ON "public"."LeadPreferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreferences_user_id_key" ON "public"."NotificationPreferences"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "public"."NotificationPreferences"("user_id");

-- CreateIndex
CREATE INDEX "idx_oauth_provider_user" ON "public"."OAuthData"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentDetails_user_id_key" ON "public"."PaymentDetails"("user_id");

-- CreateIndex
CREATE INDEX "idx_savedsearch_user" ON "public"."SavedSearch"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "SecuritySettings_user_id_key" ON "public"."SecuritySettings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorAuth_user_id_key" ON "public"."TwoFactorAuth"("user_id");

-- CreateIndex
CREATE INDEX "idx_2fa_user" ON "public"."TwoFactorAuth"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_user_id_key" ON "public"."UserProfile"("user_id");

-- CreateIndex
CREATE INDEX "idx_uniqueIdentifier" ON "public"."UserProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfileSubscription_user_id_key" ON "public"."UserProfileSubscription"("user_id");

-- CreateIndex
CREATE INDEX "idx_userProfile_subscription" ON "public"."UserProfileSubscription"("user_id");

-- AddForeignKey
ALTER TABLE "public"."ConnectedAccounts" ADD CONSTRAINT "ConnectedAccounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProfileSubscription" ADD CONSTRAINT "FK_UserProfile_Subscription" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadPreferences" ADD CONSTRAINT "LeadPreferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SavedSearch" ADD CONSTRAINT "SavedSearch_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Integration" ADD CONSTRAINT "Integration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TwoFactorAuth" ADD CONSTRAINT "TwoFactorAuth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SecuritySettings" ADD CONSTRAINT "SecuritySettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompanyInfo" ADD CONSTRAINT "CompanyInfo_companyCampaignsuser_id_fkey" FOREIGN KEY ("companyCampaignsuser_id") REFERENCES "public"."CompanyCampaignsUserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompanyInfo" ADD CONSTRAINT "CompanyInfo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompanyCampaignsUserProfile" ADD CONSTRAINT "CompanyCampaignsUserProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignAnalytics" ADD CONSTRAINT "CampaignAnalytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeadList" ADD CONSTRAINT "LeadList_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KanbanState" ADD CONSTRAINT "KanbanState_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KanbanTask" ADD CONSTRAINT "KanbanTask_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TextCampaign" ADD CONSTRAINT "TextCampaign_companyCampaignsuser_id_fkey" FOREIGN KEY ("companyCampaignsuser_id") REFERENCES "public"."CompanyCampaignsUserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailCampaign" ADD CONSTRAINT "EmailCampaign_companyCampaignsuser_id_fkey" FOREIGN KEY ("companyCampaignsuser_id") REFERENCES "public"."CompanyCampaignsUserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CallCampaign" ADD CONSTRAINT "CallCampaign_companyCampaignsuser_id_fkey" FOREIGN KEY ("companyCampaignsuser_id") REFERENCES "public"."CompanyCampaignsUserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialMediaCampaign" ADD CONSTRAINT "SocialMediaCampaign_companyCampaignsuser_id_fkey" FOREIGN KEY ("companyCampaignsuser_id") REFERENCES "public"."CompanyCampaignsUserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIKnowledgebase" ADD CONSTRAINT "AIKnowledgebase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BillingHistoryItem" ADD CONSTRAINT "BillingHistoryItem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentDetails" ADD CONSTRAINT "PaymentDetails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."UserProfile"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
