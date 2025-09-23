"use client";

import React from "react";
import type { TeamEvent } from "../utils/events";

type RecentActivityListProps = {
	apiPath: string;
	loading: boolean;
	events: TeamEvent[];
	format: (e: TeamEvent) => string;
};

export default function RecentActivityList({
	apiPath,
	loading,
	events,
	format,
}: RecentActivityListProps) {
	return (
		<div className="rounded-md border">
			<div className="border-b p-3">
				<h3 className="font-semibold text-base">Recent Team Activity</h3>
				<p className="text-muted-foreground text-xs">Fetched from {apiPath}</p>
			</div>
			<div className="divide-y">
				{loading ? (
					<div className="p-3 text-muted-foreground text-sm">Loading…</div>
				) : events.length === 0 ? (
					<div className="p-3 text-muted-foreground text-sm">
						No recent activity
					</div>
				) : (
					events
						.sort(
							(a, b) =>
								new Date(b.timestamp).getTime() -
								new Date(a.timestamp).getTime(),
						)
						.map((e) => (
							<div
								key={e.id}
								className="flex items-center justify-between gap-3 p-3"
							>
								<div className="text-sm">{format(e)}</div>
								<div className="text-muted-foreground text-xs">
									{new Date(e.timestamp).toLocaleString()}
								</div>
							</div>
						))
				)}
			</div>
		</div>
	);
}
