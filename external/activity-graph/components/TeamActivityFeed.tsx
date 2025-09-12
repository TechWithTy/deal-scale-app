"use client";

import { useEffect, useMemo, useState } from "react";
import type { PermissionSet } from "../utils/permissions";
import { hasPermission } from "../utils/permissions";
import ActivityLineGraph from "./ActivityLineGraph";
import MemberChips from "./MemberChips";
import {
	filterDataByRange,
	rangeLabel,
	daysForRange,
	type TimeRangeKey,
} from "../utils/time";
import {
	buildComparativeSeries,
	formatEvent,
	fetchTeamEvents,
	type TeamEvent,
} from "../utils/events";
import RecentActivityList from "./RecentActivityList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { columns as employeeColumns } from "@/components/tables/employee-tables/columns";
import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import type { TeamMember } from "@/types/userProfile";
import { DataTableViewOptions } from "@/external/shadcn-table/src/components/data-table/data-table-view-options";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Table as TanstackTable } from "@tanstack/react-table";
import EmployeeKanbanTable from "@/components/tables/employee-tables/EmployeeKanbanTable";

type TeamActivityFeedProps = {
	apiPath?: string; // default /api/v1/team/activity
	permissions: PermissionSet;
	days?: number; // for mini graph aggregation window
};

export default function TeamActivityFeed({
	apiPath = "/api/v1/team/activity",
	permissions,
	days = 14,
}: TeamActivityFeedProps) {
	const canView =
		hasPermission(permissions, "ManageTeam") ||
		hasPermission(permissions, "ViewReports");
	const [events, setEvents] = useState<TeamEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [range, setRange] = useState<TimeRangeKey>("30d");
	const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
	const [empSearch, setEmpSearch] = useState("");

	useEffect(() => {
		let isMounted = true;
		async function run() {
			const data = await fetchTeamEvents(apiPath);
			if (isMounted) setEvents(data);
			if (isMounted) setLoading(false);
		}
		if (canView) run();
		return () => {
			isMounted = false;
		};
	}, [apiPath, canView]);

	const members = useMemo(
		() => Array.from(new Set(events.map((e) => e.userName))).sort(),
		[events],
	);

	const filteredByRange = useMemo(
		() => filterDataByRange(events, range),
		[events, range],
	);
	const filtered = useMemo(
		() =>
			selectedMembers.length === 0
				? filteredByRange
				: filteredByRange.filter((e) => selectedMembers.includes(e.userName)),
		[filteredByRange, selectedMembers],
	);

	const rangeDays = useMemo(() => daysForRange(range, days), [range, days]);

	const mini = useMemo(
		() => buildComparativeSeries(filtered, selectedMembers, rangeDays),
		[filtered, selectedMembers, rangeDays],
	);

	if (!canView) {
		return (
			<div className="rounded-md border p-4 text-muted-foreground text-sm">
				You do not have permission to view team activity.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<Tabs defaultValue="activity">
				<TabsList>
					<TabsTrigger value="activity">Activity</TabsTrigger>
					<TabsTrigger value="employees">Employees Activity</TabsTrigger>
				</TabsList>

				<TabsContent value="activity">
					<div className="flex items-center justify-between gap-2">
						<MemberChips
							members={members}
							selected={selectedMembers}
							onToggle={(name) =>
								setSelectedMembers((prev) =>
									prev.includes(name)
										? prev.filter((n) => n !== name)
										: [...prev, name],
								)
							}
							colorByKey={(name, idx) =>
								mini.config[name]?.color || `hsl(var(--chart-${(idx % 5) + 1}))`
							}
						/>
						<div className="flex items-center gap-1">
							<label
								htmlFor="team-range"
								className="text-muted-foreground text-xs"
							>
								Time Range
							</label>
							<select
								id="team-range"
								className="rounded-md border bg-background px-2 py-1 text-xs"
								value={range}
								onChange={(e) => setRange(e.target.value as TimeRangeKey)}
							>
								{(
									[
										"24h",
										"7d",
										"30d",
										"quarter",
										"year",
										"all",
									] as TimeRangeKey[]
								).map((key) => (
									<option key={key} value={key}>
										{rangeLabel(key)}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="mt-3 rounded-md border p-3">
						<ActivityLineGraph
							data={mini.data}
							config={mini.config}
							lines={mini.lines}
							title="Team Activity (Events)"
							description={`${rangeLabel(range)}`}
						/>
					</div>

					<RecentActivityList
						apiPath={apiPath}
						loading={loading}
						events={filtered}
						format={formatEvent}
					/>
				</TabsContent>

				<TabsContent value="employees">
					<div className="mt-2">
						<EmployeeKanbanTable
							columns={employeeColumns}
							data={(mockUserProfile?.teamMembers ?? []) as TeamMember[]}
							pageCount={1}
							renderToolbar={({ table, openAI, selectedCount, disabled }) => (
								<div className="mb-3 flex w-full items-end justify-between gap-3">
									<div className="grid gap-1">
										<Label
											htmlFor="employee-tab-search"
											className="text-muted-foreground text-xs"
										>
											Search first name…
										</Label>
										<Input
											id="employee-tab-search"
											placeholder="Search first name…"
											value={empSearch}
											onChange={(e) => {
												setEmpSearch(e.target.value);
												table
													.getColumn("firstName")
													?.setFilterValue(e.target.value);
											}}
											className="h-8 w-[220px]"
										/>
									</div>
									<DataTableViewOptions table={table} />
								</div>
							)}
						/>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
