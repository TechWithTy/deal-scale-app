import type { Icons } from "@/components/icons";

export interface NavItem {
	title: string;
	href?: string;
	disabled?: boolean;
	external?: boolean;
	icon?: keyof typeof Icons;
	label?: string;
	description?: string;
	featureKey?: string;
	variant?: "default" | "primary";
	onlyMobile?: boolean;
	hasSaleItems?: boolean;
	saleLink?: string;
}

export interface NavItemWithChildren extends NavItem {
	items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
	items?: NavItemWithChildren[];
}

export interface FooterItem {
	title: string;
	items: {
		title: string;
		href: string;
		external?: boolean;
	}[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

// Re-export all lead-related types from the centralized location
export type {
	LeadTypeGlobal,
	LeadStatus,
	SocialLinks,
	Address,
	ContactInfo,
	ContactField,
	ContactFieldType,
	LeadList,
	SocialsCount,
} from "./_dashboard/leads";
