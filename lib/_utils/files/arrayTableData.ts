import { saveAs } from "file-saver";
import JSZip from "jszip";

import type {
	CallCampaign,
	SocialMediaCampaign,
} from "@/types/_dashboard/campaign";
import type {
	EmailCampaign,
	GetEmailByIdResponse,
} from "@/types/goHighLevel/email";
import type {
	GHLTextMessageCampaign,
	TextMessage,
} from "@/types/goHighLevel/text";
import { exportCallCampaignsToExcel } from "./loopDownload/callCampaignExports";
import { exportCampaignMessagesBulkToExcel } from "./loopDownload/messageExports";
import { exportEmailCampaignBulkToExcel } from "./loopDownload/emailExports";
import { exportSocialTableBulkToExcel } from "./loopDownload/socialExports";

// Email campaign columns
const emailColumns: {
	header: string;
	accessorKey: keyof GetEmailByIdResponse;
}[] = [
	{ header: "Email ID", accessorKey: "id" },
	{ header: "Subject", accessorKey: "subject" },
	{ header: "Body", accessorKey: "body" },
	{ header: "From", accessorKey: "from" },
	{ header: "To", accessorKey: "to" },
	{ header: "CC", accessorKey: "cc" },
	{ header: "BCC", accessorKey: "bcc" },
	{ header: "Status", accessorKey: "status" },
	{ header: "Attachments", accessorKey: "attachments" },
	{ header: "Date Added", accessorKey: "dateAdded" },
];

// Text message columns
const textMessageColumns: { header: string; accessorKey: keyof TextMessage }[] =
	[
		{ header: "Message ID", accessorKey: "id" },
		{ header: "Body", accessorKey: "body" },
		{ header: "Attachments", accessorKey: "attachments" },
		{ header: "Type", accessorKey: "messageType" },
		{ header: "Status", accessorKey: "status" },
		{ header: "Direction", accessorKey: "direction" },
		{ header: "Date Added", accessorKey: "dateAdded" },
	];

// Social media campaign columns
const socialColumns = [
	{ header: "Campaign Name", accessorKey: "name" },
	{ header: "Platform", accessorKey: "platform" },
	{ header: "Sender Handle", accessorKey: "senderHandle" },
	{ header: "Start Date", accessorKey: "startDate" },
	{ header: "End Date", accessorKey: "endDate" },
	{ header: "Status", accessorKey: "status" },
	{ header: "Actions", accessorKey: "actions" },
];

// Call campaign columns (assuming similar structure)
export const callColumns = [
	{ header: "Campaign Name", accessorKey: "name" },
	{ header: "Campaign Status", accessorKey: "campaignStatus" }, // New column for campaign status
	{ header: "Call Status", accessorKey: "status" }, // Renamed to clarify it's for the call status
	{ header: "Created At", accessorKey: "createdAt" },
	{ header: "Updated At", accessorKey: "updatedAt" },
	{ header: "Started At", accessorKey: "startedAt" },
	{ header: "Ended At", accessorKey: "endedAt" },
	{ header: "Total Cost", accessorKey: "costBreakdown.total" },
	{ header: "Provider", accessorKey: "phoneCallProvider" },
	{ header: "Transcript", accessorKey: "transcript" },
	{ header: "Recording URL", accessorKey: "recordingUrl" },
];

// Get today's date in dd/mm/yyyy format
const today = new Date();
const dd = String(today.getDate()).padStart(2, "0");
const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
const yyyy = today.getFullYear();
const formattedDate = `${dd}_${mm}_${yyyy}`; // Format the date with underscores

// Function to export multiple campaigns to ZIP
export async function exportMultipleCampaignsToZip(
	campaignType: "call" | "email" | "text" | "social",
	campaigns: (
		| CallCampaign
		| EmailCampaign
		| GHLTextMessageCampaign
		| SocialMediaCampaign
	)[], // An array of mixed campaigns
	filename: string,
) {
	const zip = new JSZip();

	// Helper function to process and add each campaign to the zip
	const processCampaign = async (
		campaign:
			| CallCampaign
			| EmailCampaign
			| GHLTextMessageCampaign
			| SocialMediaCampaign,
		index: number,
	) => {
		let buffer: Uint8Array | undefined;
		const campaignFilename = `${filename}_campaign_${index + 1}.xlsx`; // Unique filename per campaign

		switch (campaignType) {
			case "email": {
				const columns: {
					header: string;
					accessorKey: keyof GetEmailByIdResponse;
				}[] = emailColumns;
				buffer = await exportEmailCampaignBulkToExcel(
					"Email Campaign",
					columns,
					(campaign as EmailCampaign).emails, // Extract emails for EmailCampaign
					campaignFilename,
				);
				break;
			}

			case "text": {
				const columns: { header: string; accessorKey: keyof TextMessage }[] =
					textMessageColumns;
				const textMessages = (campaign as GHLTextMessageCampaign).messages; // Extract messages for GHLTextMessageCampaign
				buffer = await exportCampaignMessagesBulkToExcel(
					"Text Campaign",
					columns,
					textMessages, // Export messages
					campaignFilename,
				);
				break;
			}

			case "social": {
				const columns: { header: string; accessorKey: string }[] =
					socialColumns;
				const socialCampaign = campaign as SocialMediaCampaign;
				buffer = await exportSocialTableBulkToExcel(
					"Social Campaign",
					campaignType,
					columns,
					[campaign as SocialMediaCampaign], // Export SocialMediaCampaign
					campaignFilename,
				);
				break;
			}

			case "call": {
				const columns: { header: string; accessorKey: string }[] = callColumns;
				buffer = await exportCallCampaignsToExcel(
					"Call Campaign",
					campaignType,
					columns,
					[campaign as CallCampaign], // Export CallCampaign
					campaignFilename,
				);
				break;
			}

			default: {
				console.error("Unsupported campaign type");
				break;
			}
		}

		if (buffer) {
			zip.file(campaignFilename, buffer); // Add the campaign data to the zip
		}
	};

	// Loop over each campaign and process it
	for (let i = 0; i < campaigns.length; i++) {
		await processCampaign(campaigns[i], i); // Process each campaign
	}

	// Generate ZIP and download
	const zipBlob = await zip.generateAsync({ type: "blob" });
	saveAs(
		zipBlob,
		`${campaignType.toLocaleUpperCase()}_Campaigns_Export${`${formattedDate}.zip`}`,
	);
}
