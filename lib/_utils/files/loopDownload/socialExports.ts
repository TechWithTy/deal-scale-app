// * Social Campaign Excel Export Utilities
// ! All social campaign data is exported as Uint8Array buffers for download/zip.
import type {
	SocialMediaCampaign,
	SocialAction,
} from "@/types/_dashboard/campaign";
import ExcelJS from "exceljs";

/**
 * * Export social campaign data to Excel, each action as a row.
 * @param sheetName - Sheet name for the Excel file
 * @param campaignType - Type of campaign
 * @param columns - Column definitions (header, accessorKey)
 * @param data - Array of SocialMediaCampaign
 * @param filename - Output filename (not used in buffer)
 * @returns Promise<Uint8Array> Excel file buffer
 */
export async function exportSocialTableBulkToExcel(
	sheetName: string,
	campaignType: "text" | "email" | "social" | "call",
	columns: { header: string; accessorKey: string }[],
	data: SocialMediaCampaign[],
	filename: string,
): Promise<Uint8Array> {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet(sheetName);
	worksheet.columns = columns.map((col) => ({
		header: col.header,
		key: col.accessorKey,
	}));
	for (const campaign of data) {
		for (const action of campaign.actions) {
			const rowData: Record<
				string,
				string | number | boolean | null | undefined
			> = columns.reduce(
				(acc, col) => {
					if (col.accessorKey === "actions") {
						acc[col.accessorKey] =
							`${action.type} (Attempts: ${action.attempt}, Successes: ${action.successful}, Failures: ${action.failed}, Status: ${action.status}, View: ${action.viewLink || "N/A"})`;
					} else if (
						campaign[col.accessorKey as keyof SocialMediaCampaign] != null
					) {
						const value =
							campaign[col.accessorKey as keyof SocialMediaCampaign];
						acc[col.accessorKey] = Array.isArray(value)
							? value.join(", ")
							: typeof value === "object" && value !== null
								? JSON.stringify(value)
								: (value ?? "");
					}
					return acc;
				},
				{} as Record<string, string | number | boolean | null | undefined>,
			);
			worksheet.addRow(rowData);
		}
	}
	for (const column of worksheet.columns) {
		if (column.values) {
			column.width = Math.max(
				...column.values
					.filter((val) => val !== undefined && val !== null)
					.map((val) => val?.toString().length),
			);
		}
	}
	// * Returns as Uint8Array for download/zip
	const buffer = await workbook.xlsx.writeBuffer();
	return new Uint8Array(buffer);
}
