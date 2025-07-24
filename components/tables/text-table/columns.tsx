import { Checkbox } from "@/components/ui/checkbox";
import { exportCampaignMessagesBulkToExcel } from "@/lib/_utils/files/loopDownload/messageExports";
import type {
	GHLTextMessageCampaign,
	TextMessage,
} from "@/types/goHighLevel/text";
import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";

// Color statuses for the text message campaign
// Assuming TextMessageCampaign['status'] includes the following:
type TextMessageCampaignStatus =
	| "delivered"
	| "delivering"
	| "failed"
	| "pending"
	| "completed"
	| "missed"
	| "queued"
	| "read"
	| "unread";

const statusColor: Record<TextMessageCampaignStatus, string> = {
	delivered: "bg-green-200 text-green-700", // Delivered - lighter green for success
	delivering: "bg-yellow-100 text-yellow-600", // Delivering - yellow for in-progress
	failed: "bg-red-100 text-red-600", // Failed - red for errors
	pending: "bg-orange-100 text-orange-600", // Pending - orange for waiting
	completed: "bg-green-100 text-green-600", // Completed - green for success
	missed: "bg-gray-200 text-gray-600", // Missed - gray for neutral status
	queued: "bg-purple-100 text-purple-600", // Queued - purple for waiting in queue
	read: "bg-blue-100 text-blue-600", // Read - blue to indicate action has been completed
	unread: "bg-indigo-100 text-indigo-600", // Unread - indigo for something not seen yet
};

// Functional component for viewing an individual message
export const ViewMessageButton = ({ messageId }: { messageId: string }) => {
	const messageUrl = `https://textprovider.com/view/${messageId}`;

	return (
		<a
			href={messageUrl}
			target="_blank"
			rel="noreferrer"
			className="p-2 text-blue-500"
		>
			<EyeIcon className="h-5 w-5" />
		</a>
	);
};

// Handle message selection to view the message
// const handleMessageSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
//   const messageUrl = event.target.value;
//   if (messageUrl) {
//     window.open(messageUrl, '_blank', 'noopener,noreferrer'); // Open the message in a new tab
//   }
// };

// Columns for the text message campaign table
export const textMessageCampaignColumns: ColumnDef<GHLTextMessageCampaign>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "name",
		header: "Campaign Name",
		cell: ({ row }) => <span className="text-left">{row.original.name}</span>,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const colorClass =
				statusColor[row.original.status] || "bg-gray-100 text-gray-600";
			return (
				<span
					className={`rounded-full px-2 py-1 font-medium text-sm ${colorClass}`}
				>
					{row.original.status}
				</span>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
		cell: ({ row }) => (
			<span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
		),
	},
	{
		accessorKey: "sentCount",
		header: "Sent",
		cell: ({ row }) => <span>{row.original.sentCount}</span>,
	},
	{
		accessorKey: "deliveredCount",
		header: "Delivered",
		cell: ({ row }) => <span>{row.original.deliveredCount}</span>,
	},
	{
		accessorKey: "failedCount",
		header: "Failed",
		cell: ({ row }) => <span>{row.original.failedCount}</span>,
	},
	{
		accessorKey: "totalMessages",
		header: "Total Messages",
		cell: ({ row }) => <span>{row.original.totalMessages}</span>,
	},
	{
		accessorKey: "lastMessageSentAt",
		header: "Last Message Sent",
		cell: ({ row }) => (
			<span>
				{new Date(row.original.lastMessageSentAt).toLocaleDateString()}
			</span>
		),
	},
	{
		accessorKey: "messages",
		header: "Download Messages",
		cell: ({ row }) => {
			// Define the columns for exporting messages with correct keyof TextMessage type
			const messageColumns: {
				header: string;
				accessorKey: keyof TextMessage;
			}[] = [
				{ header: "Message ID", accessorKey: "id" },
				{ header: "Body", accessorKey: "body" }, // Body column
				{ header: "Attachments", accessorKey: "attachments" }, // Attachments column
				{ header: "Type", accessorKey: "messageType" },
				{ header: "Status", accessorKey: "status" },
				{ header: "Direction", accessorKey: "direction" },
				{ header: "Date Added", accessorKey: "dateAdded" },
			];

			// Extract the messages from the campaign
			const messages = row.original.messages as TextMessage[];

			return (
				<div className="flex space-x-2">
					{/* Button to download the messages as an Excel file */}
					<button
						className="p-2 text-blue-500 hover:underline"
						type="button"
						onClick={() => {
							exportCampaignMessagesBulkToExcel(
								`Messages_${row.original.name}`, // Sheet name based on campaign name
								messageColumns, // Columns for the Excel export
								messages, // Pass the messages array from the campaign
								`${row.original.name}_messages.xlsx`, // Filename for the downloaded file
							);
						}}
					>
						Download Messages
					</button>
				</div>
			);
		},
	},
];
