"use client";

import { useMemo, useState } from "react";
import type { ActivityDataPoint, ChartConfigLocal } from "../types";
import {
	filterDataByRange,
	rangeLabel,
	type TimeRangeKey,
} from "../utils/time";
import ActivityLineGraph from "./ActivityLineGraph";

export type LineOption = {
	key: string;
	label?: string;
};

type ActivityLineGraphContainerProps = {
	data: ActivityDataPoint[];
	config: ChartConfigLocal; // all available series and their colors
	defaultLines: string[]; // initial selected series keys
	defaultRange?: TimeRangeKey;
	title?: string;
	description?: string;
};

export default function ActivityLineGraphContainer({
	data,
	config,
	defaultLines,
	defaultRange = "30d",
	title,
	description,
}: ActivityLineGraphContainerProps) {
	const [selectedLines, setSelectedLines] = useState<string[]>(defaultLines);
	const [range, setRange] = useState<TimeRangeKey>(defaultRange);

	const filtered = useMemo(() => filterDataByRange(data, range), [data, range]);

	// available keys = union of config keys and any present in data rows
	const availableKeys = useMemo(() => Object.keys(config), [config]);

	const toggleLine = (key: string) => {
		setSelectedLines((prev) =>
			prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
		);
	};

	return (
		<div className="flex flex-col gap-3">
			{/* Controls */}
			<div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background p-2">
				{/* Quick actions: series toggles */}
				<div className="flex flex-wrap items-center gap-2">
					{availableKeys.map((key) => (
						<button
							key={key}
							type="button"
							onClick={() => toggleLine(key)}
							className={`rounded-md border px-2 py-1 text-xs transition-colors ${
								selectedLines.includes(key)
									? "border-primary bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground hover:bg-accent"
							}`}
							aria-pressed={selectedLines.includes(key)}
						>
							{config[key]?.label ?? key}
						</button>
					))}
				</div>

				{/* Time range select */}
				<div className="flex items-center gap-1">
					<label htmlFor="time-range" className="text-muted-foreground text-xs">
						Time Range
					</label>
					<select
						id="time-range"
						className="rounded-md border bg-background px-2 py-1 text-xs"
						value={range}
						onChange={(e) => setRange(e.target.value as TimeRangeKey)}
					>
						{(
							["24h", "7d", "30d", "quarter", "year", "all"] as TimeRangeKey[]
						).map((key) => (
							<option key={key} value={key}>
								{rangeLabel(key)}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Graph */}
			<ActivityLineGraph
				data={filtered}
				config={config}
				lines={selectedLines}
				title={title}
				description={description}
				showLabels
			/>
		</div>
	);
}
