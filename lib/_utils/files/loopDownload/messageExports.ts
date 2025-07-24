// * Message Campaign Excel Export Utilities
// ! All message campaign data is exported as Uint8Array buffers for download/zip.
import type { TextMessage } from "@/types/goHighLevel/text";
import ExcelJS from "exceljs";

/**
 * * Export a bulk array of campaign messages to Excel.
 * @param sheetName - Sheet name for the Excel file
 * @param columns - Column definitions (header, accessorKey)
 * @param messages - Array of TextMessage
 * @param filename - Output filename (not used in buffer)
 * @returns Promise<Uint8Array> Excel file buffer
 */
export async function exportCampaignMessagesBulkToExcel(
	sheetName: string,
	columns: { header: string; accessorKey: keyof TextMessage }[],
	messages: TextMessage[],
	filename: string,
): Promise<Uint8Array> {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet(sheetName);
	worksheet.columns = columns.map((col) => ({
		header: col.header,
		key: col.accessorKey as string,
		width: 30,
	}));
	for (const message of messages) {
		const rowData: Record<
			string,
			string | number | boolean | null | undefined
		> = columns.reduce(
			(rowObj, col) => {
				const value = message[col.accessorKey];
				if (Array.isArray(value)) {
					rowObj[col.accessorKey as string] = value.join(", ");
				} else if (typeof value === "object" && value !== null) {
					rowObj[col.accessorKey as string] = JSON.stringify(value);
				} else {
					rowObj[col.accessorKey as string] = value ?? "";
				}
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
