import type { NavItem } from "@/types";
import type {
	LeadTypeGlobal,
	LeadStatus,
	LeadSource,
	CommunicationPreference,
} from "@/types/_dashboard/leads";
import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
export const APP_TESTING_MODE = true;

// Function to generate mock leads
// Function to generate mock leads

export const navItems: NavItem[] = [
	{
		title: "Property Search",
		href: "/dashboard",
		icon: "search",
		label: "searchProperties",
	},
	{
		title: "Campaign Manager",
		href: "/dashboard/campaigns",
		icon: "campaigns",
		label: "campaigns",
	},
	{
		title: "Leads",
		href: "/dashboard/lead",
		icon: "user",
		label: "leads",
	},
	{
		title: "Lead Lists",
		href: "/dashboard/leadList",
		icon: "scribe",
		label: "lead-lists",
	},
	{
		title: "Kanban",
		href: "/dashboard/kanban",
		icon: "kanban",
		label: "kanban",
	},

	{
		title: "Employee",
		href: "/dashboard/employee",
		icon: "employee",
		label: "employee",
	},
	{
		title: "Logout",
		href: "/",
		icon: "logout",
		label: "logout",
	},
];
