"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignActivitySummary } from "@/external/shadcn-table/src/components/data-table/campaign-activity-summary";
import {
	buildChannelActivityData,
	type ChannelActivityData,
} from "@/external/shadcn-table/src/components/data-table/activity";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

interface CampaignActivityStepProps {
	onBack?: () => void;
	onNext?: () => void;
}

type DerivedChannel = "voice" | "text" | "directMail" | "social";

const CHANNEL_LABELS: Record<DerivedChannel, string> = {
	voice: "Call",
	text: "Text",
	directMail: "Direct Mail",
	social: "Social",
};

const channelActivityMocks: Record<DerivedChannel, Record<string, unknown>> = {
	voice: {
		name: "Voice Outreach",
		status: "Active",
		startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		calls: 186,
		hungUp: 28,
		dead: 9,
		voicemail: 24,
		transfers: 14,
		inQueue: 18,
		leads: 72,
	},
	text: {
		name: "SMS Follow Ups",
		status: "Active",
		startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
		textStats: {
			sent: 1284,
			delivered: 1216,
			failed: 36,
		},
		dnc: 14,
	},
	directMail: {
		name: "Mail Drop A",
		status: "Delivering",
		startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
		mailType: "postcard",
		mailSize: "6x9",
		deliveredCount: 432,
		returnedCount: 11,
		failedCount: 6,
		cost: 2485.75,
	},
	social: {
		name: "Social Outreach",
		status: "Active",
		startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
		platform: "LinkedIn",
		interactionsDetails: Array.from({ length: 16 }).map((_, index) => ({
			transfers: index % 4 === 0 ? 1 : 0,
		})),
		sent: 812,
		delivered: 768,
		failed: 22,
	},
};

const channelInsights: Record<
	DerivedChannel,
	{ title: string; value: string; helper?: string }[]
> = {
	voice: [
		{ title: "Connect Rate", value: "74%", helper: "+5.1% vs last week" },
		{
			title: "Average Handle Time",
			value: "3m 42s",
			helper: "12s faster than target",
		},
	],
	text: [
		{ title: "Reply Rate", value: "38%", helper: "+4.2% vs last week" },
		{
			title: "Queued Messages",
			value: "62",
			helper: "Scheduled across 3 hours",
		},
	],
	directMail: [
		{
			title: "Delivery Rate",
			value: "92%",
			helper: "Majority expected in 2 days",
		},
		{ title: "Cost per Lead", value: "$3.20", helper: "Budget on track" },
	],
	social: [
		{ title: "Engagement Rate", value: "17%", helper: "+2.5% vs prior cycle" },
		{ title: "Transfers", value: "24", helper: "Escalated to live team" },
	],
};

const channelFeed: Record<
	DerivedChannel,
	{ title: string; description: string; time: string }[]
> = {
	voice: [
		{
			title: "Connected with Jamie Ortega",
			description: "Scheduled a property walkthrough",
			time: "2 hours ago",
		},
		{
			title: "Voicemail left for Casey Reed",
			description: "Follow-up reminder queued",
			time: "5 hours ago",
		},
		{
			title: "Transfer from IVR",
			description: "Routed to senior agent Alan",
			time: "Yesterday",
		},
	],
	text: [
		{
			title: "Message delivered to Alex Chen",
			description: "Opted in via web form",
			time: "15 minutes ago",
		},
		{
			title: "Reply from Priya Patel",
			description: "Confirmed appointment for Friday",
			time: "1 hour ago",
		},
		{
			title: "Queued broadcast",
			description: "Evening reminders scheduled",
			time: "Today, 6:00 PM",
		},
	],
	directMail: [
		{
			title: "Batch delivered in Phoenix",
			description: "78 postcards marked as arrived",
			time: "Today",
		},
		{
			title: "Return notice",
			description: "3 mailers returned for invalid address",
			time: "Yesterday",
		},
		{
			title: "Print vendor confirmation",
			description: "Next run scheduled for Monday",
			time: "2 days ago",
		},
	],
	social: [
		{
			title: "InMail response from Jordan",
			description: "Requested pricing sheet",
			time: "30 minutes ago",
		},
		{
			title: "Comment thread trending",
			description: "12 interactions on latest post",
			time: "3 hours ago",
		},
		{
			title: "Conversation transferred",
			description: "Handed to live rep for demo",
			time: "Yesterday",
		},
	],
};

export default function CampaignActivityStep(_: CampaignActivityStepProps) {
	const primaryChannel = useCampaignCreationStore(
		(state) => state.primaryChannel,
	);

	const derivedChannel = React.useMemo<DerivedChannel>(() => {
		switch (primaryChannel) {
			case "text":
				return "text";
			case "directmail":
			case "email":
				return "directMail";
			case "social":
				return "social";
			case "call":
			default:
				return "voice";
		}
	}, [primaryChannel]);

	const overviewActivity: ChannelActivityData | null = React.useMemo(() => {
		return buildChannelActivityData(channelActivityMocks[derivedChannel]);
	}, [derivedChannel]);

	const tabs = React.useMemo(() => {
		const items: { value: string; label: string; content: React.ReactNode }[] =
			[];

		if (overviewActivity) {
			items.push({
				value: "overview",
				label: `${CHANNEL_LABELS[derivedChannel]} Overview`,
				content: <CampaignActivitySummary activity={overviewActivity} />,
			});
		}

		const insights = channelInsights[derivedChannel];
		if (insights.length) {
			items.push({
				value: "insights",
				label: "Channel Insights",
				content: (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{insights.map((metric) => (
							<div key={metric.title} className="rounded-lg border bg-card p-4">
								<h4 className="mb-2 font-medium">{metric.title}</h4>
								<div className="text-3xl font-bold text-primary">
									{metric.value}
								</div>
								{metric.helper ? (
									<div className="text-sm text-muted-foreground">
										{metric.helper}
									</div>
								) : null}
							</div>
						))}
					</div>
				),
			});
		}

		const feed = channelFeed[derivedChannel];
		if (feed.length) {
			items.push({
				value: "activity",
				label: "Recent Activity",
				content: (
					<div className="space-y-3">
						{feed.map((item) => (
							<div
								key={`${item.title}-${item.time}`}
								className="flex items-start justify-between rounded-lg border bg-card p-3"
							>
								<div>
									<div className="font-medium">{item.title}</div>
									<div className="text-sm text-muted-foreground">
										{item.description}
									</div>
								</div>
								<div className="text-sm text-muted-foreground">{item.time}</div>
							</div>
						))}
					</div>
				),
			});
		}

		return items;
	}, [derivedChannel, overviewActivity]);

	const tabCount = tabs.length || 1;
	const gridCols =
		tabCount === 1
			? "grid-cols-1"
			: tabCount === 2
				? "grid-cols-2"
				: tabCount === 3
					? "grid-cols-3"
					: "grid-cols-4";
	const defaultValue = tabs[0]?.value ?? "overview";

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-foreground">
					{CHANNEL_LABELS[derivedChannel]} Campaign Activity
				</h2>
				<p className="text-muted-foreground">
					Channel-specific metrics for your{" "}
					{CHANNEL_LABELS[derivedChannel].toLowerCase()} campaign
				</p>
			</div>

			<Tabs defaultValue={defaultValue} className="w-full">
				<TabsList className={`grid w-full ${gridCols}`}>
					{tabs.map((tab) => (
						<TabsTrigger key={tab.value} value={tab.value}>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				{tabs.map((tab) => (
					<TabsContent key={tab.value} value={tab.value} className="space-y-4">
						{tab.content}
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
