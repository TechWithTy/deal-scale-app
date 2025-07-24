import { Calendar } from "@/components/ui/calendar";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useState } from "react";

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
	} = useCampaignCreationStore();
	const [dateError, setDateError] = useState("");

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

		// Ensure the end date is after the start date
		if (fromDate >= toDate) {
			setDateError("End date must be after start date.");
			return;
		}

		// If weekends are not allowed, validate the dates
		if (!reachOnWeekend) {
			const isWeekend = (date: Date) =>
				date.getDay() === 0 || date.getDay() === 6;

			// Check if either date is a weekend
			if (isWeekend(fromDate) || isWeekend(toDate)) {
				setDateError(
					"Selected range cannot include weekends when weekend outreach is disabled.",
				);
				return;
			}
		}

		// Only update the dates if all validations pass
		setStartDate(fromDate);
		setEndDate(toDate);
	};

	// Ensure the next button is only enabled when we have valid start and end dates
	const isNextEnabled = Boolean(
		startDate && endDate && !dateError && startDate < endDate,
	);

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
			</div>
			<label
				htmlFor="dateRange"
				className="mb-1 block text-center font-bold text-sm dark:text-white"
			>
				Select Start Date And End Date
			</label>
			<div className="mb-4 w-full max-w-lg overflow-auto">
				<Calendar
					mode="range"
					selected={{
						from: startDate,
						to: endDate ?? undefined,
					}}
					onSelect={handleDateSelection}
					numberOfMonths={2}
					fromDate={new Date()}
					// ! Disable weekends if not reaching out on weekends
					disabled={
						!reachOnWeekend
							? (date) => {
									const day = date.getDay();
									return day === 0 || day === 6;
								}
							: undefined
					}
				/>
			</div>
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
					onClick={onNext}
				>
					Next
				</button>
			</div>
		</div>
	);
}
