export interface AIAgentSummary {
	total_tasks: number;
	hours_saved: number;
	conversion_lift: number;
	roi_percent: number;
	accuracy: number;
}

export interface VoiceAgentMetrics {
	calls: number;
	response_rate: number;
	avg_time: number; // seconds
	quality: number; // 0-5 rating
	callbacks: number;
	deals: number;
}

export interface ScriptMessagingMetrics {
	messages: number;
	reply_rate: number;
	personalization: number; // percentage
	auto_followups: number;
	human_edit_rate: number; // percentage
}

export interface EnrichmentMetrics {
	leads_enriched: number;
	match_rate: number; // percentage
	high_intent: number;
	signal_strength: number; // 0-100
	top_source: string;
}

export interface AutomationWorkflowMetrics {
	workflows: number;
	completion: number; // percentage
	error_recovery: number; // percentage
	manual_overrides: number;
	depth: number; // percentage of work that's automated
}

export interface ProInsights {
	dei: number;
	predictive_close: number;
	signal_sale_correlation: number;
	forecasted_hobby_sessions: number;
}

export interface AIAgentsData {
	ai_summary: AIAgentSummary;
	modules: {
		voice: VoiceAgentMetrics;
		scripts: ScriptMessagingMetrics;
		enrichment: EnrichmentMetrics;
		automation: AutomationWorkflowMetrics;
	};
	pro: ProInsights;
}
