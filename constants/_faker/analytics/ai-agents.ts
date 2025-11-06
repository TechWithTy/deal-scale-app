import { faker } from "@faker-js/faker";
import type { AIAgentsData } from "@/app/dashboard/charts/types/ai-agents";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "@/constants/data";

export function generateMockAIAgentsData(): AIAgentsData {
	const totalTasks = faker.number.int({ min: 1000, max: 1500 });
	const hoursSaved = faker.number.int({ min: 30, max: 80 });
	
	return {
		ai_summary: {
			total_tasks: totalTasks,
			hours_saved: hoursSaved,
			conversion_lift: Number.parseFloat(faker.finance.amount({ min: 12, max: 25, dec: 1 })),
			roi_percent: faker.number.int({ min: 200, max: 450 }),
			accuracy: faker.number.int({ min: 88, max: 96 }),
		},
		modules: {
			voice: {
				calls: faker.number.int({ min: 50, max: 100 }),
				response_rate: faker.number.int({ min: 35, max: 50 }),
				avg_time: faker.number.int({ min: 90, max: 180 }),
				quality: Number.parseFloat(faker.finance.amount({ min: 4.3, max: 4.9, dec: 1 })),
				callbacks: faker.number.int({ min: 8, max: 20 }),
				deals: faker.number.int({ min: 2, max: 8 }),
			},
			scripts: {
				messages: faker.number.int({ min: 120, max: 200 }),
				reply_rate: faker.number.int({ min: 25, max: 40 }),
				personalization: faker.number.int({ min: 80, max: 95 }),
				auto_followups: faker.number.int({ min: 180, max: 250 }),
				human_edit_rate: faker.number.int({ min: 10, max: 20 }),
			},
			enrichment: {
				leads_enriched: faker.number.int({ min: 700, max: 1000 }),
				match_rate: faker.number.int({ min: 88, max: 96 }),
				high_intent: faker.number.int({ min: 250, max: 400 }),
				signal_strength: faker.number.int({ min: 65, max: 85 }),
				top_source: faker.helpers.arrayElement(["LinkedIn", "Property Records", "Social Media", "Website"]),
			},
			automation: {
				workflows: faker.number.int({ min: 18, max: 28 }),
				completion: faker.number.int({ min: 92, max: 98 }),
				error_recovery: faker.number.int({ min: 82, max: 92 }),
				manual_overrides: faker.number.int({ min: 2, max: 6 }),
				depth: faker.number.int({ min: 65, max: 80 }),
			},
		},
		pro: {
			dei: faker.number.int({ min: 75, max: 95 }),
			predictive_close: faker.number.int({ min: 25, max: 45 }),
			signal_sale_correlation: faker.number.int({ min: 35, max: 55 }),
			forecasted_hobby_sessions: faker.number.int({ min: 45, max: 75 }),
		},
	};
}

export const mockAIAgentsData: AIAgentsData = NEXT_PUBLIC_APP_TESTING_MODE
	? generateMockAIAgentsData()
	: {
		ai_summary: {
			total_tasks: 1247,
			hours_saved: 42,
			conversion_lift: 18,
			roi_percent: 340,
			accuracy: 92,
		},
		modules: {
			voice: {
				calls: 63,
				response_rate: 42,
				avg_time: 102,
				quality: 4.7,
				callbacks: 11,
				deals: 3,
			},
			scripts: {
				messages: 142,
				reply_rate: 31,
				personalization: 85,
				auto_followups: 207,
				human_edit_rate: 15,
			},
			enrichment: {
				leads_enriched: 836,
				match_rate: 93,
				high_intent: 312,
				signal_strength: 74,
				top_source: "LinkedIn",
			},
			automation: {
				workflows: 21,
				completion: 96,
				error_recovery: 88,
				manual_overrides: 3,
				depth: 72,
			},
		},
		pro: {
			dei: 87,
			predictive_close: 34,
			signal_sale_correlation: 48,
			forecasted_hobby_sessions: 60,
		},
	};

