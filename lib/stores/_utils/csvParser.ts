import Papa from "papaparse";
import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import type { SocialsCount } from "@/types/_dashboard/leadList";

/**
 * Parse CSV text and extract leads based on field mappings
 */
export function parseCsvToLeads(
	csvText: string,
	fieldMappings: Record<string, string | undefined>,
): LeadTypeGlobal[] {
	console.log("🔄 parseCsvToLeads called");
	console.log("📄 CSV length:", csvText.length);
	console.log("🔗 Field mappings:", fieldMappings);

	try {
		const parsed = Papa.parse<Record<string, string | number | null>>(csvText, {
			header: true,
			skipEmptyLines: "greedy",
		});

		console.log("📋 Parsed CSV data rows:", parsed.data?.length || 0);

		if (!parsed.data || parsed.data.length === 0) {
			console.log("❌ No CSV data found");
			return [];
		}

		const leads: LeadTypeGlobal[] = [];

		for (const row of parsed.data) {
			// Skip empty rows
			if (
				Object.values(row).every(
					(value) => `${value ?? ""}`.trim().length === 0,
				)
			) {
				continue;
			}

			const lead = extractLeadFromRow(row, fieldMappings);
			if (lead) {
				leads.push(lead);
			}
		}

		console.log("✅ Successfully parsed", leads.length, "leads");
		return leads;
	} catch (error) {
		console.error("❌ Error parsing CSV:", error);
		return [];
	}
}

/**
 * Extract a lead object from a CSV row based on field mappings
 */
function extractLeadFromRow(
	row: Record<string, string | number | null>,
	fieldMappings: Record<string, string | undefined>,
): LeadTypeGlobal | null {
	try {
		// Extract basic contact info fields
		const firstName = extractFieldValue(row, fieldMappings.firstNameField);
		const lastName = extractFieldValue(row, fieldMappings.lastNameField);
		const email = extractFieldValue(row, fieldMappings.emailField);
		const phone =
			extractFieldValue(row, fieldMappings.phone1Field) ||
			extractFieldValue(row, fieldMappings.phone2Field);

		// Extract address fields
		const streetAddress = extractFieldValue(
			row,
			fieldMappings.streetAddressField,
		);
		const city = extractFieldValue(row, fieldMappings.cityField);
		const state = extractFieldValue(row, fieldMappings.stateField);
		const zipCode = extractFieldValue(row, fieldMappings.zipCodeField);

		// Extract social fields
		const facebook = extractFieldValue(row, fieldMappings.facebookField);
		const linkedin = extractFieldValue(row, fieldMappings.linkedinField);
		const instagram = extractFieldValue(row, fieldMappings.instagramField);
		const twitter = extractFieldValue(row, fieldMappings.twitterField);

		// Extract DNC and TCPA fields
		const dncStatus = extractFieldValue(row, fieldMappings.dncStatusField);
		const tcpaOptedIn = extractFieldValue(row, fieldMappings.tcpaOptedInField);

		// Skip if no name or contact data
		if (!firstName && !lastName && !email && !phone) {
			return null;
		}

		// Create contact info object
		const contactInfo = {
			firstName: firstName || "",
			lastName: lastName || "",
			email: email || "",
			phone: phone || "",
			address: streetAddress || "",
			domain: "", // Not available from CSV
			social: "", // Not available from CSV
		};

		// Create social links object
		const socials = {
			facebook: facebook || "",
			linkedin: linkedin || "",
			instagram: instagram || "",
			twitter: twitter || "",
		};

		// Create lead object
		const lead: LeadTypeGlobal = {
			id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			contactInfo,
			summary: "",
			bed: 0,
			bath: 0,
			sqft: 0,
			status: "New Lead",
			followUp: null,
			lastUpdate: new Date().toISOString(),
			address1: {
				fullStreetLine: streetAddress || "",
				city: city || "",
				state: state || "",
				zipCode: zipCode || "",
			},
			campaignID: "",
			socials: Object.values(socials).some((s) => s.length > 0)
				? socials
				: undefined,
			socialHandle:
				extractFieldValue(row, fieldMappings.instagramField) ||
				extractFieldValue(row, fieldMappings.twitterField) ||
				"",
			socialSummary: extractFieldValue(row, fieldMappings.socialSummary) || "",
			isIphone: false, // Not available from CSV
			communicationPreferences: [], // Not available from CSV
			dncList: dncStatus === "true" || dncStatus === "1",
			dncSource:
				dncStatus === "true" || dncStatus === "1" ? "CSV Import" : undefined,
			smsOptOut: false,
			emailOptOut: false,
			callOptOut: false,
			dmOptOut: false,
			tcpaOptedIn:
				tcpaOptedIn === "true" || tcpaOptedIn === "1" || tcpaOptedIn === "yes",
			tcpaConsentDate:
				tcpaOptedIn === "true" || tcpaOptedIn === "1" || tcpaOptedIn === "yes"
					? new Date().toISOString()
					: undefined,
			tcpaSource:
				tcpaOptedIn === "true" || tcpaOptedIn === "1" || tcpaOptedIn === "yes"
					? "CSV Import"
					: undefined,
		};

		return lead;
	} catch (error) {
		console.error("Error extracting lead from row:", error);
		return null;
	}
}

/**
 * Extract field value from CSV row based on field mapping
 */
function extractFieldValue(
	row: Record<string, string | number | null>,
	fieldMapping: string | undefined,
): string | null {
	if (!fieldMapping) {
		return null;
	}

	const value = row[fieldMapping];
	return value != null ? String(value).trim() : null;
}

/**
 * Calculate statistics for a list of leads
 */
export function calculateLeadStatistics(leads: LeadTypeGlobal[]) {
	const stats = {
		total: leads.length,
		phone: 0,
		email: 0,
		socials: {
			facebook: 0,
			linkedin: 0,
			instagram: 0,
			twitter: 0,
		} as SocialsCount,
	};

	for (const lead of leads) {
		if (lead.contactInfo.phone) stats.phone++;
		if (lead.contactInfo.email) stats.email++;
		if (lead.socials?.facebook)
			stats.socials.facebook = (stats.socials.facebook || 0) + 1;
		if (lead.socials?.linkedin)
			stats.socials.linkedin = (stats.socials.linkedin || 0) + 1;
		if (lead.socials?.instagram)
			stats.socials.instagram = (stats.socials.instagram || 0) + 1;
		if (lead.socials?.twitter)
			stats.socials.twitter = (stats.socials.twitter || 0) + 1;
	}

	return stats;
}
