// email.ts: Export email campaign data to Excel
import ExcelJS from "exceljs";
import { saveWorkbookAsExcel, setWorksheetColumnsAndResize } from "./excel";
import type { GetEmailByIdResponse } from "@/types/goHighLevel/email";

/**
 * Exports email campaign data to Excel.
 * @param sheetName Name of the worksheet
 * @param columns Array of column definitions
 * @param emails The emails to export
 * @param filename Name of the file to download
 */
export async function exportEmailCampaignToExcel(
	sheetName: string,
	columns: { header: string; accessorKey: keyof GetEmailByIdResponse }[],
	emails: GetEmailByIdResponse[],
	filename: string,
) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet(sheetName);
	if (!emails || emails.length === 0) {
		// ! No emails to export
		return;
	}
	setWorksheetColumnsAndResize<GetEmailByIdResponse>(worksheet, columns);
	for (const email of emails) {
		const rowData = columns.reduce(
			(rowObj, col) => {
				if (col.accessorKey === "attachments") {
					rowObj[col.accessorKey as string] = Array.isArray(
						email[col.accessorKey],
					)
						? (email[col.accessorKey] as string[]).join(", ")
						: "No Attachments";
				} else if (["to", "cc", "bcc"].includes(col.accessorKey as string)) {
					rowObj[col.accessorKey as string] = Array.isArray(
						email[col.accessorKey],
					)
						? (email[col.accessorKey] as string[]).join(", ")
						: "None";
				} else {
					const value = email[col.accessorKey];
					rowObj[col.accessorKey as string] = value !== undefined ? value : "";
				}
				return rowObj;
			},
			{} as Record<string, unknown>,
		);
		worksheet.addRow(rowData);
	}
	await saveWorkbookAsExcel(workbook, filename);
}
