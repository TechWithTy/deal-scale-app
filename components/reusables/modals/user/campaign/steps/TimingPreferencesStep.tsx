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
		if (!range) {
			setStartDate(new Date());
			setEndDate(null);
			setDateError("Please select both a start and end date.");
			return;
		}
		let { from, to } = range;
		if (!from || !to) {
			setStartDate(from ?? new Date());
			setEndDate(to ?? null);
			setDateError("Please select both a start and end date.");
			return;
		}
		// If weekends are not allowed, snap to nearest valid weekday range
		if (!reachOnWeekend) {
			// Helper to check if a date is weekend
			const isWeekend = (date: Date) =>
				date.getDay() === 0 || date.getDay() === 6;
			// Move from forward if it's a weekend
			while (from && isWeekend(from) && from < to) {
				from = new Date(from);
				from.setDate(from.getDate() + 1);
			}
			// Move to backward if it's a weekend
			while (to && isWeekend(to) && to > from) {
				to = new Date(to);
				to.setDate(to.getDate() - 1);
			}
			// If after snapping, either endpoint is still a weekend, range is invalid
			if ((from && isWeekend(from)) || (to && isWeekend(to))) {
				setDateError(
					"Selected range cannot start or end on a weekend when weekend outreach is disabled.",
				);
				setStartDate(null);
				setEndDate(null);
				return;
			}
		}
		setStartDate(from);
		setEndDate(to);
		setDateError("");
	};

	const isNextEnabled = !!startDate && !!endDate && !dateError;

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
					selected={{ from: startDate ?? undefined, to: endDate ?? undefined }}
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
