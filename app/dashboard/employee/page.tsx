"use client"; // Ensure it's a client-side component

import TeamCreditsBanner from "@/components/banners/TeamCreditsBanner";
import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import EmployeeKanbanTable from "@/components/tables/employee-tables/EmployeeKanbanTable";
import InviteEmployeeModal from "@/components/tables/employee-tables/InviteEmployeeModal";
import { TeamWorkspacePanel } from "@/components/tables/employee-tables/TeamWorkspacePanel";
import { columns } from "@/components/tables/employee-tables/columns";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockTeamMembers } from "@/constants/_faker/profile/team/members";
import { usePublicApiTeamMembers } from "@/hooks/usePublicApiTeamMembers";
import { cn } from "@/lib/_utils";
import type { TeamMember } from "@/types/userProfile";
import type { Table as TanstackTable } from "@tanstack/react-table";
import TeamActivityFeed from "external/activity-graph/components/TeamActivityFeed";
import { DataTableViewOptions } from "external/shadcn-table/src/components/data-table/data-table-view-options";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Employee", link: "/dashboard/employee" },
];

export default function EmployeePage({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const [search, setSearch] = useState("");
	const [inviteOpen, setInviteOpen] = useState(false);
	const { data: session } = useSession();
	const fallbackMembers = useMemo(() => mockTeamMembers, []);
	const teamMembers = usePublicApiTeamMembers(
		fallbackMembers,
		session?.publicApi?.accessToken,
	);

	const page = Number(searchParams.page) || 1;
	const pageLimit = Number(searchParams.limit) || 10;
	const totalUsers = teamMembers.members.length;
	const pageCount = Math.max(1, Math.ceil(totalUsers / pageLimit));
	const employees = useMemo(() => {
		const start = (page - 1) * pageLimit;
		return teamMembers.members.slice(start, start + pageLimit);
	}, [page, pageLimit, teamMembers.members]);

	useEffect(() => {
		const openInvite = () => setInviteOpen(true);

		window.addEventListener("tour-open-employee-invite-modal", openInvite);
		return () => {
			window.removeEventListener("tour-open-employee-invite-modal", openInvite);
		};
	}, []);

	return (
		<PageContainer>
			<div className="space-y-4" data-tour="employee-page">
				<Breadcrumbs items={breadcrumbItems} />

				<div
					className="flex w-full flex-col items-center justify-between space-y-5 sm:flex-row sm:items-center sm:space-y-0"
					data-tour="employee-header"
				>
					{/* Heading Component */}
					<div className="w-full text-center sm:w-auto sm:text-left">
						<Heading
							title={`Employee (${totalUsers})`}
							description="Manage employees and team access."
						/>
					</div>

					{/* Add New Button */}
					<div className="flex w-full justify-center sm:w-auto">
						<button
							type="button"
							onClick={() => setInviteOpen(true)}
							className={cn(
								buttonVariants({ variant: "default" }),
								"flex w-full items-center justify-center sm:w-auto",
							)}
							data-tour="employee-invite"
						>
							<Plus className="mr-2 h-4 w-4" /> Add New
						</button>
					</div>
				</div>

				<Separator />

				{/* Team Credits Banner */}
				<TeamCreditsBanner />

				<InviteEmployeeModal
					open={inviteOpen}
					onOpenChange={setInviteOpen}
					token={session?.publicApi?.accessToken}
				/>
				<div className="text-muted-foreground text-xs">
					{teamMembers.source === "live"
						? "Team members synced from public API."
						: teamMembers.source === "error"
							? `Using fallback team members: ${teamMembers.error}`
							: teamMembers.source === "fallback"
								? "Using fallback team members because the public API response was empty."
								: "Using fallback team members until a public API token exists."}
					{teamMembers.isLoading ? " Loading..." : ""}
				</div>

				{/* Tabs: Employees (table) | Activity (line graph) */}
				<Tabs defaultValue="employees">
					<TabsList data-tour="employee-tabs">
						<TabsTrigger value="employees">Employees</TabsTrigger>
						<TabsTrigger value="activity">Activity</TabsTrigger>
					</TabsList>

					<TabsContent value="employees">
						<div data-tour="employee-table">
							<EmployeeKanbanTable
								columns={columns}
								data={employees}
								pageCount={pageCount}
								renderToolbar={({
									table,
									openAI,
									disabled,
									selectedCount,
								}: {
									table: TanstackTable<TeamMember>;
									openAI: () => void;
									disabled: boolean;
									selectedCount: number;
								}) => (
									<div className="mb-3 flex w-full items-end justify-between gap-3">
										<div className="grid gap-1">
											<Label
												htmlFor="employee-search"
												className="text-muted-foreground text-xs"
											>
												Search first name…
											</Label>
											<Input
												id="employee-search"
												placeholder="Search first name…"
												value={search}
												onChange={(e) => {
													setSearch(e.target.value);
													table
														.getColumn("firstName")
														?.setFilterValue(e.target.value);
												}}
												className="h-8 w-[220px]"
											/>
										</div>
										<div className="flex items-center gap-2">
											<DataTableViewOptions table={table} />
											<Button size="sm" onClick={openAI} disabled={disabled}>
												AI Actions{" "}
												{selectedCount > 0 ? `(${selectedCount})` : ""}
											</Button>
										</div>
									</div>
								)}
							/>
						</div>
					</TabsContent>

					<TabsContent value="activity">
						<div className="mt-3 space-y-4" data-tour="employee-activity">
							<TeamWorkspacePanel token={session?.publicApi?.accessToken} />
							<TeamActivityFeed
								permissions={{ ViewReports: true, ManageTeam: true }}
							/>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</PageContainer>
	);
}
