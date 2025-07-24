// * Lead/LeadList Excel & ZIP Export Utilities
// ! All lead data is exported as Uint8Array buffers for download/zip.
import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
// ! If LeadList is not exported from leads, import from correct location
import type { LeadList } from "@/types/_dashboard/leadList";
import ExcelJS from "exceljs";
import JSZip from "jszip";

/**
 * * Export a bulk array of leads to Excel.
 * @param leads - Array of LeadTypeGlobal
 * @param columns - Column definitions (header, accessorKey)
 * @param filename - Output filename (not used in buffer)
 * @returns Promise<Uint8Array> Excel file buffer
 */
export async function exportLeadsToExcel(
	leads: LeadTypeGlobal[],
	columns: { header: string; accessorKey: keyof LeadTypeGlobal | string }[],
	filename: string,
): Promise<Uint8Array> {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet("Leads");
	worksheet.columns = columns.map((col) => ({
		header: col.header,
		key: col.accessorKey,
		width: 30,
	}));
	for (const lead of leads) {
		const rowData: Record<
			string,
			string | number | boolean | null | undefined
		> = {
			id: lead.id,
			firstName: lead.firstName,
			lastName: lead.lastName,
			phone: lead.phone,
			email: lead.email,
			status: lead.status,
			followUp: lead.followUp,
			campaignID: lead.campaignID,
			address1: lead.address1,
			socials:
				[
					lead.socials?.facebook ? `Facebook: ${lead.socials.facebook}` : "",
					lead.socials?.linkedin ? `LinkedIn: ${lead.socials.linkedin}` : "",
					lead.socials?.instagram ? `Instagram: ${lead.socials.instagram}` : "",
					lead.socials?.twitter ? `Twitter: ${lead.socials.twitter}` : "",
				]
					.filter(Boolean)
					.join(", ") || "No Social Profiles",
		};
		worksheet.addRow(rowData);
	}
	// * Returns as Uint8Array for download/zip
	const buffer = await workbook.xlsx.writeBuffer();
	return new Uint8Array(buffer);
}

/**
 * * Export an array of LeadList objects to Excel, each list as a worksheet.
 * @param leadLists - Array of LeadList
 * @param filename - Output filename (not used in buffer)
 * @returns Promise<Uint8Array> Excel file buffer
 */
export async function exportLeadListsToExcel(
	leadLists: LeadList[],
	filename = "lead_lists.xlsx",
): Promise<Uint8Array> {
	const workbook = new ExcelJS.Workbook();
	for (const leadList of leadLists) {
		const worksheet = workbook.addWorksheet(
			leadList.listName || `LeadList ${leadList.id}`,
		);
		worksheet.columns = [
			{ header: "Lead ID", key: "id", width: 10 },
			{ header: "First Name", key: "firstName", width: 15 },
			{ header: "Last Name", key: "lastName", width: 15 },
			{ header: "Email", key: "email", width: 25 },
			{ header: "Phone", key: "phone", width: 15 },
			{ header: "Summary", key: "summary", width: 30 },
			{ header: "Bedrooms", key: "bed", width: 10 },
			{ header: "Bathrooms", key: "bath", width: 10 },
			{ header: "Square Footage", key: "sqft", width: 15 },
			{ header: "Status", key: "status", width: 15 },
			{ header: "Follow Up", key: "followUp", width: 20 },
			{ header: "Last Update", key: "lastUpdate", width: 20 },
			{ header: "Address", key: "address1", width: 30 },
			{ header: "Campaign ID", key: "campaignID", width: 20 },
			{ header: "Facebook", key: "facebook", width: 20 },
			{ header: "LinkedIn", key: "linkedin", width: 20 },
			{ header: "Instagram", key: "instagram", width: 20 },
			{ header: "Twitter", key: "twitter", width: 20 },
		];
		worksheet.addRow([]);
		worksheet.addRow(["List Name", leadList.listName]);
		worksheet.addRow(["Upload Date", leadList.uploadDate]);
		worksheet.addRow(["Total Records", leadList.records]);
		worksheet.addRow(["Phone Count", leadList.phone]);
		worksheet.addRow(["Email Count", leadList.emails]);
		worksheet.addRow([]);
		worksheet.addRow(["Leads Data"]);
		worksheet.addRow([]);
		for (const lead of leadList.leads) {
			worksheet.addRow({
				id: lead.id,
				firstName: lead.firstName,
				lastName: lead.lastName,
				email: lead.email,
				phone: lead.phone,
				summary: lead.summary,
				bed: lead.bed,
				bath: lead.bath,
				sqft: lead.sqft,
				status: lead.status,
				followUp: lead.followUp,
				lastUpdate: lead.lastUpdate,
				address1: lead.address1,
				campaignID: lead.campaignID,
				facebook: lead.socials?.facebook || "N/A",
				linkedin: lead.socials?.linkedin || "N/A",
				instagram: lead.socials?.instagram || "N/A",
				twitter: lead.socials?.twitter || "N/A",
			});
		}
	}
	// * Returns as Uint8Array for download/zip
	const buffer = await workbook.xlsx.writeBuffer();
	return new Uint8Array(buffer);
}

