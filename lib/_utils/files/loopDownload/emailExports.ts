// * Email Campaign Excel Export Utilities
// ! All email campaign data is exported as Uint8Array buffers for download/zip.
import type { GetEmailByIdResponse } from "@/types/goHighLevel/email";
import ExcelJS from "exceljs";

/**
 * * Export a bulk array of email campaign results to Excel.
 * @param sheetName - Sheet name for the Excel file
 * @param columns - Column definitions (header, accessorKey)
 * @param emails - Array of GetEmailByIdResponse
 * @param filename - Output filename (not used in buffer)
 * @returns Promise<Uint8Array> Excel file buffer
 */
export async function exportEmailCampaignBulkToExcel(
	sheetName: string,
	columns: { header: string; accessorKey: keyof GetEmailByIdResponse }[],
	emails: GetEmailByIdResponse[],
	filename: string,
): Promise<Uint8Array> {
	const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
	const worksheet: ExcelJS.Worksheet = workbook.addWorksheet(sheetName);

	worksheet.columns = columns.map((col) => ({
		header: col.header,
		key: col.accessorKey as string,
		width: 30,
	}));

	for (const email of emails) {
		const rowData: Record<
			string,
			string | number | boolean | null | undefined
		> = columns.reduce(
			(rowObj, col) => {
				const value = email[col.accessorKey];
				rowObj[col.accessorKey as string] = Array.isArray(value)
					? value.join(", ")
					: typeof value === "object" && value !== null
						? JSON.stringify(value)
						: (value ?? "");
				return rowObj;
			},
			{} as Record<string, string | number | boolean | null | undefined>,
		);
		worksheet.addRow(rowData);
	}

	// * Returns as Uint8Array for download/zip
	const buffer = await workbook.xlsx.writeBuffer();
	return new Uint8Array(buffer);
}
