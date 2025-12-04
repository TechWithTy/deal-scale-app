/**
 * Deal Room Types for Real Estate Investment Deal Management
 * Comprehensive types for managing property deals from offer to closing
 */

// Deal Status Types
export type DealStatus =
	| "pre-offer"
	| "offer-submitted"
	| "under-contract"
	| "due-diligence"
	| "financing"
	| "closing"
	| "closed"
	| "cancelled";

// Deal Type Categories
export type DealType =
	| "single-family-rental"
	| "fix-and-flip"
	| "multi-family"
	| "commercial"
	| "wholesale"
	| "land";

// Document Categories
export type DocumentCategory =
	| "property-info"
	| "financials"
	| "due-diligence"
	| "legal"
	| "financing"
	| "closing"
	| "post-closing";

// Stakeholder Roles
export type StakeholderRole =
	| "buyer"
	| "seller"
	| "agent"
	| "lender"
	| "inspector"
	| "attorney"
	| "title-company"
	| "contractor"
	| "property-manager"
	| "partner";

// Permission Levels
export type PermissionLevel = "owner" | "editor" | "viewer";

// Source Lead Reference
export interface SourceLead {
	leadId: string;
	leadName: string;
	leadEmail?: string;
	leadPhone?: string;
}

// Source Campaign Reference
export interface SourceCampaign {
	campaignId: string;
	campaignName: string;
	campaignType: "call" | "text" | "email" | "social";
	convertedAt: string;
}

// Property Details
export interface PropertyDetails {
	bedrooms?: number;
	bathrooms?: number;
	squareFeet?: number;
	yearBuilt?: number;
	lotSize?: number;
	propertyType?: string;
}

// Core Deal Interface
export interface Deal {
	id: string;
	propertyAddress: string;
	propertyCity: string;
	propertyState: string;
	propertyZip: string;
	propertyPhoto?: string;
	dealType: DealType;
	status: DealStatus;
	purchasePrice: number;
	estimatedARV?: number; // After Repair Value
	projectedROI?: number;
	createdAt: string;
	updatedAt: string;
	closingDate?: string;
	daysUntilClosing?: number;
	completionPercentage: number;
	ownerId: string;
	ownerName: string;
	// Campaign/Lead Integration
	sourceLead?: SourceLead;
	sourceCampaign?: SourceCampaign;
	propertyDetails?: PropertyDetails;
}

// Deal Document Interface
export interface DealDocument {
	id: string;
	dealId: string;
	name: string;
	category: DocumentCategory;
	fileUrl: string;
	fileSize: number; // in bytes
	fileType: string; // e.g., "application/pdf"
	uploadedBy: string;
	uploadedAt: string;
	version: number;
	isWatermarked?: boolean;
	viewCount: number;
	downloadCount: number;
	lastViewedAt?: string;
	permissionLevel?: PermissionLevel;
}

// Deal Stakeholder Interface
export interface DealStakeholder {
	id: string;
	dealId: string;
	name: string;
	email: string;
	phone?: string;
	role: StakeholderRole;
	company?: string;
	permissionLevel: PermissionLevel;
	addedAt: string;
	lastActive?: string;
	avatar?: string;
}

// Checklist Task Interface
export interface DealChecklistTask {
	id: string;
	dealId: string;
	title: string;
	description?: string;
	category: DocumentCategory;
	isCompleted: boolean;
	completedAt?: string;
	completedBy?: string;
	dueDate?: string;
	assignedTo?: string;
	priority: "low" | "medium" | "high" | "critical";
	relatedDocumentId?: string;
	notes?: string;
}

// Deal Checklist (grouped tasks)
export interface DealChecklist {
	dealId: string;
	tasks: DealChecklistTask[];
	completionPercentage: number;
	totalTasks: number;
	completedTasks: number;
}

// Deal Milestone Interface
export interface DealMilestone {
	id: string;
	dealId: string;
	title: string;
	description: string;
	date: string;
	isCompleted: boolean;
	completedAt?: string;
	type:
		| "offer-accepted"
		| "inspection-due"
		| "financing-contingency"
		| "appraisal-due"
		| "closing-date"
		| "custom";
	isCriticalPath: boolean;
}

// Deal Comment/Note Interface
export interface DealComment {
	id: string;
	dealId: string;
	content: string;
	authorId: string;
	authorName: string;
	authorAvatar?: string;
	createdAt: string;
	updatedAt?: string;
	mentions?: string[]; // User IDs mentioned in comment
	attachments?: string[]; // Document IDs attached to comment
	parentCommentId?: string; // For threaded replies
}

// Deal Activity Log
export interface DealActivity {
	id: string;
	dealId: string;
	type:
		| "document-upload"
		| "document-view"
		| "document-download"
		| "status-change"
		| "stakeholder-added"
		| "checklist-update"
		| "milestone-complete"
		| "comment-added";
	description: string;
	performedBy: string;
	performedAt: string;
	metadata?: Record<string, any>;
}

// Deal Template Interface
export interface DealTemplate {
	id: string;
	name: string;
	description: string;
	dealType: DealType;
	icon: string;
	defaultFolders: DocumentCategory[];
	defaultChecklist: Omit<DealChecklistTask, "id" | "dealId" | "isCompleted">[];
	defaultMilestones: Omit<DealMilestone, "id" | "dealId" | "isCompleted">[];
	estimatedDaysToClose: number;
}

// Deal Analytics Interface
export interface DealAnalytics {
	dealId: string;
	totalDocuments: number;
	totalViews: number;
	totalDownloads: number;
	avgTimeToClose: number;
	mostViewedDocuments: Array<{ documentId: string; views: number }>;
	stakeholderEngagement: Array<{
		stakeholderId: string;
		activityCount: number;
	}>;
	checklistProgress: number;
	lastActivity: string;
}

// Deal Room Settings Interface
export interface DealRoomSettings {
	userId: string;
	defaultNotifications: {
		documentUploaded: boolean;
		statusChanged: boolean;
		commentAdded: boolean;
		milestoneComplete: boolean;
		checklistUpdate: boolean;
	};
	defaultPermissions: PermissionLevel;
	customCategories?: DocumentCategory[];
	branding?: {
		logo?: string;
		primaryColor?: string;
		secondaryColor?: string;
	};
	integrations: {
		crmEnabled: boolean;
		eSignatureEnabled: boolean;
		calendarSyncEnabled: boolean;
	};
}

// Deal Share Link Interface
export interface DealShareLink {
	id: string;
	dealId: string;
	link: string;
	permissionLevel: PermissionLevel;
	expiresAt?: string;
	createdBy: string;
	createdAt: string;
	accessCount: number;
}

// Combined Deal Room Data (full deal with all related data)
export interface DealRoomData {
	deal: Deal;
	documents: DealDocument[];
	stakeholders: DealStakeholder[];
	checklist: DealChecklist;
	milestones: DealMilestone[];
	comments: DealComment[];
	activities: DealActivity[];
	analytics: DealAnalytics;
}
