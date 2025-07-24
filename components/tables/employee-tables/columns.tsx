"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { TeamMember } from "@/types/userProfile";
import type { ColumnDef } from "@tanstack/react-table";
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
		header: "First Name",
	},
	{
		accessorKey: "lastName",
		header: "Last Name",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "role",
		header: "Role",
	},
	{
		accessorKey: "permissions.canGenerateLeads",
		header: "Can Generate Leads",
		cell: ({ row }) => (
			<span>{row.original.permissions.canGenerateLeads ? "Yes" : "No"}</span>
		),
	},
	{
		accessorKey: "permissions.canManageTeam",
		header: "Can Manage Team",
		cell: ({ row }) => (
			<span>{row.original.permissions.canManageTeam ? "Yes" : "No"}</span>
		),
	},
	{
		accessorKey: "permissions.canViewReports",
		header: "Can View Reports",
		cell: ({ row }) => (
			<span>{row.original.permissions.canViewReports ? "Yes" : "No"}</span>
		),
	},
	{
		accessorKey: "permissions.canMoveCompanyTasks",
		header: "Can Move Tasks",
		cell: ({ row }) => (
			<span>{row.original.permissions.canMoveCompanyTasks ? "Yes" : "No"}</span>
		),
	},
	{
		accessorKey: "permissions.canAccessAI",
		header: "Can Access AI",
		cell: ({ row }) => (
			<span>{row.original.permissions.canAccessAI ? "Yes" : "No"}</span>
		),
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<CellAction currentUserRole={"admin"} data={row.original} />
		),
	},
];
