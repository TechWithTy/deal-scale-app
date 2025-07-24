import type { EnrichmentOption } from "@/types/skip-trace/enrichment";

export const enrichmentOptions: EnrichmentOption[] = [
	// ! Phone Hunter: Requires a phone number to find owner details.
	// * Example: Input a phone number, get back the owner's name and line type.
	{
		id: "phone_hunter",
		title: "Phone Number Hunter",
		description:
			"Instantly enrich any phone number with critical data. Before you even dial, uncover the owner's name, line type, location, and spam score.",
		features: [
			"Owner Name Lookup",
			"Line Type (Mobile/VoIP/Landline)",
			"Carrier and Location Data",
			"Spam & Reputation Score",
		],
		cost: 0,
		isFree: true,
		badge: {
			text: "Pilot Tester Perk",
			bgColor: "bg-green-100",
			textColor: "text-green-800",
		},
		requiredFields: ["phone"],
		optionalFields: [],
	},
	{
		id: "email_intelligence",
		title: "Email Intelligence",
		description:
			"Go beyond the inbox. Instantly find associated social profiles and generate likely email combinations to turn any contact into a warm lead.",
		features: [
			"Social Media Account Discovery",
			"Likely Email Address Generation",
			"Digital Footprint Verification",
		],
		cost: 0,
		isFree: true,
		badge: {
			text: "Pilot Tester Perk",
			bgColor: "bg-green-100",
			textColor: "text-green-800",
		},
		requiredFields: ["email"],
		optionalFields: [],
	},
	{
		id: "domain_recon",
		title: "Domain Recon",
		description:
			"Go beyond the homepage. Enter any domain to uncover associated emails, subdomains, employee names, and the technologies a company uses.",
		features: [
			"Email and Name Discovery",
			"Subdomain & IP Enumeration",
			"Technology Stack Identification",
			"Free Public Search Tier",
		],
		isFree: false,
		cost: 1,
		badge: {
			text: "Premium",
			bgColor: "bg-blue-100",
			textColor: "text-blue-800",
		},
		requiredFields: ["domain"],
		optionalFields: ["email"],
	},
	{
		id: "social_profile_hunter",
		title: "Social Profile Hunter",
		description:
			"Discover your lead's complete digital footprint. Use a username or email to find all associated accounts across 600+ social media and online platforms.",
		features: [
			"Username & Email Search",
			"Scans 600+ Online Platforms",
			"AI-Powered Metadata Extraction",
			"PDF & CSV Reporting",
		],
		isFree: true,
		badge: {
			text: "Pilot Tester Perk",
			bgColor: "bg-green-100",
			textColor: "text-green-800",
		},
		cost: 0,
		requiredFields: ["email", "socialTag"],
		optionalFields: ["firstName", "lastName"],
	},
	// ! Lead Dossier Generator: Requires a social media handle (username) to start a deep recursive search.
	// * Example: Input a username, uncover a whole network of related accounts and information.
	{
		id: "lead_dossier_generator",
		title: "Lead Dossier Generator",
		description:
			"The ultimate OSINT tool. Start with a single username to discover a web of associated accounts across 3000+ sites.",
		features: [
			"Recursive Search (Finds New Usernames)",
			"Comprehensive Search Across 3000+ Sites",
			"Profile Page Content Parsing",
			"Visual Relationship Map & Reports",
		],
		isFree: true,
		badge: {
			text: "Pilot Tester Perk",
			bgColor: "bg-green-100",
			textColor: "text-green-800",
		},
		cost: 1,
		requiredFields: ["socialTag"],
		optionalFields: ["email", "phone", "firstName", "lastName"],
	},
	// ! Data Enrichment Suite: A versatile suite that can use a name, address, or phone number.
	// * Example: Input a name and city to find an address, or reverse-lookup a phone number.
	{
		id: "data_enrichment_suite",
		title: "Data Enrichment Suite",
		description:
			"A suite of premium, credit-based tools to verify, clean, and enrich your lead data. Turn any single piece of information into a complete, actionable lead profile.",
		features: [
			"Reverse Phone & Address Lookup",
			"Bulk Phone Number Validation",
			"Find Person by Name & Location",
			"Real-Time Caller Identification",
		],
		isFree: false,
		cost: 1,
		badge: {
			text: "Premium Data Tools",
			bgColor: "bg-blue-100",
			textColor: "text-blue-800",
		},
		requiredFields: ["address"],
		optionalFields: ["phone", "firstName", "lastName"],
	},
];
