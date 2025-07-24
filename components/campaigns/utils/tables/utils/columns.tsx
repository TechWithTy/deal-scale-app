import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Fixed import path for dropdown-menu from shadcn/ui
import type {
	CallCampaign,
	SocialMediaCampaign,
} from "@/types/_dashboard/campaign";
import type { EmailCampaign } from "@/types/goHighLevel/email";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { v4 as uuid } from "uuid";

// Define the column configuration for SocialMediaCampaign
export const socialMediaColumns: ColumnDef<SocialMediaCampaign>[] = [
	{
		accessorKey: "platform",
		header: () => <div className="text-center">Platform</div>,
		cell: ({ row }) => (
			<div className="text-center">{row.getValue("platform") as string}</div>
		),
	},
	{
		accessorKey: "senderHandle",
		header: () => <div className="text-center">Sender</div>,
		cell: ({ row }) => (
			<div className="text-center">
				{row.getValue("senderHandle") as string}
			</div>
		),
	},
	{
		accessorKey: "receiverHandle",
		header: () => <div className="text-center">Receiver</div>,
		cell: ({ row }) => (
			<div className="text-center">
				{row.getValue("receiverHandle") as string}
			</div>
		),
	},
	{
		accessorKey: "hashtags",
		header: () => <div className="text-center">Hashtags</div>,
		cell: ({ row }) => {
			const hashtags = row.getValue("hashtags") as string[]; // Cast to string[]
			return <div className="text-center">{hashtags.join(", ")}</div>;
		},
	},
	{
		accessorKey: "sentAt",
		header: () => (
			<Button variant="ghost">
				Sent At
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="text-center">
				{(row.getValue("sentAt") as Date).toLocaleString()}
			</div>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<div className="text-center">{row.getValue("status") as string}</div>
		),
	},
	{
		accessorKey: "actions",
		header: "Actions",
		cell: ({ row }) => {
			const actions = row.getValue("actions") as Array<{
				type: string;
				status: "pending" | "successful" | "failed";
			}>;

			return (
				<div className="text-center">
					{actions.map((action) => (
						<div key={uuid()}>
							{action.type} - {action.status}
						</div>
					))}
				</div>
			);
		},
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => {
			const campaign = row.original;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => navigator.clipboard.writeText(campaign.id)}
						>
							Copy Campaign ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>View Campaign</DropdownMenuItem>
						<DropdownMenuItem>View Actions</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

// Define the column configuration for EmailCampaign
export const emailColumns: ColumnDef<EmailCampaign>[] = [
	{
		accessorKey: "fromEmail",
		header: () => <div className="text-center">From</div>,
		cell: ({ row }) => (
			<div className="text-center">{row.getValue("fromEmail") as string}</div>
		),
	},
	{
		accessorKey: "toEmail",
		header: () => <div className="text-center">To</div>,
		cell: ({ row }) => (
			<div className="text-center">{row.getValue("toEmail") as string}</div>
		),
	},
	{
		accessorKey: "subject",
		header: () => <div className="text-center">Subject</div>,
		cell: ({ row }) => (
			<div className="text-center">{row.getValue("subject") as string}</div>
		),
	},
	{
		accessorKey: "body",
		header: () => <div className="text-center">Body</div>,
		cell: ({ row }) => (
			<div className="text-center">{row.getValue("body") as string}</div>
		),
	},
	{
		accessorKey: "sentAt",
		header: () => (
			<Button variant="ghost">
				Sent At
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="text-center">
				{(row.getValue("sentAt") as Date).toLocaleString()}
			</div>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<div className="text-center">{row.getValue("status") as string}</div>
		),
	},
];

// Define the column configuration for CallCampaign
export const callColumns: ColumnDef<CallCampaign>[] = [
	{
		accessorKey: "callerNumber",
		header: () => <div className="text-center">Caller</div>,
		cell: ({ row }) => (
			<div className="text-center">
				{row.getValue("callerNumber") as string}
			</div>
		),
	},
	{
		accessorKey: "receiverNumber",
		header: () => <div className="text-center">Receiver</div>,
		cell: ({ row }) => (
			<div className="text-center">
				{row.getValue("receiverNumber") as string}
			</div>
		),
	},
	{
		accessorKey: "duration",
		header: () => <div className="text-center">Duration</div>,
		cell: ({ row }) => (
			<div className="text-center">
				{row.getValue("duration") as number} seconds
			</div>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<div className="text-center">{row.getValue("status") as string}</div>
		),
	},
	{
		accessorKey: "timestamp",
		header: () => (
			<Button variant="ghost">
				Timestamp
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="text-center">
				{(row.getValue("timestamp") as Date).toLocaleString()}
			</div>
		),
	},
];
