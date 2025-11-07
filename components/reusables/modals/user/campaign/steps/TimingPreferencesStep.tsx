import { Calendar } from "@/components/ui/calendar";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import Holidays from "date-holidays";
import React, { useState } from "react";

interface TimingPreferencesStepProps {
	onBack: () => void;
	onNext: () => void;
}

export function TimingPreferencesStep({
	onBack,
	onNext,
}: TimingPreferencesStepProps) {
	const {
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		reachBeforeBusiness,
		setReachBeforeBusiness,
		reachAfterBusiness,
		setReachAfterBusiness,
		reachOnWeekend,
		setReachOnWeekend,
		reachOnHolidays,
		setReachOnHolidays,
		countVoicemailAsAnswered,
		setCountVoicemailAsAnswered,
	} = useCampaignCreationStore();
	const [dateError, setDateError] = useState("");

	// Initialize holidays for default country (US)
	const hd = new Holidays("US");

	const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
	const isHoliday = (date: Date) => Boolean(hd.isHoliday(date));

	const handleDateSelection = (
		range: { from?: Date; to?: Date } | undefined,
	) => {
		// Clear previous errors
		setDateError("");

		// If no range is provided, clear the dates and show error
		if (!range) {
			setStartDate(new Date());
			setEndDate(null);
			setDateError("Please select both a start and end date.");
			return;
		}

		const { from, to } = range;

		// If either date is missing, show error but don't update the dates
		if (!from || !to) {
			setDateError("Please select both a start and end date.");
			return;
		}

		// Create new Date objects to ensure we're working with fresh instances
		const fromDate = new Date(from);
		const toDate = new Date(to);

		// Ensure the end date is not before the start date
		if (fromDate > toDate) {
			setDateError("End date must be on or after the start date.");
			return;
		}

		// If weekends/holidays are not allowed, validate the endpoints
		if (!reachOnWeekend && (isWeekend(fromDate) || isWeekend(toDate))) {
			setDateError(
				"Selected range cannot start or end on a weekend when weekend outreach is disabled.",
			);
			return;
		}
		if (!reachOnHolidays && (isHoliday(fromDate) || isHoliday(toDate))) {
			setDateError(
				"Selected range cannot start or end on a holiday when holiday outreach is disabled.",
			);
			return;
		}

		// Only update the dates if all validations pass
		setStartDate(fromDate);
		setEndDate(toDate);
	};

	// Ensure the next button is only enabled when we have valid start and end dates
	const isNextEnabled = Boolean(
		startDate && endDate && !dateError && startDate <= endDate,
	);

	const handleNextClick = () => {
		if (!isNextEnabled) {
			setDateError(
				"Please select both a start and end date before continuing.",
			);
			return;
		}
		onNext();
	};

	return (
		<div className="text-center">
			<h2 className="mb-4 font-semibold text-lg dark:text-white">
				Timing Preferences
			</h2>
			<div className="mb-4 flex flex-col items-center gap-2 text-center">
				<label
					htmlFor="dateRange"
					className="mb-1 w-full text-center font-medium text-sm dark:text-white"
				>
					When should we reach out?
				</label>
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={reachBeforeBusiness}
						onChange={() => setReachBeforeBusiness(!reachBeforeBusiness)}
					/>
					<span>Reach out before business hours</span>
				</label>
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={reachAfterBusiness}
						onChange={() => setReachAfterBusiness(!reachAfterBusiness)}
					/>
					<span>Reach out after business hours</span>
				</label>
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={reachOnWeekend}
						onChange={() => setReachOnWeekend(!reachOnWeekend)}
					/>
					<span>Reach out on weekends</span>
				</label>
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={reachOnHolidays}
						onChange={() => setReachOnHolidays(!reachOnHolidays)}
					/>
					<span>Reach out on holidays</span>
				</label>
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={countVoicemailAsAnswered}
						onChange={() =>
							setCountVoicemailAsAnswered(!countVoicemailAsAnswered)
						}
					/>
					<span>Count voicemail as answered</span>
				</label>
			</div>
			<label
				htmlFor="dateRange"
				className="mb-1 block text-center font-bold text-sm dark:text-white"
			>
				Select Start Date And End Date
			</label>
			<div className="mb-4 flex justify-center">
				<Calendar
					mode="range"
					selected={{
						from: startDate,
						to: endDate ?? undefined,
					}}
					onSelect={handleDateSelection}
					numberOfMonths={2}
					fromDate={new Date()}
					orientation="horizontal"
					// Disable weekends/holidays according to preferences
					disabled={(date) => {
						const weekendDisabled = !reachOnWeekend && isWeekend(date);
						const holidayDisabled = !reachOnHolidays && isHoliday(date);
						return weekendDisabled || holidayDisabled;
					}}
				/>
			</div>
			{/* Debug: Show skipped dates within selected range */}
			{startDate && endDate && (
				<div className="mx-auto max-w-md text-left text-muted-foreground text-xs">
					{(() => {
						const skipped: string[] = [];
						const d = new Date(startDate);
						while (d <= (endDate as Date)) {
							if (
								(!reachOnWeekend && isWeekend(d)) ||
								(!reachOnHolidays && isHoliday(d))
							) {
								skipped.push(new Date(d).toISOString().slice(0, 10));
							}
							d.setDate(d.getDate() + 1);
						}
						// Log for debugging
						if (skipped.length) {
							// eslint-disable-next-line no-console
							console.debug("Skipped dates (weekends/holidays):", skipped);
						}
						return skipped.length ? (
							<p>
								Skipping {skipped.length} day(s): {skipped.join(", ")}
							</p>
						) : null;
					})()}
				</div>
			)}
			{dateError && <p className="text-red-500">{dateError}</p>}
			<div className="mt-8 flex justify-between gap-2">
				<button
					type="button"
					className="rounded border bg-gray-100 px-4 py-2 hover:bg-gray-200"
					onClick={onBack}
				>
					Back
				</button>
				<button
					type="button"
					className="rounded bg-primary px-4 py-2 text-white disabled:bg-gray-300"
					disabled={!isNextEnabled}
					onClick={handleNextClick}
				>
					Next
				</button>
			</div>
		</div>
	);
}
