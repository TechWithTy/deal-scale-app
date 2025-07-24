import type React from "react";
// Import subcomponents directly (not via index)
import { exportCallCampaignsToExcel } from "./callCampaignExports";
import { exportEmailCampaignBulkToExcel } from "./emailExports";
import {
	exportLeadsToExcel,
	exportLeadListsToExcel,
	exportLeadListsToZip,
} from "./leadExports";
import { exportCampaignMessagesBulkToExcel } from "./messageExports";
import { exportSocialTableBulkToExcel } from "./socialExports";

// * Props for the main component
// ! Important: Use discriminated union for strong type safety
export interface LoopDownloadMainPropsBase {
	sheetName?: string;
	filename?: string;
	campaignType?: "text" | "email" | "social" | "call";
}

import type { GetEmailByIdResponse } from "@/types/goHighLevel/email";

export interface LoopDownloadMainEmailProps extends LoopDownloadMainPropsBase {
	type: "email";
	data: GetEmailByIdResponse[];
	columns: { header: string; accessorKey: keyof GetEmailByIdResponse }[];
}

export interface LoopDownloadMainMessageProps
	extends LoopDownloadMainPropsBase {
	type: "message";
	data: import("@/types/goHighLevel/text").TextMessage[];
	columns: {
		header: string;
		accessorKey: keyof import("@/types/goHighLevel/text").TextMessage;
	}[];
}

export interface LoopDownloadMainCallProps extends LoopDownloadMainPropsBase {
	type: "call";
	data: import("@/types/_dashboard/campaign").CallCampaign[];
	columns: { header: string; accessorKey: string }[];
}

import type { LeadTypeGlobal } from "@/types/_dashboard/leads";

export interface LoopDownloadMainLeadProps extends LoopDownloadMainPropsBase {
	type: "lead";
	data: LeadTypeGlobal[];
	columns: { header: string; accessorKey: string }[];
}

export interface LoopDownloadMainLeadListProps
	extends LoopDownloadMainPropsBase {
	type: "leadList" | "leadListZip";
	data: import("@/types/_dashboard/leadList").LeadList[];
	columns?: never;
}

export interface LoopDownloadMainSocialProps extends LoopDownloadMainPropsBase {
	type: "social";
	data: import("@/types/_dashboard/campaign").SocialMediaCampaign[];
	columns: { header: string; accessorKey: string }[];
}

export type LoopDownloadMainProps =
	| LoopDownloadMainEmailProps
	| LoopDownloadMainMessageProps
	| LoopDownloadMainCallProps
	| LoopDownloadMainLeadProps
	| LoopDownloadMainLeadListProps
	| LoopDownloadMainSocialProps;

/**
 * Main LoopDownload component to handle all export types.
 * Calls the correct utility function based on the type prop.
 */
export const LoopDownloadMain = (props: LoopDownloadMainProps) => {
	// Destructure with fallback for optional props
	const {
		type,
		data,
		columns,
		sheetName = "Export",
		filename = "export.xlsx",
		campaignType = "call",
	} = props;

	// * Handler for download button
	const handleDownload = async () => {
		let buffer: Uint8Array | undefined;
		switch (type) {
			case "call": {
				const callProps = props as LoopDownloadMainCallProps;
				buffer = await exportCallCampaignsToExcel(
					sheetName,
					campaignType,
					callProps.columns,
					callProps.data,
					filename,
				);
				break;
			}
			case "email": {
				const emailProps = props as LoopDownloadMainEmailProps;
				buffer = await exportEmailCampaignBulkToExcel(
					sheetName,
					emailProps.columns,
					emailProps.data,
					filename,
				);
				break;
			}
			case "lead": {
				const leadProps = props as LoopDownloadMainLeadProps;
				buffer = await exportLeadsToExcel(
					leadProps.data,
					leadProps.columns,
					filename,
				);
				break;
			}
			case "leadList": {
				const leadListProps = props as LoopDownloadMainLeadListProps;
				buffer = await exportLeadListsToExcel(leadListProps.data, filename);
				break;
			}
			case "leadListZip": {
				const leadListZipProps = props as LoopDownloadMainLeadListProps;
				buffer = await exportLeadListsToZip(leadListZipProps.data, filename);
				break;
			}
			case "message": {
				const messageProps = props as LoopDownloadMainMessageProps;
				buffer = await exportCampaignMessagesBulkToExcel(
					sheetName,
					messageProps.columns,
					messageProps.data,
					filename,
				);
				break;
			}
			case "social": {
				const socialProps = props as LoopDownloadMainSocialProps;
				buffer = await exportSocialTableBulkToExcel(
					sheetName,
					campaignType,
					socialProps.columns,
					socialProps.data,
					filename,
				);
				break;
			}
			default:
				alert("Unknown export type");
				return;
		}
		// * Trigger browser download
		if (buffer) {
			const blob = new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			a.click();
			window.URL.revokeObjectURL(url);
		}
	};

	return (
		<button
			type="button"
			onClick={handleDownload}
			className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
		>
			Download {type.charAt(0).toUpperCase() + type.slice(1)} Export
		</button>
	);
};

export default LoopDownloadMain;
