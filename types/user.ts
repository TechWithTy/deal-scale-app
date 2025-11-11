export type PermissionAction = "create" | "read" | "update" | "delete";

export type PermissionResource =
	| "users"
	| "leads"
	| "campaigns"
	| "reports"
	| "team"
	| "subscription"
	| "ai"
	| "tasks"
	| "companyProfile";

export type PermissionMatrix = {
	[resource in PermissionResource]?: PermissionAction[];
};

export interface UserQuotaBucket {
	allotted: number;
	used: number;
	resetInDays?: number;
}

export interface UserQuotas {
	ai: UserQuotaBucket;
	leads: UserQuotaBucket;
	skipTraces: UserQuotaBucket;
}

export type UserRole =
	| "admin"
	| "manager"
	| "member"
	| "support"
	| "platform_admin"
	| "platform_support";

export type UserTier = SubscriptionTier;

export type ClientType = "investor" | "wholesaler" | "agent" | "loan_officer";

/**
 * Demo configuration for realistic client simulations.
 * Allows customizing the user experience to match potential client branding.
 */
export type DemoCRMProvider =
	| "gohighlevel"
	| "salesforce"
	| "hubspot"
	| "close"
	| "zoho"
	| "other";

export interface DemoROIProfileConfig {
	dealsPerMonth?: number;
	avgDealValue?: number;
	months?: number;
	profitMarginPercent?: number;
	monthlyOverhead?: number;
	hoursPerDeal?: number;
}

export interface DemoConfig {
	/** Client company name for branding */
	companyName?: string;
	/** URL or path to company logo */
	companyLogo?: string;
	/** Company website URL */
	website?: string;
	/** Primary contact email */
	email?: string;
	/** Primary contact phone number */
	phoneNumber?: string;
	/** Company address line 1 */
	address?: string;
	/** City */
	city?: string;
	/** State/Province */
	state?: string;
	/** ZIP/Postal code */
	zipCode?: string;
	/** Industry/vertical (e.g., "Real Estate", "SaaS", "E-commerce") */
	industry?: string;
	/** Client type/role */
	clientType?: ClientType;
	/** Client's primary goal */
	goal?: string;
	/** Social media links */
	social?: {
		facebook?: string;
		instagram?: string;
		linkedin?: string;
		twitter?: string;
		youtube?: string;
		tiktok?: string;
	};
	/** Primary brand color (hex) */
	brandColor?: string;
	/** Secondary brand color (hex) */
	brandColorSecondary?: string;
	/** Accent brand color (hex) */
	brandColorAccent?: string;
	/** CRM provider used by the client */
	crmProvider?: DemoCRMProvider;
	/** ROI calculator overrides used to prefill quickstart ROI inputs */
	roiProfile?: DemoROIProfileConfig;
	/** Additional notes about the demo client */
	notes?: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	password?: string;
	role: UserRole;
	tier: UserTier;
	isBetaTester?: boolean;
	isPilotTester?: boolean;
	isFreeTier?: boolean;
	permissions: PermissionMatrix;
	permissionList: string[]; // Derived list (e.g., ["leads:read"]) for legacy checks
	quotas: UserQuotas;
	subscription: {
		name?: string;
		aiCredits: { allotted: number; used: number; resetInDays: number };
		leads: { allotted: number; used: number; resetInDays: number };
		skipTraces: { allotted: number; used: number; resetInDays: number };
	};
	/** Optional demo configuration for client simulations */
	demoConfig?: DemoConfig;
	/** QuickStart wizard preferences - automatically pre-selects persona/goal */
	quickStartDefaults?: {
		personaId?: "investor" | "wholesaler" | "loan_officer" | "agent";
		goalId?: string;
	};
}
import type { SubscriptionTier } from "@/constants/subscription/tiers";
