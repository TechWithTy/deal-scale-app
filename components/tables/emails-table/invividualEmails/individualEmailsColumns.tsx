import type { GetEmailByIdResponse } from "@/types/goHighLevel/email";
import type { ColumnDef } from "@tanstack/react-table";
import { DownloadIcon } from "lucide-react";
import React from "react";

// Helper function to download email content
const downloadEmailContent = (email: GetEmailByIdResponse) => {
	const emailContent = email.body || "No content available";
	const blob = new Blob([emailContent], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `email-${email.id}.txt`; // Naming the file with email id
	a.click();
	URL.revokeObjectURL(url); // Clean up the URL
};

// Column definition for displaying emails
export const emailColumns: ColumnDef<GetEmailByIdResponse>[] = [
	{
		accessorKey: "subject",
		header: "Subject",
		cell: ({ row }) => row.original.subject || "No Subject", // Default if no subject
	},
	{
		accessorKey: "from",
		header: "Sender",
		cell: ({ row }) => row.original.from,
	},
	{
		accessorKey: "to",
		header: "Recipients",
		cell: ({ row }) => row.original.to.join(", "), // Join the recipient list into a string
	},
	{
		accessorKey: "status",
		header: () => <div className="text-center">Status</div>,
		cell: ({ row }) => row.original.status,
	},
	{
		accessorKey: "dateAdded",
		header: () => <div className="text-center">Date Added</div>,
		cell: ({ row }) => new Date(row.original.dateAdded).toLocaleString(),
	},
	{
		accessorKey: "provider",
		header: () => <div className="text-center">Provider</div>,
		cell: ({ row }) => row.original.provider,
	},
	{
		accessorKey: "attachments",
		header: () => <div className="text-center">Attachments</div>,
		cell: ({ row }) =>
			row.original.attachments && row.original.attachments.length > 0
				? row.original.attachments.map((attachment, index) => (
						<a
							key={attachment}
							href={attachment}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-500 underline"
						>
							Attachment {index + 1}
						</a>
					))
				: "No Attachments",
	},
	{
		// Action for downloading the email body content
		accessorKey: "body",
		header: () => <div className="text-center">Download Email</div>,
		cell: ({ row }) => (
			<button
				type="button"
				onClick={() => downloadEmailContent(row.original)}
				className="flex items-center space-x-1 text-blue-500 hover:underline"
			>
				<DownloadIcon className="h-4 w-4" />
				<span>Download</span>
			</button>
		),
	},
];
