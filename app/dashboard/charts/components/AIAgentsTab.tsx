"use client";

import FeatureGuard from "@/components/access/FeatureGuard";
import { Card, CardContent } from "@/components/ui/card";
import { mockAIAgentsData } from "@/constants/_faker/analytics/ai-agents";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import { Bot, Sparkles } from "lucide-react";
import { AgentOverviewCards } from "./ai-agents/AgentOverviewCards";
import { AutomationWorkflows } from "./ai-agents/AutomationWorkflows";
import { EnrichmentIntelligence } from "./ai-agents/EnrichmentIntelligence";
import { ProInsightsSection } from "./ai-agents/ProInsightsSection";
import { ScriptMessagingPerformance } from "./ai-agents/ScriptMessagingPerformance";
import { VoiceAgentPerformance } from "./ai-agents/VoiceAgentPerformance";

export function AIAgentsTab() {
	const sessionUser = useSessionStore((state) => state.user);
	const tier = sessionUser?.tier?.toLowerCase();
	const hasProAccess = tier === "enterprise" || tier === "pro";

	const agentData = mockAIAgentsData;

	return (
		<FeatureGuard
			featureKey="analytics.aiAgents"
			fallbackMode="overlay"
			fallbackTier="Starter"
		>
			<div className="space-y-6">
				{/* Unlocked Starter Content */}
				<div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
					<div className="flex items-center gap-2 text-primary">
						<Bot className="h-5 w-5" />
						<p className="font-medium">AI Agents Analytics Enabled</p>
					</div>
				</div>

				{/* Section 1: Agent Overview Cards */}
				<AgentOverviewCards summary={agentData.ai_summary} />

				{/* Section 2 & 3: Voice and Messaging */}
				<div className="grid gap-4 md:grid-cols-2">
					<VoiceAgentPerformance metrics={agentData.modules.voice} />
					<ScriptMessagingPerformance metrics={agentData.modules.scripts} />
				</div>

				{/* Section 4 & 5: Enrichment and Workflows */}
				<div className="grid gap-4 md:grid-cols-2">
					<EnrichmentIntelligence metrics={agentData.modules.enrichment} />
					<AutomationWorkflows metrics={agentData.modules.automation} />
				</div>

				{/* Section 6: Pro Insights (Locked for non-Pro users) */}
				<ProInsightsSection insights={agentData.pro} isLocked={!hasProAccess} />

				{/* Weekly AI Report Summary */}
				<Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-blue-800 dark:from-blue-950/30 dark:to-purple-950/30">
					<CardContent className="pt-6">
						<div className="flex items-start gap-4">
							<div className="rounded-full bg-primary p-3">
								<Bot className="h-6 w-6 text-primary-foreground" />
							</div>
							<div className="flex-1">
								<p className="mb-2 font-bold text-lg">
									🧠 Your AI Team This Week
								</p>
								<ul className="space-y-1 text-sm">
									<li>
										• <strong>{agentData.ai_summary.hours_saved}h saved</strong>{" "}
										= 21 hikes earned 🥾
									</li>
									<li>
										•{" "}
										<strong>
											{agentData.modules.enrichment.high_intent} High-Intent
											Leads
										</strong>{" "}
										found
									</li>
									<li>
										•{" "}
										<strong>
											{agentData.ai_summary.conversion_lift}% conversion lift
										</strong>{" "}
										vs manual campaigns
									</li>
									<li>
										• <strong>Top Performer:</strong> Voice Agent (
										{agentData.modules.voice.quality}/5)
									</li>
								</ul>
								<div className="mt-3">
									<a
										href="#"
										className="font-medium text-primary text-sm hover:underline"
									>
										See full report ▸
									</a>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* AI Insights Footer */}
				<div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-4">
					<div className="flex items-start gap-3">
						<Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
						<div className="space-y-2">
							<p className="font-medium">Key AI Agent Insights:</p>
							<ul className="space-y-1 text-muted-foreground text-sm">
								<li>
									• Your call agent handles 65% more calls than manual
									operations
								</li>
								<li>
									• SMS agent response times are 92% faster than human replies
								</li>
								<li>
									• Email agent maintains 18% higher click-through rates with AI
									optimization
								</li>
								<li>
									• Combined AI agents save you{" "}
									{agentData.ai_summary.hours_saved * 4} hours/month of manual
									work
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</FeatureGuard>
	);
}