/**
 * * Export an array of LeadList objects to a ZIP file, each list as an Excel file.
 * @param leadLists - Array of LeadList
 * @param zipFilename - Output ZIP filename (not used in buffer)
 * @returns Promise<Uint8Array> ZIP file buffer
 */
export async function exportLeadListsToZip(
	leadLists: LeadList[],
	zipFilename = "lead_lists_export.zip",
): Promise<Uint8Array> {
	const zip = new JSZip();
	for (const leadList of leadLists) {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet(
			leadList.listName || `LeadList_${leadList.id}`,
		);
		worksheet.columns = [
			{ header: "Lead ID", key: "id", width: 10 },
			{ header: "First Name", key: "firstName", width: 15 },
			{ header: "Last Name", key: "lastName", width: 15 },
			{ header: "Email", key: "email", width: 25 },
			{ header: "Phone", key: "phone", width: 15 },
			{ header: "Summary", key: "summary", width: 30 },
			{ header: "Bedrooms", key: "bed", width: 10 },
			{ header: "Bathrooms", key: "bath", width: 10 },
			{ header: "Square Footage", key: "sqft", width: 15 },
			{ header: "Status", key: "status", width: 15 },
			{ header: "Follow Up", key: "followUp", width: 20 },
			{ header: "Last Update", key: "lastUpdate", width: 20 },
			{ header: "Address", key: "address1", width: 30 },
			{ header: "Campaign ID", key: "campaignID", width: 20 },
			{ header: "Facebook", key: "facebook", width: 20 },
			{ header: "LinkedIn", key: "linkedin", width: 20 },
			{ header: "Instagram", key: "instagram", width: 20 },
			{ header: "Twitter", key: "twitter", width: 20 },
		];
		worksheet.addRow([]);
		worksheet.addRow(["List Name", leadList.listName]);
		worksheet.addRow(["Upload Date", leadList.uploadDate]);
		worksheet.addRow(["Total Records", leadList.records]);
		worksheet.addRow(["Phone Count", leadList.phone]);
		worksheet.addRow(["Email Count", leadList.emails]);
		worksheet.addRow([]);
		worksheet.addRow(["Leads Data"]);
		worksheet.addRow([]);
		for (const lead of leadList.leads) {
			worksheet.addRow({
				id: lead.id,
				firstName: lead.firstName,
				lastName: lead.lastName,
				email: lead.email,
				phone: lead.phone,
				summary: lead.summary,
				bed: lead.bed,
				bath: lead.bath,
				sqft: lead.sqft,
				status: lead.status,
				followUp: lead.followUp,
				lastUpdate: lead.lastUpdate,
				address1: lead.address1,
				campaignID: lead.campaignID,
				facebook: lead.socials?.facebook || "N/A",
				linkedin: lead.socials?.linkedin || "N/A",
				instagram: lead.socials?.instagram || "N/A",
				twitter: lead.socials?.twitter || "N/A",
			});
		}
		const excelBuffer = await workbook.xlsx.writeBuffer();
		zip.file(
			`${leadList.listName || `LeadList_${leadList.id}`}.xlsx`,
			excelBuffer,
		);
	}
	return zip.generateAsync({ type: "uint8array" });
}
