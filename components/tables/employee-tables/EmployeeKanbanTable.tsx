"use client";
import type { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { DataTable } from "@/external/shadcn-table/src/components/data-table/data-table";
import { useDataTable } from "@/external/shadcn-table/src/hooks/use-data-table";
import type { TeamMember } from "@/types/userProfile";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AIActionsModal } from "@/components/tables/employee-tables/ai-actions-modal";
import EmployeeRowModal from "./EmployeeRowModal";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EmployeeKanbanTableProps {
	columns: ColumnDef<TeamMember, unknown>[];
	data: TeamMember[];
	pageCount: number;
	renderToolbar?: (ctx: {
		table: TanstackTable<TeamMember>;
		openAI: () => void;
		selectedCount: number;
		disabled: boolean;
	}) => ReactNode;
}

export default function EmployeeKanbanTable({
	columns,
	data,
	pageCount,
	renderToolbar,
}: EmployeeKanbanTableProps) {
	const [aiOpen, setAiOpen] = useState(false);
	const [rowOpen, setRowOpen] = useState(false);
	const [current, setCurrent] = useState<TeamMember | null>(null);
	const [suspendUser, setSuspendUser] = useState<TeamMember | null>(null);
	const [isSuspendConfirmOpen, setIsSuspendConfirmOpen] = useState(false);

	const table = useDataTable<TeamMember>({
		data,
		columns,
		pageCount,
		// Start with common defaults; URL state handled by the hook
		initialState: {
			pagination: { pageIndex: 0, pageSize: 10 },
			columnVisibility: {},
		},
		// Disable external global columns (DNC, Agent, Goal, Timing, etc.)
		disableGlobalColumns: true,
	});

	return (
		<div className="flex w-full flex-col gap-3">
			{renderToolbar
				? renderToolbar({
						table: table.table,
						openAI: () => setAiOpen(true),
						selectedCount:
							table.table.getFilteredSelectedRowModel().rows.length,
						disabled:
							table.table.getFilteredSelectedRowModel().rows.length === 0,
					})
				: null}
			<DataTable
				table={table.table}
				onRowClick={(row) => {
					const original = row.original as TeamMember;
					setCurrent(original);
					setRowOpen(true);
				}}
				actionBar={(() => {
					const selected = table.table.getFilteredSelectedRowModel().rows;
					const disabled = selected.length === 0;
					return (
						<div className="flex items-center justify-between">
							<div className="text-muted-foreground text-sm">
								{selected.length} selected
							</div>
							<div className="flex gap-2">
								<Button
									size="sm"
									disabled={disabled}
									onClick={() => setAiOpen(true)}
								>
									AI Actions
								</Button>
								<Button
									size="sm"
									disabled={disabled}
									onClick={() => {
										const original = selected[0].original as TeamMember;
										setSuspendUser(original);
										setIsSuspendConfirmOpen(true);
									}}
								>
									Suspend
								</Button>
							</div>
						</div>
					);
				})()}
			/>
			<AIActionsModal
				open={aiOpen}
				onOpenChange={setAiOpen}
				selected={(table.table.getFilteredSelectedRowModel().rows ?? []).map(
					(r) => r.original,
				)}
			/>
			<EmployeeRowModal
				open={rowOpen}
				onOpenChange={setRowOpen}
				member={current}
			/>
			<AlertDialog
				open={isSuspendConfirmOpen}
				onOpenChange={setIsSuspendConfirmOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Suspend User</AlertDialogTitle>
					</AlertDialogHeader>
					<div className="py-4">
						<p className="text-muted-foreground text-sm">
							Are you sure you want to suspend {suspendUser?.firstName}{" "}
							{suspendUser?.lastName}?
						</p>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (suspendUser) {
									// Call suspend API here
									console.log("Suspending user:", suspendUser.id);
									// Update user status
									// Close modal
									setIsSuspendConfirmOpen(false);
								}
							}}
						>
							Suspend
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
