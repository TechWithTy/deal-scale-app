// excel.ts: Generic Excel export helpers for download utilities
// * Extracted from verbose downloadTableData.ts for DRY, maintainable code
import type ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * ! Creates and downloads an Excel file from worksheet data
 * @param workbook ExcelJS Workbook instance
 * @param filename Name of the file to download
 */
export async function saveWorkbookAsExcel(
	workbook: ExcelJS.Workbook,
	filename: string,
) {
	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	saveAs(blob, filename);
}

/**
 * * Sets worksheet columns and auto-resizes them based on content
 * @param worksheet ExcelJS.Worksheet instance
 * @param columns Array of column definitions
 */
export function setWorksheetColumnsAndResize<T>(
	worksheet: ExcelJS.Worksheet,
	columns: { header: string; accessorKey: keyof T | string; width?: number }[],
) {
	worksheet.columns = columns.map((col) => ({
		header: col.header,
		key: col.accessorKey as string,
		width: col.width || 30,
	}));
	for (const column of worksheet.columns) {
		if (column.values) {
			column.width =
				Math.max(
					...column.values
						.filter((val) => val !== undefined && val !== null)
						.map((val) => val?.toString().length),
					column.header ? column.header.toString().length : 10,
				) + 2;
		}
	}
}
