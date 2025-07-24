// social.ts: Export social campaign table data to Excel
import ExcelJS from "exceljs";
import { saveWorkbookAsExcel, setWorksheetColumnsAndResize } from "./excel";

/**
 * Exports social campaign table data to Excel.
 * @param sheetName Name of the worksheet
 * @param columns Array of column definitions
 * @param data The data to export
 * @param filename Name of the file to download
 */
export async function exportSocialTableDataToExcel<T = Record<string, unknown>>(
	sheetName: string,
	columns: { header: string; accessorKey: string }[],
	data: T[],
	filename: string,
) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet(sheetName);
	setWorksheetColumnsAndResize<T>(worksheet, columns);
	for (const campaign of data) {
		// * We assume each campaign is of type T with string keys
		const row = columns.reduce(
			(acc, col) => {
				acc[col.accessorKey] = (campaign as Record<string, unknown>)[
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
