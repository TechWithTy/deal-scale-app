import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import React, { useState } from "react";
import { CampaignSchedulePlanner } from "./CampaignSchedulePlanner";

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
		endDate,
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
		scheduleMode,
		selectedRunDates,
	} = useCampaignCreationStore();
	const [dateError, setDateError] = useState("");

	// Ensure the next button is only enabled when we have valid start and end dates
	const isNextEnabled = Boolean(
		scheduleMode === "date-range"
			? startDate && endDate && !dateError && startDate <= endDate
			: selectedRunDates.length > 0,
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
			<CampaignSchedulePlanner />
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
