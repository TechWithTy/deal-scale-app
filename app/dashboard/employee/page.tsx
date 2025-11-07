"use client"; // Ensure it's a client-side component

import TeamCreditsBanner from "@/components/banners/TeamCreditsBanner";
import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import EmployeeKanbanTable from "@/components/tables/employee-tables/EmployeeKanbanTable";
import InviteEmployeeModal from "@/components/tables/employee-tables/InviteEmployeeModal";
import { columns } from "@/components/tables/employee-tables/columns";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import { cn } from "@/lib/_utils";
import type { TeamMember, UserProfile } from "@/types/userProfile";
import type { Table as TanstackTable } from "@tanstack/react-table";
import TeamActivityFeed from "external/activity-graph/components/TeamActivityFeed";
import { DataTableViewOptions } from "external/shadcn-table/src/components/data-table/data-table-view-options";
import { HelpCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react"; // Import useState and useEffect for state management
import { z } from "zod";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Employee", link: "/dashboard/employee" },
];

// Simulate server-side data fetching (or you can use getServerSideProps for actual fetching)
async function fetchEmployees(page: number, pageLimit: number) {
	const offset = (page - 1) * pageLimit;
	const res = await fetch(
		`https://api.slingacademy.com/v1/sample-data/users?offset=${offset}&limit=${pageLimit}`,
	);
	// Validate the API response to avoid accessing properties on unknown
	const SlingUsersSchema = z.object({ total_users: z.number() }).passthrough();
	const raw = await res.json().catch(() => ({}));
	const parsed = SlingUsersSchema.safeParse(raw);
	const totalUsers = parsed.success ? parsed.data.total_users : 0;
	// mockUserProfile is now UserProfile | undefined; use directly
	const profile: UserProfile | undefined = mockUserProfile;
	return {
		totalUsers,
		employees: profile?.teamMembers ?? [],
		pageCount: Math.ceil(totalUsers / pageLimit),
	};
}

export default function EmployeePage({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const [totalUsers, setTotalUsers] = useState(0); // Total users state
	const [employees, setEmployees] = useState<TeamMember[]>([]); // Employees state
	const [pageCount, setPageCount] = useState(0); // Page count state
	const [search, setSearch] = useState("");
	const [inviteOpen, setInviteOpen] = useState(false);

	const page = Number(searchParams.page) || 1;
	const pageLimit = Number(searchParams.limit) || 10;

	useEffect(() => {
		// Fetch employees when component mounts or searchParams changes
		const loadEmployees = async () => {
			const { totalUsers, employees, pageCount } = await fetchEmployees(
				page,
				pageLimit,
			);
			setTotalUsers(totalUsers);
			setEmployees(employees);
			setPageCount(pageCount);
		};

		loadEmployees();
	}, [page, pageLimit]);

	return (
		<PageContainer>
			<div className="space-y-4">
				<Breadcrumbs items={breadcrumbItems} />

				<div className="flex w-full flex-col items-center justify-between space-y-5 sm:flex-row sm:items-center sm:space-y-0">
					{/* Heading Component */}
					<div className="w-full text-center sm:w-auto sm:text-left">
						<Heading
							title={`Employee (${totalUsers})`}
							description="Manage employees (Server side table functionalities.)"
						/>
					</div>

					{/* Help Button */}
					<div className="flex w-full justify-center sm:w-auto">
						<button
							type="button"
							onClick={() => {
								if (typeof window !== "undefined") {
									window.dispatchEvent(new Event("dealScale:helpFab:show"));
								}
							}}
							className="my-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							aria-label="Show help and demo"
						>
							<HelpCircle className="h-5 w-5" />
						</button>
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
						>
							<Plus className="mr-2 h-4 w-4" /> Add New
						</button>
					</div>
				</div>

				<Separator />

				{/* Team Credits Banner */}
				<TeamCreditsBanner />

				<InviteEmployeeModal open={inviteOpen} onOpenChange={setInviteOpen} />

				{/* Tabs: Employees (table) | Activity (line graph) */}
				<Tabs defaultValue="employees">
					<TabsList>
						<TabsTrigger value="employees">Employees</TabsTrigger>
						<TabsTrigger value="activity">Activity</TabsTrigger>
					</TabsList>

					<TabsContent value="employees">
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
											AI Actions {selectedCount > 0 ? `(${selectedCount})` : ""}
										</Button>
									</div>
								</div>
							)}
						/>
					</TabsContent>

					<TabsContent value="activity">
						<div className="mt-3">
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
