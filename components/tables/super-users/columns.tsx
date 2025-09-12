"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/external/shadcn-table/src/components/data-table/data-table-column-header";
import type { AdminUser } from "./types";
import { CellAction } from "./cell-action";

interface AdminUserTableMeta {
	onView?: (user: AdminUser) => void;
	onAdjustCredits?: (user: AdminUser) => void;
	onEditProfile?: (user: AdminUser) => void;
	onResetPassword?: (user: AdminUser) => void;
	onSuspendUser?: (user: AdminUser) => void;
	onUnsuspendUser?: (user: AdminUser) => void;
	onBanUser?: (user: AdminUser) => void;
}

declare module "@tanstack/react-table" {
	interface TableMeta<TData> extends AdminUserTableMeta {}
}

export const adminUserColumns: ColumnDef<AdminUser>[] = [
	{
		accessorKey: "email",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Email" />
		),
		enableSorting: true,
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
		accessorKey: "role",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Role" />
		),
		enableSorting: true,
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		enableSorting: true,
	},
	{
		accessorKey: "phone",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Phone" />
		),
		enableSorting: true,
	},
	{
		id: "actions",
		cell: ({ row, table }) => {
			const onView = table.options.meta?.onView;
			const onAdjustCredits = table.options.meta?.onAdjustCredits;
			const onEditProfile = table.options.meta?.onEditProfile;
			const onResetPassword = table.options.meta?.onResetPassword;
			const onSuspendUser = table.options.meta?.onSuspendUser;
			const onUnsuspendUser = table.options.meta?.onUnsuspendUser;
			const onBanUser = table.options.meta?.onBanUser;
			return (
				<CellAction
					user={row.original}
					onView={onView}
					onAdjustCredits={onAdjustCredits}
					onEditProfile={onEditProfile}
					onResetPassword={onResetPassword}
					onSuspendUser={onSuspendUser}
					onUnsuspendUser={onUnsuspendUser}
					onBanUser={onBanUser}
				/>
			);
		},
	},
];
