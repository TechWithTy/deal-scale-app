import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type CampaignRunDay,
	type CampaignScheduleMode,
	useCampaignCreationStore,
} from "@/lib/stores/campaignCreation";
import Holidays from "date-holidays";
import React from "react";

const RUN_DAY_LABELS: Record<CampaignRunDay, string> = {
	monday: "Monday",
	tuesday: "Tuesday",
	wednesday: "Wednesday",
	thursday: "Thursday",
	friday: "Friday",
	saturday: "Saturday",
	sunday: "Sunday",
};

const DAY_TO_RUN_DAY: Record<number, CampaignRunDay> = {
	0: "sunday",
	1: "monday",
	2: "tuesday",
	3: "wednesday",
	4: "thursday",
	5: "friday",
	6: "saturday",
};

function formatDate(value?: Date | null) {
	return value ? value.toLocaleDateString() : "";
}

function formatDateList(dates: Date[]) {
	if (dates.length === 0) {
		return "Select dates on the calendar";
	}

	return dates
		.slice()
		.sort((a, b) => a.getTime() - b.getTime())
		.map((date) => date.toLocaleDateString())
		.join(", ");
}

function uniqueRunDaysFromDates(dates: Date[]) {
	return Array.from(
		new Set(
			dates
				.map((date) => DAY_TO_RUN_DAY[date.getDay()])
				.filter((day): day is CampaignRunDay => Boolean(day)),
		),
	);
}

export function CampaignSchedulePlanner() {
	const {
		scheduleMode,
		setScheduleMode,
		selectedRunDays,
		setSelectedRunDays,
		selectedRunDates,
		setSelectedRunDates,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		reachOnWeekend,
		reachOnHolidays,
		primaryChannel,
	} = useCampaignCreationStore();
	const holidays = React.useMemo(() => new Holidays("US"), []);

	const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
	const isHoliday = (date: Date) => Boolean(holidays.isHoliday(date));
	const isDateDisabled = (date: Date) =>
		(!reachOnWeekend && isWeekend(date)) ||
		(!reachOnHolidays && isHoliday(date));

	const handleScheduleModeChange = (value: string) => {
		const nextMode = value as CampaignScheduleMode;
		setScheduleMode(nextMode);
		if (nextMode === "date-range" && selectedRunDates.length > 0) {
			setSelectedRunDates([]);
		}
	};

	const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
		if (!range?.from) {
			setEndDate(null);
			return;
		}

		setStartDate(new Date(range.from));
		setEndDate(range.to ? new Date(range.to) : null);
	};

	const handleSelectedDaysChange = (dates: Date[] | undefined) => {
		const nextDates = (dates ?? [])
			.map((date) => new Date(date))
			.sort((a, b) => a.getTime() - b.getTime());
		setSelectedRunDates(nextDates);
		setSelectedRunDays(uniqueRunDaysFromDates(nextDates));
		setStartDate(nextDates[0] ?? new Date());
		setEndDate(nextDates.at(-1) ?? null);
	};

	const selectedRunDaySummary = selectedRunDays.length
		? selectedRunDays.map((day) => RUN_DAY_LABELS[day]).join(", ")
		: "No run days selected";
	const dateRangeSummary =
		startDate && endDate
			? `${formatDate(startDate)} - ${formatDate(endDate)}`
			: "Select a start and stop date on the calendar";
	const selectedDateSummary = formatDateList(selectedRunDates);
	const isDateRangeMode = scheduleMode === "date-range";
	const isTextChannel = primaryChannel === "text";
	const isInteractionChannel =
		primaryChannel === "linkedin" || primaryChannel === "facebook";
	const scheduleUnit = isInteractionChannel
		? "interaction"
		: isTextChannel
			? "message"
			: "call";

	return (
		<section
			className="rounded-xl border border-border bg-card p-4 text-left shadow-sm"
			data-tour="campaign-schedule-planner"
		>
			<div className="mb-4 flex flex-wrap items-start justify-between gap-3">
				<div>
					<h3 className="font-semibold text-base">
						Campaign {scheduleUnit} schedule
					</h3>
					<p className="text-muted-foreground text-sm">
						Choose a start/stop window or pick exact calendar days for{" "}
						{scheduleUnit}s.
					</p>
				</div>
				<div className="rounded-full border bg-background px-3 py-1 text-muted-foreground text-xs">
					{isDateRangeMode
						? endDate
							? "Date window selected"
							: "Needs stop date"
						: selectedRunDates.length
							? `${selectedRunDates.length} date${selectedRunDates.length === 1 ? "" : "s"} selected`
							: "No dates selected"}
				</div>
			</div>

			<div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
				<div className="space-y-3">
					<div className="space-y-2">
						<Label htmlFor="campaignScheduleMode">Schedule type</Label>
						<Select
							value={scheduleMode}
							onValueChange={handleScheduleModeChange}
						>
							<SelectTrigger
								id="campaignScheduleMode"
								className="bg-background"
							>
								<SelectValue placeholder="Select schedule type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="date-range">Start and stop date</SelectItem>
								<SelectItem value="selected-days">
									Selected calendar days
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="rounded-lg bg-muted/50 p-3 text-sm">
						<p className="font-medium">
							{isDateRangeMode
								? "Run inside selected date range"
								: "Run only on selected calendar days"}
						</p>
						<p className="mt-1 text-muted-foreground">
							{isDateRangeMode ? dateRangeSummary : selectedDateSummary}
						</p>
						{!isDateRangeMode ? (
							<p className="mt-2 text-muted-foreground text-xs">
								Selected weekdays: {selectedRunDaySummary}
							</p>
						) : null}
					</div>
				</div>

				<div className="rounded-lg border border-dashed p-3">
					<Label>
						{isDateRangeMode
							? "Select start and stop date"
							: "Select exact campaign run dates"}
					</Label>
					<div className="mt-3 overflow-x-auto">
						{isDateRangeMode ? (
							<Calendar
								mode="range"
								selected={{
									from: startDate,
									to: endDate ?? undefined,
								}}
								onSelect={handleRangeSelect}
								numberOfMonths={2}
								fromDate={new Date()}
								orientation="horizontal"
								disabled={isDateDisabled}
							/>
						) : (
							<Calendar
								mode="multiple"
								selected={selectedRunDates}
								onSelect={handleSelectedDaysChange}
								numberOfMonths={2}
								fromDate={new Date()}
								orientation="horizontal"
								disabled={isDateDisabled}
							/>
						)}
					</div>
					{isDateRangeMode && !endDate ? (
						<p className="mt-2 text-destructive text-xs">
							Select a stop date before continuing.
						</p>
					) : null}
					{!isDateRangeMode && selectedRunDates.length === 0 ? (
						<p className="mt-2 text-destructive text-xs">
							Select at least one campaign run date.
						</p>
					) : null}
				</div>
			</div>
		</section>
	);
}
