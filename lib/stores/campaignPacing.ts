// * Campaign pacing calculation utilities and Zustand selector
import { create } from "zustand";
import { addDays, isWeekend } from "date-fns";
import { useCampaignCreationStore } from "./campaignCreation";

export interface PacingInfo {
	eligibleDays: number;
	totalMessages: number;
	leadsPerDay: number;
	messagesPerLead: number;
}

// Utility to calculate eligible days in a range (skipping weekends if needed)
export function getEligibleDays(
	startDate: Date,
	days: number,
	includeWeekends: boolean,
): number {
	let count = 0;
	for (let i = 0; i < days; i++) {
		const day = addDays(startDate, i);
		if (includeWeekends || !isWeekend(day)) {
			count++;
		}
	}
	return count;
}

// Main pacing calculation
export function useCampaignPacing(): PacingInfo {
	const { leadCount, daysSelected, includeWeekends, startDate } =
		useCampaignCreationStore();
	const eligibleDays = getEligibleDays(
		startDate,
		daysSelected,
		includeWeekends,
	);
	const totalMessages = eligibleDays * 2; // 2 messages per day
	const leadsPerDay = leadCount && eligibleDays ? leadCount / eligibleDays : 0;
	const messagesPerLead = leadCount ? totalMessages / leadCount : 0;
	return {
		eligibleDays,
		totalMessages,
		leadsPerDay,
		messagesPerLead,
	};
}
