"use client";

/**
 * Intent Signals Tab Component
 *
 * Displays all intent signals for a lead with score widget,
 * grouped timeline view, and filtering options.
 */

import { IntentScoreWidget } from "./IntentScoreWidget";
import { IntentSignalCard } from "./IntentSignalCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Target, TrendingUp } from "lucide-react";
import type {
	IntentSignal,
	IntentScore,
} from "@/types/_dashboard/intentSignals";
import { groupSignalsByType } from "@/lib/scoring/intentScoring";

interface IntentSignalsTabProps {
	/** Array of intent signals for the lead */
	signals: IntentSignal[];
	/** Calculated intent score */
	score: IntentScore;
}

/**
 * Empty state component when no signals exist
 */
function EmptyState() {
	return (
		<Card>
			<CardContent className="flex flex-col items-center justify-center py-12 text-center">
				<div className="rounded-full bg-muted p-4 mb-4">
					<Activity className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="font-semibold text-lg mb-2">No Intent Signals Yet</h3>
				<p className="text-muted-foreground text-sm max-w-sm">
					Intent signals are automatically tracked when leads interact with your
					emails, website, calls, and other touchpoints. Check back once this
					lead becomes more active.
				</p>
				<div className="mt-6 rounded-lg bg-muted/50 p-4 text-left text-sm max-w-md">
					<p className="font-medium mb-2">Tracked Activities:</p>
					<ul className="space-y-1 text-muted-foreground">
						<li>• Email opens, clicks, and replies</li>
						<li>• Website visits and page views</li>
						<li>• Document downloads and form submissions</li>
						<li>• Phone calls and SMS interactions</li>
						<li>• External signals (LinkedIn, funding events, etc.)</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}

/**
 * Signal list component for a specific type
 */
function SignalList({
	signals,
	title,
	icon: Icon,
}: {
	signals: IntentSignal[];
	title: string;
	icon: React.ComponentType<{ className?: string }>;
}) {
	if (signals.length === 0) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<Icon className="h-4 w-4" />
					{title}
					<span className="text-muted-foreground text-sm font-normal">
						({signals.length})
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{signals.map((signal) => (
					<IntentSignalCard
						key={signal.id}
						signal={signal}
						showMetadata={false}
					/>
				))}
			</CardContent>
		</Card>
	);
}

export function IntentSignalsTab({ signals, score }: IntentSignalsTabProps) {
	// Show empty state if no signals
	if (!signals || signals.length === 0) {
		return <EmptyState />;
	}

	// Group signals by type
	const grouped = groupSignalsByType(signals);

	// Sort signals by timestamp (most recent first)
	const allSignalsSorted = [...signals].sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	);

	return (
		<div className="space-y-6">
			{/* Intent Score Widget */}
			<IntentScoreWidget score={score} showBreakdown={true} />

			{/* Tabbed View of Signals */}
			<Tabs defaultValue="all" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="all">All ({signals.length})</TabsTrigger>
					<TabsTrigger value="engagement">
						Engagement ({grouped.engagement.length})
					</TabsTrigger>
					<TabsTrigger value="behavioral">
						Behavioral ({grouped.behavioral.length})
					</TabsTrigger>
					<TabsTrigger value="external">
						External ({grouped.external.length})
					</TabsTrigger>
				</TabsList>

				{/* All Signals Tab */}
				<TabsContent value="all" className="space-y-4 mt-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<Activity className="h-4 w-4" />
								All Activity Timeline
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{allSignalsSorted.map((signal) => (
								<IntentSignalCard
									key={signal.id}
									signal={signal}
									showMetadata={false}
								/>
							))}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Engagement Signals Tab */}
				<TabsContent value="engagement" className="space-y-4 mt-4">
					{grouped.engagement.length > 0 ? (
						<SignalList
							signals={grouped.engagement.sort(
								(a, b) =>
									new Date(b.timestamp).getTime() -
									new Date(a.timestamp).getTime(),
							)}
							title="Engagement Signals"
							icon={Target}
						/>
					) : (
						<Card>
							<CardContent className="py-8 text-center text-muted-foreground">
								No engagement signals recorded yet
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Behavioral Signals Tab */}
				<TabsContent value="behavioral" className="space-y-4 mt-4">
					{grouped.behavioral.length > 0 ? (
						<SignalList
							signals={grouped.behavioral.sort(
								(a, b) =>
									new Date(b.timestamp).getTime() -
									new Date(a.timestamp).getTime(),
							)}
							title="Behavioral Signals"
							icon={Activity}
						/>
					) : (
						<Card>
							<CardContent className="py-8 text-center text-muted-foreground">
								No behavioral signals recorded yet
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* External Signals Tab */}
				<TabsContent value="external" className="space-y-4 mt-4">
					{grouped.external.length > 0 ? (
						<SignalList
							signals={grouped.external.sort(
								(a, b) =>
									new Date(b.timestamp).getTime() -
									new Date(a.timestamp).getTime(),
							)}
							title="External Signals"
							icon={TrendingUp}
						/>
					) : (
						<Card>
							<CardContent className="py-8 text-center text-muted-foreground">
								No external signals recorded yet
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
