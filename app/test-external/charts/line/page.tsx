"use client";

import {
	ActivityLineGraphContainer,
	TeamActivityFeed,
} from "../../../../external/activity-graph/components";
import type { ChartConfigLocal } from "../../../../external/activity-graph/types";

function monthsAgoIso(n: number): string {
	const d = new Date();
	d.setMonth(d.getMonth() - n);
	d.setDate(1);
	d.setHours(0, 0, 0, 0);
	return d.toISOString();
}

const dataMulti = [
	{ timestamp: monthsAgoIso(5), desktop: 186, mobile: 80 },
	{ timestamp: monthsAgoIso(4), desktop: 305, mobile: 200 },
	{ timestamp: monthsAgoIso(3), desktop: 237, mobile: 120 },
	{ timestamp: monthsAgoIso(2), desktop: 73, mobile: 190 },
	{ timestamp: monthsAgoIso(1), desktop: 209, mobile: 130 },
	{ timestamp: monthsAgoIso(0), desktop: 214, mobile: 140 },
];

const configMulti: ChartConfigLocal = {
	desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
	mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
};

const dataBrowsers = [
	{ timestamp: monthsAgoIso(5), chrome: 275 },
	{ timestamp: monthsAgoIso(4), chrome: 200 },
	{ timestamp: monthsAgoIso(3), chrome: 187 },
	{ timestamp: monthsAgoIso(2), chrome: 173 },
	{ timestamp: monthsAgoIso(1), chrome: 190 },
	{ timestamp: monthsAgoIso(0), chrome: 210 },
];

const configBrowsers: ChartConfigLocal = {
	chrome: { label: "Chrome", color: "hsl(var(--chart-3))" },
};

export default function ChartsLineDemoPage() {
	return (
		<div className="container mx-auto flex max-w-5xl flex-col gap-10 p-6">
			{/* Team activity feed demo (Owner/Admin view) */}
			<section className="space-y-2">
				<h2 className="font-semibold text-xl">Team Activity</h2>
				<p className="text-muted-foreground text-sm">
					As an Owner/Admin, view a team-wide activity feed to monitor usage.
				</p>
				<TeamActivityFeed
					permissions={{ ManageTeam: true, ViewReports: true }}
					apiPath="/api/v1/team/activity"
					days={14}
				/>
			</section>

			<section className="space-y-2">
				<h2 className="font-semibold text-xl">Line Chart - Multiple</h2>
				<p className="text-muted-foreground text-sm">January - June 2024</p>
				<ActivityLineGraphContainer
					data={dataMulti}
					config={configMulti}
					defaultLines={["desktop", "mobile"]}
					defaultRange="30d"
					title="Activity (Desktop vs Mobile)"
					description="Toggle lines and change time range"
				/>
			</section>

			<section className="space-y-2">
				<h2 className="font-semibold text-xl">Line Chart - Custom Label</h2>
				<p className="text-muted-foreground text-sm">January - June 2024</p>
				<ActivityLineGraphContainer
					data={dataBrowsers}
					config={configBrowsers}
					defaultLines={["chrome"]}
					defaultRange="30d"
					title="Visitors by Browser (Chrome)"
					description="Toggle lines and change time range"
				/>
			</section>
		</div>
	);
}
