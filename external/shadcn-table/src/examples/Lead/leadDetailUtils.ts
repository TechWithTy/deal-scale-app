import type { DemoLead } from "./types";

export function formatLeadDossier(lead: DemoLead): string {
	const phones = lead.possiblePhones?.length
		? `Phones: ${lead.possiblePhones.join(", ")}`
		: "Phones: -";
	const emails = lead.possibleEmails?.length
		? `Emails: ${lead.possibleEmails.join(", ")}`
		: "Emails: -";
	const handles = lead.possibleHandles?.length
		? `Usernames: ${lead.possibleHandles
				.map((h) => `${h.platform}:${h.username}${h.url ? `(${h.url})` : ""}`)
				.join(", ")}`
		: "Usernames: -";
	
	const leadName = lead.name || `${lead.contactInfo?.firstName || ""} ${lead.contactInfo?.lastName || ""}`.trim() || "Unknown";
	const leadAddress = lead.address || lead.contactInfo?.address || lead.address1?.fullStreetLine || "-";
	const leadPhone = lead.phone || lead.contactInfo?.phone || "-";
	const leadEmail = lead.email || lead.contactInfo?.email || "-";
	
	return [
		`Lead: ${leadName}`,
		`Address: ${leadAddress}`,
		`Associated Address: ${lead.associatedAddress || "-"}`,
		`Address Verified: ${lead.addressVerified ? "Yes" : "No"}`,
		`Phone: ${leadPhone}`,
		`Email: ${leadEmail}`,
		`Is iPhone: ${lead.isIphone ? "Yes" : "No"}`,
		`Verified — Phone: ${lead.phoneVerified ? "Yes" : "No"}, Email: ${lead.emailVerified ? "Yes" : "No"}, Social: ${lead.socialVerified ? "Yes" : "No"}`,
		phones,
		emails,
		handles,
	].join("\n");
}

export function formatLeadDossierSummary(lead: DemoLead): string {
	const phones = lead.possiblePhones?.length || 0;
	const emails = lead.possibleEmails?.length || 0;
	const platforms = lead.possibleHandles?.length
		? Array.from(new Set(lead.possibleHandles.map((h) => h.platform)))
		: [];
	const topHandles = lead.possibleHandles?.length
		? lead.possibleHandles
				.slice(0, 3)
				.map((h) => `${h.platform}:${h.username}`)
		: [];
	const parts: string[] = [];
	parts.push(`Phones: ${phones}`);
	parts.push(`Emails: ${emails}`);
	if (platforms.length) parts.push(`Platforms: ${platforms.join(", ")}`);
	if (topHandles.length)
		parts.push(
			`Top: ${topHandles.join(", ")}${(lead.possibleHandles?.length || 0) > 3 ? "…" : ""}`,
		);
	return parts.join(" • ");
}
