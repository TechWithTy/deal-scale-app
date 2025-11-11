"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { TeamMember } from "@/types/userProfile";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "external/shadcn-table/src/components/data-table/data-table-column-header";
import { CellAction } from "./cell-action"; // Assuming you have a cell-action component

// Columns definition for TeamMember
export const columns: ColumnDef<TeamMember>[] = [
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
		accessorKey: "firstName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="First Name" />
		),
		enableSorting: true,
	},
	{
		accessorKey: "lastName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Last Name" />
		),
		enableSorting: true,
	},
	{
		accessorKey: "email",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Email" />
		),
		enableSorting: true,
	},
	{
		accessorKey: "phone",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Phone" />
		),
		cell: ({ row }) => <span>{row.original.phone ?? ""}</span>,
		enableSorting: true,
	},
	{
		accessorKey: "role",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Role" />
		),
		enableSorting: true,
	},
	{
		accessorKey: "permissions.canGenerateLeads",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Can Generate Leads" />
		),
		cell: ({ row }) => (
			<span>{row.original.permissions.canGenerateLeads ? "Yes" : "No"}</span>
		),
		enableSorting: true,
	},
	{
		accessorKey: "permissions.canStartCampaigns",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Can Start Campaigns" />
		),
		cell: ({ row }) => (
			<span>{row.original.permissions.canStartCampaigns ? "Yes" : "No"}</span>
		),
		enableSorting: true,
	},
	{
		accessorKey: "permissions.canManageTeam",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Can Manage Team" />
		),
		cell: ({ row }) => (
			<span>{row.original.permissions.canManageTeam ? "Yes" : "No"}</span>
		),
		enableSorting: true,
	},
	{
		accessorKey: "permissions.canManageSubscription",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Can Manage Subscription" />
		),
		cell: ({ row }) => (
			<span>
				{row.original.permissions.canManageSubscription ? "Yes" : "No"}
			</span>
		),
		enableSorting: true,
	},
	{
		accessorKey: "permissions.canViewReports",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Can View Reports" />
		),
		cell: ({ row }) => (
			<span>{row.original.permissions.canViewReports ? "Yes" : "No"}</span>
		),
		enableSorting: true,
	},
	{
		accessorKey: "permissions.canMoveCompanyTasks",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Can Move Tasks" />
		),
		cell: ({ row }) => (
			<span>{row.original.permissions.canMoveCompanyTasks ? "Yes" : "No"}</span>
		),
		enableSorting: true,
	},
	{
		accessorKey: "permissions.canAccessAI",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Can Access AI" />
		),
		cell: ({ row }) => (
			<span>{row.original.permissions.canAccessAI ? "Yes" : "No"}</span>
		),
		enableSorting: true,
	},
	{
		accessorKey: "permissions.canEditCompanyProfile",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Can Edit Company Profile" />
		),
		cell: ({ row }) => (
			<span>
				{row.original.permissions.canEditCompanyProfile ? "Yes" : "No"}
			</span>
		),
		enableSorting: true,
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<CellAction currentUserRole={"admin"} data={row.original} />
		),
	},
];
