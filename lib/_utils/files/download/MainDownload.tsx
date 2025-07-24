// MainDownload.tsx: Centralized component for all download/export actions
// * Combines all subcomponents/utilities for DRY, scalable data export
import type React from "react";
import type { GetEmailByIdResponse } from "@/types/goHighLevel/email";
import type { TextMessage } from "@/types/goHighLevel/text";
import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import type { SocialMediaCampaign } from "@/types/_dashboard/campaign";
import { exportLeadsTableDataToExcel } from "./leads";
import { exportSocialTableDataToExcel } from "./social";
import { exportCampaignMessagesToExcel } from "./messages";
import { exportEmailCampaignToExcel } from "./email";

// ! Add more types and exports as your app grows

type DownloadType = "lead" | "social" | "message" | "email";

type MainDownloadProps =
	| {
			type: "lead";
			data: LeadTypeGlobal[];
			columns: { header: string; accessorKey: string }[];
			filename: string;
			sheetName?: string;
	  }
	| {
			type: "social";
			data: SocialMediaCampaign[];
			columns: { header: string; accessorKey: string }[];
			filename: string;
			sheetName?: string;
	  }
	| {
			type: "message";
			data: TextMessage[];
			columns: { header: string; accessorKey: keyof TextMessage }[];
			filename: string;
			sheetName?: string;
	  }
	| {
			type: "email";
			data: GetEmailByIdResponse[];
			columns: { header: string; accessorKey: keyof GetEmailByIdResponse }[];
			filename: string;
			sheetName?: string;
	  };

/**
 * MainDownload: Centralized download/export button for all supported types
 * @param props MainDownloadProps
 */
export const MainDownload: React.FC<MainDownloadProps> = (props) => {
	const { type, data, columns, filename, sheetName = "Export" } = props;

	// * Handles download for all supported types
	const handleDownload = async () => {
		switch (type) {
			case "lead":
				await exportLeadsTableDataToExcel(sheetName, columns, data, filename);
				break;
			case "social":
				await exportSocialTableDataToExcel(sheetName, columns, data, filename);
				break;
			case "message":
				await exportCampaignMessagesToExcel(sheetName, columns, data, filename);
				break;
			case "email":
				await exportEmailCampaignToExcel(sheetName, columns, data, filename);
				break;
			default:
				alert("Unknown export type");
		}
	};

	return (
		<button
			type="button"
			className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
			onClick={handleDownload}
		>
			Download {type.charAt(0).toUpperCase() + type.slice(1)}
		</button>
	);
};

export default MainDownload;
