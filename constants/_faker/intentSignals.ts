/**
 * Mock Intent Signal Data Generator
 * 
 * Generates realistic intent signal data for testing and development.
 */

import type {
	IntentSignal,
	IntentSignalType,
	IntentSignalCategory,
} from "@/types/_dashboard/intentSignals";

/** Generate a random date within the last N days */
function randomDateWithinDays(days: number): string {
	const now = new Date();
	const randomMs = Math.random() * days * 24 * 60 * 60 * 1000;
	const date = new Date(now.getTime() - randomMs);
	return date.toISOString();
}

/** Generate a unique ID for a signal */
function generateSignalId(): string {
	return `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/** Email subjects for mock email signals */
const emailSubjects = [
	"RE: Property Investment Opportunity",
	"Quick Question About Pricing",
	"Following Up on Our Conversation",
	"Interested in Scheduling a Call",
	"Property Details Request",
	"Market Analysis Report",
	"Investment Portfolio Review",
	"Property Showing Confirmation",
	"Contract Terms Discussion",
	"Financing Options Available",
];

/** Page titles for website visits */
const pageTitles = [
	"Pricing & Plans - DealScale",
	"Property Investment Calculator",
	"Market Analysis Dashboard",
	"ROI Calculator",
	"Success Stories",
	"Property Search Results",
	"Contact Us",
	"About Our Services",
	"Investment Guide",
	"Demo Request",
];

/** Document names for downloads */
const documentNames = [
	"Investment_Guide_2024.pdf",
	"Market_Analysis_Report.pdf",
	"Property_Valuation_Template.xlsx",
	"Contract_Template.docx",
	"ROI_Calculator.xlsx",
	"Case_Study_Wholesaling.pdf",
	"Pricing_Sheet.pdf",
	"Service_Agreement.pdf",
	"Property_Checklist.pdf",
	"Financing_Options.pdf",
];

/**
 * Generate a single random intent signal
 * @param maxAgeInDays - Maximum age of the signal in days (default: 30)
 * @returns A random intent signal
 */
export function generateMockIntentSignal(maxAgeInDays = 30): IntentSignal {
	// Define signal configurations with type, category, and metadata generators
	const signalConfigs: Array<{
		type: IntentSignalType;
		category: IntentSignalCategory;
		metadataGen: () => Record<string, unknown>;
	}> = [
		// Engagement signals
		{
			type: "engagement",
			category: "email_open",
			metadataGen: () => ({
				emailSubject: emailSubjects[Math.floor(Math.random() * emailSubjects.length)],
			}),
		},
		{
			type: "engagement",
			category: "email_click",
			metadataGen: () => ({
				emailSubject: emailSubjects[Math.floor(Math.random() * emailSubjects.length)],
				linkUrl: "https://dealscale.app/properties/123",
			}),
		},
		{
			type: "engagement",
			category: "email_reply",
			metadataGen: () => ({
				emailSubject: `RE: ${emailSubjects[Math.floor(Math.random() * emailSubjects.length)]}`,
			}),
		},
		{
			type: "engagement",
			category: "sms_reply",
			metadataGen: () => ({
				messagePreview: "Yes, I'm interested in learning more",
			}),
		},
		{
			type: "engagement",
			category: "call_answered",
			metadataGen: () => ({
				callDuration: Math.floor(Math.random() * 600) + 60, // 1-10 minutes
			}),
		},
		{
			type: "engagement",
			category: "call_connected",
			metadataGen: () => ({
				callDuration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
			}),
		},
		{
			type: "engagement",
			category: "voicemail_listened",
			metadataGen: () => ({
				voicemailDuration: Math.floor(Math.random() * 60) + 15,
			}),
		},
		// Behavioral signals
		{
			type: "behavioral",
			category: "website_visit",
			metadataGen: () => ({
				pageUrl: "https://dealscale.app/",
				pageTitle: "DealScale - Real Estate Investment Platform",
			}),
		},
		{
			type: "behavioral",
			category: "pricing_viewed",
			metadataGen: () => ({
				pageUrl: "https://dealscale.app/pricing",
				pageTitle: "Pricing & Plans - DealScale",
				timeOnPage: Math.floor(Math.random() * 300) + 30,
			}),
		},
		{
			type: "behavioral",
			category: "demo_request",
			metadataGen: () => ({
				formUrl: "https://dealscale.app/demo",
				requestedDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
			}),
		},
		{
			type: "behavioral",
			category: "property_viewed",
			metadataGen: () => ({
				propertyId: `prop_${Math.floor(Math.random() * 1000)}`,
				propertyAddress: "123 Main St, Austin, TX",
			}),
		},
		{
			type: "behavioral",
			category: "property_search",
			metadataGen: () => ({
				searchQuery: "investment properties Austin TX",
				resultsCount: Math.floor(Math.random() * 100) + 10,
			}),
		},
		{
			type: "behavioral",
			category: "document_downloaded",
			metadataGen: () => ({
				documentName: documentNames[Math.floor(Math.random() * documentNames.length)],
				fileSize: `${Math.floor(Math.random() * 5000) + 500}KB`,
			}),
		},
		{
			type: "behavioral",
			category: "form_submitted",
			metadataGen: () => ({
				formType: "Contact Form",
				formUrl: "https://dealscale.app/contact",
			}),
		},
		{
			type: "behavioral",
			category: "contract_viewed",
			metadataGen: () => ({
				contractId: `contract_${Math.floor(Math.random() * 100)}`,
				viewDuration: Math.floor(Math.random() * 600) + 120,
			}),
		},
		{
			type: "behavioral",
			category: "multiple_page_visits",
			metadataGen: () => ({
				pageCount: Math.floor(Math.random() * 10) + 3,
				sessionDuration: Math.floor(Math.random() * 1800) + 300,
			}),
		},
		{
			type: "behavioral",
			category: "video_watched",
			metadataGen: () => ({
				videoTitle: "How to Analyze Investment Properties",
				videoWatchTime: Math.floor(Math.random() * 600) + 60,
				videoDuration: 720,
			}),
		},
		{
			type: "behavioral",
			category: "calculator_used",
			metadataGen: () => ({
				calculatorType: "ROI Calculator",
				calculationCount: Math.floor(Math.random() * 5) + 1,
			}),
		},
		// External signals
		{
			type: "external",
			category: "linkedin_visit",
			metadataGen: () => ({
				source: "LinkedIn Sales Navigator",
				companyPage: true,
			}),
		},
		{
			type: "external",
			category: "linkedin_profile_view",
			metadataGen: () => ({
				source: "LinkedIn",
				viewerTitle: "Real Estate Investor",
			}),
		},
		{
			type: "external",
			category: "company_growth",
			metadataGen: () => ({
				source: "ZoomInfo",
				growthIndicator: "Hiring 5+ employees",
			}),
		},
		{
			type: "external",
			category: "job_change",
			metadataGen: () => ({
				source: "LinkedIn",
				newRole: "VP of Acquisitions",
			}),
		},
		{
			type: "external",
			category: "funding_event",
			metadataGen: () => ({
				source: "Crunchbase",
				fundingAmount: "$2M Series A",
			}),
		},
		{
			type: "external",
			category: "social_follow",
			metadataGen: () => ({
				platform: "Twitter",
				accountHandle: "@dealscale",
			}),
		},
		{
			type: "external",
			category: "social_mention",
			metadataGen: () => ({
				platform: "LinkedIn",
				mentionContext: "Recommended DealScale to colleagues",
			}),
		},
	];

	// Pick a random signal configuration
	const config = signalConfigs[Math.floor(Math.random() * signalConfigs.length)];

	return {
		id: generateSignalId(),
		type: config.type,
		category: config.category,
		timestamp: randomDateWithinDays(maxAgeInDays),
		rawScore: 0, // Will be calculated by scoring engine
		metadata: config.metadataGen(),
	};
}

/**
 * Generate multiple mock intent signals
 * @param count - Number of signals to generate
 * @param maxAgeInDays - Maximum age of signals in days
 * @returns Array of mock intent signals
 */
export function generateMockIntentSignals(
	count: number,
	maxAgeInDays = 30,
): IntentSignal[] {
	const signals: IntentSignal[] = [];

	for (let i = 0; i < count; i++) {
		signals.push(generateMockIntentSignal(maxAgeInDays));
	}

	// Sort by timestamp (most recent first)
	return signals.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	);
}

/**
 * Generate intent signals with a specific profile
 * Useful for testing different intent levels
 */
export function generateIntentSignalProfile(
	profile: "high" | "medium" | "low",
): IntentSignal[] {
	const baseCount = profile === "high" ? 25 : profile === "medium" ? 15 : 8;
	const signals = generateMockIntentSignals(baseCount, 14);

	// For high intent, add more recent high-value signals
	if (profile === "high") {
		const highValueCategories: IntentSignalCategory[] = [
			"pricing_viewed",
			"demo_request",
			"call_connected",
			"contract_viewed",
		];

		for (const category of highValueCategories) {
			signals.push({
				id: generateSignalId(),
				type: "behavioral",
				category,
				timestamp: randomDateWithinDays(3),
				rawScore: 0,
				metadata: {
					pageUrl: "https://dealscale.app/pricing",
					timeOnPage: 180,
				},
			});
		}
	}

	return signals.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	);
}

