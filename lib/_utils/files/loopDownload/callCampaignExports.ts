// * Call Campaign Excel Export Utilities
// ! All campaign data is exported as Uint8Array buffers for download/zip.
import type { CallCampaign, CallInfo } from "@/types/_dashboard/campaign";
import ExcelJS from "exceljs";

/**
 * * Export call campaign data to Excel, each call as a row.
 * @param sheetName - Sheet name for the Excel file
 * @param campaignType - Type of campaign ("text", "email", "social", "call")
 * @param columns - Column definitions (header, accessorKey)
 * @param data - Array of CallCampaign
 * @param filename - Output filename (not used in buffer)
 * @returns Promise<Uint8Array> Excel file buffer
 */
export async function exportCallCampaignsToExcel(
	sheetName: string,
	campaignType: "text" | "email" | "social" | "call",
	columns: { header: string; accessorKey: string }[],
	data: CallCampaign[],
	filename: string,
): Promise<Uint8Array> {
	const workbook = new ExcelJS.Workbook();
	const campaignName =
		data.length > 0 ? data[0].name.replace(/\s+/g, "_") : "Unnamed_Campaign";
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0");
	const yyyy = today.getFullYear();
	const formattedDate = `${dd}_${mm}_${yyyy}`;
	const worksheet = workbook.addWorksheet(
		`${sheetName}_${campaignName}_${formattedDate}`,
	);

	worksheet.columns = columns.map((col) => ({
		header: col.header,
		key: col.accessorKey,
	}));

	for (const campaign of data) {
		for (const callInfo of campaign.callInformation) {
			const { callResponse } = callInfo;
			const rowData: Record<
				string,
				string | number | boolean | null | undefined
			> = columns.reduce(
				(acc, col) => {
					switch (col.accessorKey) {
						case "status":
							acc[col.accessorKey] = campaign.status || "No Status";
							break;
						case "createdAt":
							acc[col.accessorKey] = callResponse?.createdAt
								? new Date(callResponse.createdAt).toLocaleString()
								: "N/A";
							break;
						case "updatedAt":
							acc[col.accessorKey] = callResponse?.updatedAt
								? new Date(callResponse.updatedAt).toLocaleString()
								: "N/A";
							break;
						case "startedAt":
							acc[col.accessorKey] = callResponse?.startedAt
								? new Date(callResponse.startedAt).toLocaleString()
								: "N/A";
							break;
						case "endedAt":
							acc[col.accessorKey] = callResponse?.endedAt
								? new Date(callResponse.endedAt).toLocaleString()
								: "N/A";
							break;
						case "costBreakdown.total":
							acc[col.accessorKey] =
								callResponse?.costBreakdown &&
								typeof callResponse.costBreakdown.total === "number"
									? `$${callResponse.costBreakdown.total.toFixed(2)}`
									: "N/A";
							break;
						case "phoneCallProvider":
							acc[col.accessorKey] = callResponse?.phoneCallProvider
								? callResponse.phoneCallProvider
								: "N/A";
							break;
						case "transcript":
							acc[col.accessorKey] = callResponse?.transcript
								? callResponse.transcript
								: "No Transcript";
							break;
						case "recordingUrl":
							acc[col.accessorKey] = callResponse?.recordingUrl
								? callResponse.recordingUrl
								: "No Recording";
							break;
						default: {
							// * Defensive: Only assign primitive values
							const value = campaign[col.accessorKey as keyof typeof campaign];
							acc[col.accessorKey] = Array.isArray(value)
								? value.join(", ")
								: typeof value === "object" && value !== null
									? JSON.stringify(value)
									: (value ?? "");
						}
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
