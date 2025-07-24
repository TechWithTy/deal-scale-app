// leads.ts: Export leads table data to Excel
import ExcelJS from "exceljs";
import { saveWorkbookAsExcel, setWorksheetColumnsAndResize } from "./excel";

/**
 * Exports leads table data to Excel.
 * @param sheetName Name of the worksheet
 * @param columns Array of column definitions
 * @param data The leads data to export
 * @param filename Name of the file to download
 */
export async function exportLeadsTableDataToExcel<T = Record<string, unknown>>(
	sheetName: string,
	columns: { header: string; accessorKey: string }[],
	data: T[],
	filename: string,
) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet(sheetName);
	setWorksheetColumnsAndResize<T>(worksheet, columns);
	for (const lead of data) {
		// * We assume each lead is of type T with string keys
		const row = columns.reduce(
			(acc, col) => {
				acc[col.accessorKey] = (lead as Record<string, unknown>)[
					col.accessorKey
				];
				return acc;
			},
			{} as Record<string, unknown>,
		);
		worksheet.addRow(row);
	}
	await saveWorkbookAsExcel(workbook, filename);
}
