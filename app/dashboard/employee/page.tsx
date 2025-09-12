"use client"; // Ensure it's a client-side component

import { campaignSteps } from "@/_tests/tours/campaignTour";
import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import WalkThroughModal from "../../../components/leadsSearch/search/WalkthroughModal";
import { DataTableViewOptions } from "@/external/shadcn-table/src/components/data-table/data-table-view-options";
import { columns } from "@/components/tables/employee-tables/columns";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import { cn } from "@/lib/_utils";
import type { TeamMember, UserProfile } from "@/types/userProfile";
import { HelpCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react"; // Import useState and useEffect for state management
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeamActivityFeed from "@/external/activity-graph/components/TeamActivityFeed";
import TeamCreditsBanner from "@/components/banners/TeamCreditsBanner";
import InviteEmployeeModal from "@/components/tables/employee-tables/InviteEmployeeModal";
import type { Table as TanstackTable } from "@tanstack/react-table";
import EmployeeKanbanTable from "@/components/tables/employee-tables/EmployeeKanbanTable";

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
	const employeeRes = await res.json();
	// mockUserProfile is now UserProfile | undefined; use directly
	const profile: UserProfile | undefined = mockUserProfile;
	return {
		totalUsers: employeeRes.total_users,
		employees: profile?.teamMembers ?? [],
		pageCount: Math.ceil(employeeRes.total_users / pageLimit),
	};
}

export default function EmployeePage({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false); // State for help modal
	const [isTourOpen, setIsTourOpen] = useState(false); // State for the tour
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

	// Handlers for help modal and tour
	const handleHelpOpenModal = () => setIsHelpModalOpen(true);
	const handleHelpCloseModal = () => setIsHelpModalOpen(false);
	const handleHelpStartTour = () => setIsTourOpen(true);
	const handleHelpCloseTour = () => setIsTourOpen(false);

	return (
		<PageContainer>
			<div className="space-y-4">
				<Breadcrumbs items={breadcrumbItems} />

				<div className="flex w-full flex-col items-center justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
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
							onClick={handleHelpOpenModal}
							title="Get More help"
							className="animate-bounce rounded-full bg-blue-500 p-2 text-white hover:animate-none dark:bg-green-700 dark:text-gray-300"
						>
							<HelpCircle size={20} />
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

				{/* Help Modal */}
				<WalkThroughModal
					isOpen={isHelpModalOpen}
					onClose={handleHelpCloseModal}
					videoUrl="https://www.youtube.com/embed/example-video" // Example YouTube video URL
					title="Welcome to Employee Management"
					subtitle="Learn how to manage your employees and use the employee table effectively."
					steps={campaignSteps} // Steps for the tour
					isTourOpen={isTourOpen}
					onStartTour={handleHelpStartTour}
					onCloseTour={handleHelpCloseTour}
				/>

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
