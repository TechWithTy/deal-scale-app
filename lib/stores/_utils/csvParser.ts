import Papa from "papaparse";
import type { LeadTypeGlobal, LeadStatus } from "@/types/_dashboard/leads";
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
		const phone = extractFieldValue(row, fieldMappings.phone1Field);
		const possiblePhones = [
			extractFieldValue(row, fieldMappings.phone2Field),
			extractFieldValue(row, fieldMappings.phone3Field),
		]
			.filter(Boolean)
			.join(", ");

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
		const tiktok = extractFieldValue(row, fieldMappings.tiktokField);
		const youtube = extractFieldValue(row, fieldMappings.youtubeField);

		// Extract DNC and TCPA fields
		const dncStatus = extractFieldValue(row, fieldMappings.dncStatusField);
		const dncSource = extractFieldValue(row, fieldMappings.dncSourceField);
		const tcpaOptedIn = extractFieldValue(row, fieldMappings.tcpaOptedInField);
		const tcpaSource = extractFieldValue(row, fieldMappings.tcpaSourceField);

		// Extract additional fields
		const socialSummary = extractFieldValue(row, fieldMappings.socialSummary);
		const bedrooms = extractFieldValue(row, fieldMappings.bedroomsField);
		const bathrooms = extractFieldValue(row, fieldMappings.bathroomsField);
		const squareFootage = extractFieldValue(
			row,
			fieldMappings.squareFootageField,
		);
		const propertyValue = extractFieldValue(
			row,
			fieldMappings.propertyValueField,
		);
		const yearBuilt = extractFieldValue(row, fieldMappings.yearBuiltField);
		const leadStatus = extractFieldValue(row, fieldMappings.leadStatusField);
		const leadSource = extractFieldValue(row, fieldMappings.leadSourceField);
		const notes = extractFieldValue(row, fieldMappings.notesField);
		const tags = extractFieldValue(row, fieldMappings.tagsField);
		const priority = extractFieldValue(row, fieldMappings.priorityField);
		const communicationPreferences = extractFieldValue(
			row,
			fieldMappings.communicationPreferencesField,
		);
		const isIphone = extractFieldValue(row, fieldMappings.isIphoneField);
		const company = extractFieldValue(row, fieldMappings.companyField);
		const jobTitle = extractFieldValue(row, fieldMappings.jobTitleField);
		const domain = extractFieldValue(row, fieldMappings.domainField);
		const birthday = extractFieldValue(row, fieldMappings.birthdayField);
		const anniversary = extractFieldValue(row, fieldMappings.anniversaryField);
		const possibleEmails = extractFieldValue(
			row,
			fieldMappings.possibleEmailsField,
		);
		const emailVerified = extractFieldValue(
			row,
			fieldMappings.emailVerifiedField,
		);
		const socialVerified = extractFieldValue(
			row,
			fieldMappings.socialVerifiedField,
		);

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
			emailVerified: emailVerified === "true" || emailVerified === "1",
			socialVerified: socialVerified === "true" || socialVerified === "1",
			possiblePhones: possiblePhones || undefined,
			possibleEmails: possibleEmails || undefined,
		};

		// Create social links object
		const socials = {
			facebook: facebook || "",
			linkedin: linkedin || "",
			instagram: instagram || "",
			twitter: twitter || "",
			tiktok: tiktok || "",
			youtube: youtube || "",
		};

		// Create lead object
		const lead: LeadTypeGlobal = {
			id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			contactInfo,
			summary: "",
			bed: bedrooms ? parseInt(String(bedrooms), 10) || 0 : 0,
			bath: bathrooms ? parseInt(String(bathrooms), 10) || 0 : 0,
			sqft: squareFootage ? parseInt(String(squareFootage), 10) || 0 : 0,
			status: (leadStatus as LeadStatus) || "New Lead",
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
			socialSummary: socialSummary || "",
			isIphone: isIphone === "true" || isIphone === "1",
			communicationPreferences: communicationPreferences
				? communicationPreferences
						.split(/[,;]/)
						.map((s) => s.trim())
						.filter(Boolean)
				: [],
			dncList: dncStatus === "true" || dncStatus === "1",
			dncSource:
				(dncStatus === "true" || dncStatus === "1") && dncSource
					? dncSource
					: dncStatus === "true" || dncStatus === "1"
						? "CSV Import"
						: undefined,
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
					? tcpaSource || "CSV Import"
					: undefined,
			propertyValue: propertyValue
				? parseFloat(String(propertyValue)) || undefined
				: undefined,
			yearBuilt: yearBuilt
				? parseInt(String(yearBuilt), 10) || undefined
				: undefined,
			leadSource: leadSource || undefined,
			notes: notes || undefined,
			tags: tags || undefined,
			priority: priority || undefined,
			company: company || undefined,
			jobTitle: jobTitle || undefined,
			domain: domain || undefined,
			birthday: birthday || undefined,
			anniversary: anniversary || undefined,
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
			tiktok: 0,
			youtube: 0,
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
		if (lead.socials?.tiktok)
			stats.socials.tiktok = (stats.socials.tiktok || 0) + 1;
		if (lead.socials?.youtube)
			stats.socials.youtube = (stats.socials.youtube || 0) + 1;
	}

	return stats;
}
