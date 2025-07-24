import { exportSocialTableBulkToExcel } from "@/lib/_utils/files/loopDownload/socialExports";
import type { SocialAction } from "@/types/_dashboard/campaign";
import React from "react";

interface RowOriginal {
	name: string;
	platform: string;
	senderHandle: string;
	startDate: string;
	endDate: string;
	status: string;
	actions: SocialAction[] | Record<string, SocialAction>;
}

// * Type for Excel export (actions as string, not SocialAction[])
type ExportSocialCampaignRow = {
	id: string;
	name: string;
	platform: "LinkedIn" | "Twitter" | "Instagram" | "Facebook";
	senderHandle: string;
	receiverHandle: string;
	hashtags: string[];
	startDate: string;
	endDate: string;
	status: string;
	createdAt: string;
	actions: string;
};

export const DownloadCell = ({ row }: { row: { original: RowOriginal } }) => {
	const handleDownload = () => {
		const columns = [
			{ header: "Campaign Name", accessorKey: "name" },
			{ header: "Platform", accessorKey: "platform" },
			{ header: "Sender Handle", accessorKey: "senderHandle" },
			{ header: "Start Date", accessorKey: "startDate" },
			{ header: "End Date", accessorKey: "endDate" },
			{ header: "Status", accessorKey: "status" },
			{ header: "Actions", accessorKey: "actions" },
		];
		const platforms = Array.from(
			new Set(
				(row.original.actions as SocialAction[]).map((action: SocialAction) => {
					if (action.type.includes("📩")) return "LinkedIn";
					if (["Like", "Follow", "Retweet"].includes(action.type))
						return "Twitter";
					return "Instagram";
				}),
			),
		) as ("LinkedIn" | "Twitter" | "Instagram" | "Facebook")[];
		const filterActionsByPlatform = (
			platform: "LinkedIn" | "Twitter" | "Instagram" | "Facebook",
		) => {
			const actionsArray = row.original.actions as SocialAction[];
			return actionsArray.filter((action: SocialAction) => {
				if (platform === "LinkedIn") return action.type.includes("📩");
				if (platform === "Twitter")
					return ["Like", "Follow", "Retweet"].includes(action.type);
				return ["Like", "Follow", "Comment", "👁️ Story"].includes(action.type);
			});
		};
		const data: ExportSocialCampaignRow[] = platforms.flatMap((platform) =>
			filterActionsByPlatform(platform).map(
				(action: SocialAction, idx: number) => ({
					id: `${row.original.name}-${platform}-${idx}`,
					name: row.original.name,
					platform: platform as
						| "LinkedIn"
						| "Twitter"
						| "Instagram"
						| "Facebook",
					senderHandle: row.original.senderHandle,
					receiverHandle: row.original.senderHandle, // ! Using senderHandle as a placeholder; replace with actual receiver if available
					hashtags: [], // ! Placeholder empty array; replace with actual hashtags if available
					startDate: row.original.startDate,
					endDate: row.original.endDate,
					status: row.original.status,
					createdAt: new Date().toISOString(), // ! Using current date as a placeholder
					actions: `${action.type} (Attempts: ${action.attempt}, Successes: ${action.successful}, Failures: ${action.failed}, Status: ${action.status}, View: ${action.viewLink})`,
				}),
			),
		);
		// * Cast as any[] for export utility (safe: only object shape matters for Excel)
		exportSocialTableBulkToExcel(
			"Social Campaign",
			"social",
			columns,
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			data as any[],
			`${row.original.name}-campaign.xlsx`,
		);
	};
	return (
		<button
			type="button"
			className="text-blue-500 hover:underline"
			onClick={handleDownload}
		>
			Download Excel
		</button>
	);
};

export default DownloadCell;
