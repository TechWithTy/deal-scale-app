"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { exportLeadListsToExcel } from "@/lib/_utils/files/loopDownload/leadExports";
import type { LeadList } from "@/types/_dashboard/leadList";
import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import SkipTraceDialog from "./utils/skipLeadsList"; // Assuming SkipTraceDialog component is in utils

// Columns configuration for LeadList
export const columns: ColumnDef<LeadList>[] = [
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
		accessorKey: "listName",
		header: "List",
		cell: ({ row }) => <span>{row.original.listName}</span>,
	},
	{
		accessorKey: "uploadDate",
		header: "Upload Date",
		cell: ({ row }) => <span>{row.original.uploadDate}</span>,
	},
	{
		accessorKey: "records",
		header: "Records",
		cell: ({ row }) => <span>{row.original.records}</span>,
	},
	{
		accessorKey: "phone",
		header: "Phone",
		cell: ({ row }) => <span>{row.original.phone}</span>,
	},
	{
		accessorKey: "emails",
		header: "Emails",
		cell: ({ row }) => <span>{row.original.emails}</span>, // Added emails column
	},
	{
		accessorKey: "socials",
		header: "Socials",
		cell: ({ row }) => (
			<div className="flex flex-col space-y-1">
				<span>Facebook: {row.original.socials.facebook}</span>
				<span>LinkedIn: {row.original.socials.linkedin}</span>
				<span>Instagram: {row.original.socials.instagram}</span>
				<span>Twitter: {row.original.socials.twitter}</span>
			</div>
		), // Added socials column
	},
	{
		accessorKey: "export",
		header: "Export to Excel",
		cell: ({ row }) => (
			<button
				type="button"
				className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
				onClick={async (e) => {
					e.preventDefault();
					const leadList = row.original;
					const excelBuffer = await exportLeadListsToExcel(
						[leadList],
						`${leadList.listName}.xlsx`,
					);
					const blob = new Blob([excelBuffer], {
						type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					});
					const url = window.URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.style.display = "none";
					a.href = url;
					a.download = `${leadList.listName}.xlsx`;
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					setTimeout(() => window.URL.revokeObjectURL(url), 100);
				}}
				aria-label={`Export ${row.original.listName} to Excel`}
			>
				<Download className="h-5 w-5 text-gray-600 dark:text-gray-400" />
			</button>
		),
	},
	{
		id: "createLead",
		header: "Create Lead",
		cell: ({ row }) => (
			<div className="flex justify-center">
				<SkipTraceDialog
					leads={row.original.leads} // Pass properties to the modal (replace with the correct prop)
					costPerRecord={0.1} // Example cost per record, you can change as needed
				/>{" "}
				{/* Render the modal trigger here */}
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
];
