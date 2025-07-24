-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('email', 'text', 'call', 'social');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('New_Lead', 'Contacted', 'Closed', 'Lost');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('delivered', 'delivering', 'failed', 'pending', 'completed', 'missed', 'queued', 'read', 'unread');

-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('inboundPhoneCall', 'outboundPhoneCall', 'webCall');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TYPE_SMS', 'TYPE_EMAIL');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('monthly', 'yearly');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('Paid', 'Unpaid');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('connected', 'disconnected');

-- CreateEnum
CREATE TYPE "TeamMemberRole" AS ENUM ('admin', 'member');

-- CreateEnum
CREATE TYPE "TwoFactorMethods" AS ENUM ('sms', 'email', 'authenticatorApp');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "uniqueIdentifier" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "personalNum" TEXT NOT NULL,
    "userProfileSubscriptionId" TEXT,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectedAccounts" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "ConnectedAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthData" (
    "id" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "pageId" TEXT,
    "companyId" TEXT,
    "handle" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresIn" INTEGER NOT NULL,
    "tokenType" TEXT NOT NULL,
    "scope" TEXT,
    "lastRefreshedAt" TIMESTAMP(3),
    "connectedAccountId" TEXT NOT NULL,

    CONSTRAINT "OAuthData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfileSubscription" (
    "id" TEXT NOT NULL,
    "stripeSubscriptionID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SubscriptionType" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "price" TEXT NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "planDetails" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "UserProfileSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadPreferences" (
    "id" TEXT NOT NULL,
    "preferredLocation" JSONB NOT NULL,
    "industry" TEXT NOT NULL,
    "minLeadQuality" INTEGER NOT NULL,
    "maxBudget" DOUBLE PRECISION NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "LeadPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "searchCriteria" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwoFactorAuth" (
    "id" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL,
    "methods" "TwoFactorMethods" NOT NULL,
    "lastEnabledAt" TIMESTAMP(3),
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "TwoFactorAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermissions" (
    "id" TEXT NOT NULL,
    "canGenerateLeads" BOOLEAN NOT NULL,
    "canStartCampaigns" BOOLEAN NOT NULL,
    "canViewReports" BOOLEAN NOT NULL,
    "canManageTeam" BOOLEAN NOT NULL,
    "canManageSubscription" BOOLEAN NOT NULL,
    "canAccessAI" BOOLEAN NOT NULL,
    "canMoveCompanyTasks" BOOLEAN NOT NULL,
    "canEditCompanyProfile" BOOLEAN NOT NULL,
    "teamMemberId" TEXT NOT NULL,

    CONSTRAINT "UserPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreferences" (
    "id" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL,
    "smsNotifications" BOOLEAN NOT NULL,
    "notifyForNewLeads" BOOLEAN NOT NULL,
    "notifyForCampaignUpdates" BOOLEAN NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "NotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "TeamMemberRole" NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "notificationPreferencesId" TEXT,
    "twoFactorAuthId" TEXT,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "performedBy" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "teamMemberId" TEXT,
    "taskTrackingId" TEXT NOT NULL,
    "userAgent" TEXT,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTracking" (
    "id" TEXT NOT NULL,
    "totalTasks" INTEGER NOT NULL,
    "tasksAssigned" INTEGER NOT NULL,
    "tasksCompleted" INTEGER NOT NULL,
    "tasksInProgress" INTEGER NOT NULL,
    "assignedTasks" JSONB NOT NULL,

    CONSTRAINT "TaskTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskActivity" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "performedBy" TEXT NOT NULL,
    "taskTrackingId" TEXT NOT NULL,

    CONSTRAINT "TaskActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecuritySettings" (
    "id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "lastLoginTime" TIMESTAMP(3),
    "passwordUpdatedAt" TIMESTAMP(3),
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "SecuritySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyInfo" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "assets" JSONB NOT NULL,
    "webhook" TEXT,
    "socialMediaTags" JSONB NOT NULL,
    "companyLogo" TEXT NOT NULL,
    "GHLID" TEXT NOT NULL,
    "forwardingNumber" TEXT NOT NULL,
    "outreachEmail" TEXT NOT NULL,
    "explainerVideo" TEXT,
    "userProfileId" TEXT NOT NULL,
    "companyCampaignsUserProfileId" TEXT NOT NULL,
    "kanbanStateId" TEXT NOT NULL,

    CONSTRAINT "CompanyInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCampaignsUserProfile" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "CompanyCampaignsUserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignAnalytics" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "deliveredCount" INTEGER NOT NULL,
    "openedCount" INTEGER NOT NULL,
    "bouncedCount" INTEGER NOT NULL,
    "failedCount" INTEGER NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "companyInfoId" TEXT,

    CONSTRAINT "CampaignAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadTypeGlobal" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "bed" INTEGER NOT NULL,
    "bath" INTEGER NOT NULL,
    "sqft" INTEGER NOT NULL,
    "status" "LeadStatus" NOT NULL,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "followUp" TIMESTAMP(3),
    "lastUpdate" TIMESTAMP(3) NOT NULL,
    "address1" TEXT NOT NULL,
    "campaignID" TEXT,
    "companyInfoId" TEXT NOT NULL,
    "leadListId" TEXT,

    CONSTRAINT "LeadTypeGlobal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLinks" (
    "id" TEXT NOT NULL,
    "facebook" TEXT,
    "linkedin" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "leadId" TEXT NOT NULL,

    CONSTRAINT "SocialLinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadList" (
    "id" TEXT NOT NULL,
    "listName" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL,
    "records" INTEGER NOT NULL,
    "phone" INTEGER NOT NULL,
    "dataLink" TEXT NOT NULL,
    "emails" INTEGER NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "companyInfoId" TEXT,
    "socialsCountId" TEXT NOT NULL,

    CONSTRAINT "LeadList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialsCount" (
    "id" TEXT NOT NULL,
    "facebook" INTEGER,
    "linkedin" INTEGER,
    "instagram" INTEGER,
    "twitter" INTEGER,

    CONSTRAINT "SocialsCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanbanState" (
    "id" TEXT NOT NULL,
    "draggedTask" TEXT,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "KanbanState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanbanTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "assignedTo" TEXT,
    "kanbanStateId" TEXT NOT NULL,
    "userProfileId" TEXT,

    CONSTRAINT "KanbanTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanbanColumn" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kanbanStateId" TEXT NOT NULL,

    CONSTRAINT "KanbanColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextMessage" (
    "id" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "messageType" "MessageType" NOT NULL,
    "locationId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "dateAdded" TIMESTAMP(3) NOT NULL,
    "body" TEXT,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "meta" JSONB,
    "source" TEXT,
    "userId" TEXT,
    "textCampaignId" TEXT NOT NULL,

    CONSTRAINT "TextMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextMessageAttachment" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "textMessageId" TEXT NOT NULL,

    CONSTRAINT "TextMessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL,
    "altId" TEXT,
    "threadId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "dateAdded" TIMESTAMP(3) NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "replyToMessageId" TEXT,
    "source" TEXT,
    "emailCampaignId" TEXT NOT NULL,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailAttachment" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "emailMessageId" TEXT NOT NULL,

    CONSTRAINT "EmailAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailRecipient" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "emailMessageId" TEXT NOT NULL,

    CONSTRAINT "EmailRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallDetail" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "type" "CallType" NOT NULL,
    "phoneCallProvider" TEXT NOT NULL,
    "phoneCallTransport" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "endedReason" TEXT,
    "messages" JSONB NOT NULL,
    "destination" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "cost" DOUBLE PRECISION NOT NULL,
    "costBreakdown" JSONB NOT NULL,
    "transcript" TEXT NOT NULL,
    "recordingUrl" TEXT,
    "stereoRecordingUrl" TEXT,
    "artifact" JSONB,
    "analysis" JSONB,
    "assistantId" TEXT,
    "callCampaignId" TEXT NOT NULL,

    CONSTRAINT "CallDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAction" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "successful" INTEGER NOT NULL,
    "failed" INTEGER NOT NULL,
    "viewLink" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "replyMessage" TEXT,
    "socialMediaCampaignId" TEXT NOT NULL,

    CONSTRAINT "SocialAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextCampaign" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "status" "CampaignStatus" NOT NULL,
    "companyCampaignsUserProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "aiVoice" TEXT,
    "aiScript" TEXT,
    "updatedAt" TIMESTAMP(3),
    "aiAvatarAgent" TEXT,

    CONSTRAINT "TextCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailCampaign" (
    "id" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL,
    "sentCount" INTEGER NOT NULL,
    "deliveredCount" INTEGER NOT NULL,
    "status" "CampaignStatus" NOT NULL,
    "companyCampaignsUserProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "aiVoice" TEXT,
    "aiScript" TEXT,
    "updatedAt" TIMESTAMP(3),
    "aiAvatarAgent" TEXT,

    CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallCampaign" (
    "id" TEXT NOT NULL,
    "callerNumber" TEXT NOT NULL,
    "receiverNumber" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "callType" "CallType" NOT NULL,
    "status" "CampaignStatus" NOT NULL,
    "companyCampaignsUserProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "aiVoice" TEXT,
    "aiScript" TEXT,
    "updatedAt" TIMESTAMP(3),
    "aiAvatarAgent" TEXT,

    CONSTRAINT "CallCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMediaCampaign" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "senderHandle" TEXT NOT NULL,
    "receiverHandle" TEXT NOT NULL,
    "hashtags" JSONB NOT NULL,
    "status" "CampaignStatus" NOT NULL,
    "companyCampaignsUserProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "aiVoice" TEXT,
    "aiScript" TEXT,
    "updatedAt" TIMESTAMP(3),
    "aiAvatarAgent" TEXT,

    CONSTRAINT "SocialMediaCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIKnowledgebase" (
    "id" TEXT NOT NULL,
    "emailTemplate" TEXT,
    "salesScript" TEXT,
    "assignedAssistantID" TEXT NOT NULL,
    "assignedSquadID" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "recordingId" TEXT NOT NULL,
    "aIAvatarId" TEXT,
    "backgroundId" TEXT,

    CONSTRAINT "AIKnowledgebase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingHistoryItem" (
    "id" TEXT NOT NULL,
    "invoice" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "BillingStatus" NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "BillingHistoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentDetails" (
    "id" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "cardLastFour" TEXT NOT NULL,
    "expiry" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "PaymentDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AICredits" (
    "id" TEXT NOT NULL,
    "allotted" INTEGER NOT NULL,
    "used" INTEGER NOT NULL,
    "resetInDays" INTEGER NOT NULL,
    "subscriptionId" TEXT NOT NULL,

    CONSTRAINT "AICredits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadCredits" (
    "id" TEXT NOT NULL,
    "allotted" INTEGER NOT NULL,
    "used" INTEGER NOT NULL,
    "resetInDays" INTEGER NOT NULL,
    "subscriptionId" TEXT NOT NULL,

    CONSTRAINT "LeadCredits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkipTraceCredits" (
    "id" TEXT NOT NULL,
    "allotted" INTEGER NOT NULL,
    "used" INTEGER NOT NULL,
    "resetInDays" INTEGER NOT NULL,
    "subscriptionId" TEXT NOT NULL,

    CONSTRAINT "SkipTraceCredits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL,
    "customVoiceID" TEXT NOT NULL,
    "voicemailFile" TEXT NOT NULL,
    "voiceCloneId" TEXT,

    CONSTRAINT "Recording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceClone" (
    "id" TEXT NOT NULL,
    "audioFile" TEXT NOT NULL,
    "clonedVoiceID" TEXT NOT NULL,

    CONSTRAINT "VoiceClone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAvatar" (
    "id" TEXT NOT NULL,
    "avatarKandidFile" TEXT NOT NULL,
    "avatarMotionFile" TEXT NOT NULL,
    "videoDetailsId" TEXT NOT NULL,

    CONSTRAINT "AIAvatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoDetails" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "ctaLink" TEXT NOT NULL,

    CONSTRAINT "VideoDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Background" (
    "id" TEXT NOT NULL,
    "backgroundVideoFile" TEXT NOT NULL,
    "backgroundMusic" TEXT NOT NULL,
    "colorSchemeId" TEXT NOT NULL,

    CONSTRAINT "Background_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColorScheme" (
    "id" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "accentColor" TEXT,

    CONSTRAINT "ColorScheme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_uniqueIdentifier_key" ON "UserProfile"("uniqueIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE INDEX "idx_email" ON "UserProfile"("email");

-- CreateIndex
CREATE INDEX "idx_uniqueIdentifier" ON "UserProfile"("uniqueIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedAccounts_userProfileId_key" ON "ConnectedAccounts"("userProfileId");

-- CreateIndex
CREATE INDEX "idx_connected_accounts_user" ON "ConnectedAccounts"("userProfileId");

-- CreateIndex
CREATE INDEX "idx_oauth_provider_user" ON "OAuthData"("provider", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfileSubscription_userProfileId_key" ON "UserProfileSubscription"("userProfileId");

-- CreateIndex
CREATE INDEX "idx_userProfile_subscription" ON "UserProfileSubscription"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadPreferences_userProfileId_key" ON "LeadPreferences"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorAuth_userProfileId_key" ON "TwoFactorAuth"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermissions_teamMemberId_key" ON "UserPermissions"("teamMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreferences_userProfileId_key" ON "NotificationPreferences"("userProfileId");

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "NotificationPreferences"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_email_key" ON "TeamMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SecuritySettings_userProfileId_key" ON "SecuritySettings"("userProfileId");

-- CreateIndex
CREATE INDEX "idx_security_user" ON "SecuritySettings"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyInfo_userProfileId_key" ON "CompanyInfo"("userProfileId");

-- CreateIndex
CREATE INDEX "idx_campaignId" ON "CampaignAnalytics"("campaignId");

-- CreateIndex
CREATE INDEX "idx_campaign_user" ON "CampaignAnalytics"("userProfileId");

-- CreateIndex
CREATE INDEX "idx_companyInfoId" ON "LeadTypeGlobal"("companyInfoId");

-- CreateIndex
CREATE INDEX "idx_leadEmail" ON "LeadTypeGlobal"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLinks_leadId_key" ON "SocialLinks"("leadId");

-- CreateIndex
CREATE INDEX "idx_social_leadId" ON "SocialLinks"("leadId");

-- CreateIndex
CREATE INDEX "idx_leadlist_user" ON "LeadList"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AIKnowledgebase_userProfileId_key" ON "AIKnowledgebase"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentDetails_userProfileId_key" ON "PaymentDetails"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AICredits_subscriptionId_key" ON "AICredits"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadCredits_subscriptionId_key" ON "LeadCredits"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "SkipTraceCredits_subscriptionId_key" ON "SkipTraceCredits"("subscriptionId");

-- AddForeignKey
ALTER TABLE "ConnectedAccounts" ADD CONSTRAINT "ConnectedAccounts_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthData" ADD CONSTRAINT "OAuthData_connectedAccountId_fkey" FOREIGN KEY ("connectedAccountId") REFERENCES "ConnectedAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfileSubscription" ADD CONSTRAINT "FK_UserProfile_Subscription" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadPreferences" ADD CONSTRAINT "LeadPreferences_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFactorAuth" ADD CONSTRAINT "TwoFactorAuth_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermissions" ADD CONSTRAINT "UserPermissions_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_notificationPreferencesId_fkey" FOREIGN KEY ("notificationPreferencesId") REFERENCES "NotificationPreferences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_twoFactorAuthId_fkey" FOREIGN KEY ("twoFactorAuthId") REFERENCES "TwoFactorAuth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_taskTrackingId_fkey" FOREIGN KEY ("taskTrackingId") REFERENCES "TaskTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskActivity" ADD CONSTRAINT "TaskActivity_taskTrackingId_fkey" FOREIGN KEY ("taskTrackingId") REFERENCES "TaskTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecuritySettings" ADD CONSTRAINT "SecuritySettings_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInfo" ADD CONSTRAINT "CompanyInfo_companyCampaignsUserProfileId_fkey" FOREIGN KEY ("companyCampaignsUserProfileId") REFERENCES "CompanyCampaignsUserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInfo" ADD CONSTRAINT "CompanyInfo_kanbanStateId_fkey" FOREIGN KEY ("kanbanStateId") REFERENCES "KanbanState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInfo" ADD CONSTRAINT "CompanyInfo_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCampaignsUserProfile" ADD CONSTRAINT "CompanyCampaignsUserProfile_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAnalytics" ADD CONSTRAINT "CampaignAnalytics_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAnalytics" ADD CONSTRAINT "CampaignAnalytics_companyInfoId_fkey" FOREIGN KEY ("companyInfoId") REFERENCES "CompanyInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTypeGlobal" ADD CONSTRAINT "LeadTypeGlobal_companyInfoId_fkey" FOREIGN KEY ("companyInfoId") REFERENCES "CompanyInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTypeGlobal" ADD CONSTRAINT "LeadTypeGlobal_leadListId_fkey" FOREIGN KEY ("leadListId") REFERENCES "LeadList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLinks" ADD CONSTRAINT "SocialLinks_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "LeadTypeGlobal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadList" ADD CONSTRAINT "LeadList_socialsCountId_fkey" FOREIGN KEY ("socialsCountId") REFERENCES "SocialsCount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadList" ADD CONSTRAINT "LeadList_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadList" ADD CONSTRAINT "LeadList_companyInfoId_fkey" FOREIGN KEY ("companyInfoId") REFERENCES "CompanyInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanState" ADD CONSTRAINT "KanbanState_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanTask" ADD CONSTRAINT "KanbanTask_kanbanStateId_fkey" FOREIGN KEY ("kanbanStateId") REFERENCES "KanbanState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanTask" ADD CONSTRAINT "KanbanTask_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanColumn" ADD CONSTRAINT "KanbanColumn_kanbanStateId_fkey" FOREIGN KEY ("kanbanStateId") REFERENCES "KanbanState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextMessage" ADD CONSTRAINT "TextMessage_textCampaignId_fkey" FOREIGN KEY ("textCampaignId") REFERENCES "TextCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextMessageAttachment" ADD CONSTRAINT "TextMessageAttachment_textMessageId_fkey" FOREIGN KEY ("textMessageId") REFERENCES "TextMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_emailCampaignId_fkey" FOREIGN KEY ("emailCampaignId") REFERENCES "EmailCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAttachment" ADD CONSTRAINT "EmailAttachment_emailMessageId_fkey" FOREIGN KEY ("emailMessageId") REFERENCES "EmailMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailRecipient" ADD CONSTRAINT "EmailRecipient_emailMessageId_fkey" FOREIGN KEY ("emailMessageId") REFERENCES "EmailMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallDetail" ADD CONSTRAINT "CallDetail_callCampaignId_fkey" FOREIGN KEY ("callCampaignId") REFERENCES "CallCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAction" ADD CONSTRAINT "SocialAction_socialMediaCampaignId_fkey" FOREIGN KEY ("socialMediaCampaignId") REFERENCES "SocialMediaCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextCampaign" ADD CONSTRAINT "TextCampaign_companyCampaignsUserProfileId_fkey" FOREIGN KEY ("companyCampaignsUserProfileId") REFERENCES "CompanyCampaignsUserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailCampaign" ADD CONSTRAINT "EmailCampaign_companyCampaignsUserProfileId_fkey" FOREIGN KEY ("companyCampaignsUserProfileId") REFERENCES "CompanyCampaignsUserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallCampaign" ADD CONSTRAINT "CallCampaign_companyCampaignsUserProfileId_fkey" FOREIGN KEY ("companyCampaignsUserProfileId") REFERENCES "CompanyCampaignsUserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaCampaign" ADD CONSTRAINT "SocialMediaCampaign_companyCampaignsUserProfileId_fkey" FOREIGN KEY ("companyCampaignsUserProfileId") REFERENCES "CompanyCampaignsUserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIKnowledgebase" ADD CONSTRAINT "AIKnowledgebase_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "Recording"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIKnowledgebase" ADD CONSTRAINT "AIKnowledgebase_aIAvatarId_fkey" FOREIGN KEY ("aIAvatarId") REFERENCES "AIAvatar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIKnowledgebase" ADD CONSTRAINT "AIKnowledgebase_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "Background"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIKnowledgebase" ADD CONSTRAINT "AIKnowledgebase_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingHistoryItem" ADD CONSTRAINT "BillingHistoryItem_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentDetails" ADD CONSTRAINT "PaymentDetails_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AICredits" ADD CONSTRAINT "AICredits_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "UserProfileSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadCredits" ADD CONSTRAINT "LeadCredits_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "UserProfileSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkipTraceCredits" ADD CONSTRAINT "SkipTraceCredits_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "UserProfileSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_voiceCloneId_fkey" FOREIGN KEY ("voiceCloneId") REFERENCES "VoiceClone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAvatar" ADD CONSTRAINT "AIAvatar_videoDetailsId_fkey" FOREIGN KEY ("videoDetailsId") REFERENCES "VideoDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Background" ADD CONSTRAINT "Background_colorSchemeId_fkey" FOREIGN KEY ("colorSchemeId") REFERENCES "ColorScheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
