// messages.ts: Export campaign messages to Excel
import ExcelJS from "exceljs";
import { saveWorkbookAsExcel, setWorksheetColumnsAndResize } from "./excel";
import type { TextMessage } from "@/types/goHighLevel/text";

/**
 * Exports campaign messages to Excel.
 * @param sheetName Name of the worksheet
 * @param columns Array of column definitions
 * @param messages The messages to export
 * @param filename Name of the file to download
 */
export async function exportCampaignMessagesToExcel(
	sheetName: string,
	columns: { header: string; accessorKey: keyof TextMessage }[],
	messages: TextMessage[],
	filename: string,
) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet(sheetName);
	setWorksheetColumnsAndResize<TextMessage>(worksheet, columns);
	for (const message of messages) {
		const rowData = columns.reduce(
			(rowObj, col) => {
				if (col.accessorKey === "attachments") {
					rowObj[col.accessorKey as string] = message.attachments?.length
						? message.attachments.join(", ")
						: "No Attachments";
				} else {
					rowObj[col.accessorKey as string] = message[col.accessorKey] || "";
				}
				return rowObj;
			},
			{} as Record<string, unknown>,
		);
		worksheet.addRow(rowData);
	}
	await saveWorkbookAsExcel(workbook, filename);
}
