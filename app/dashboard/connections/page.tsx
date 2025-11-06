"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HelpCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useModalStore,
	type WebhookCategory,
	type WebhookStage,
} from "@/lib/stores/dashboard";
import {
	categoryConfig,
	connectionActivity,
	connectionHighlights,
	connectionStageCards,
} from "./config";

interface StageCardProps {
	stage: WebhookStage;
	onOpen: (stage: WebhookStage) => void;
}

const StageCard = ({ stage, onOpen }: StageCardProps) => {
	const config = connectionStageCards[stage];
	const Icon = config.icon;
	const HighlightIcon = config.highlightIcon;

	return (
		<Card className="transition-shadow hover:shadow-md">
			<CardHeader className="flex flex-col items-center gap-4 border-b pb-5 text-center">
				<div className="space-y-2">
					<CardTitle className="flex items-center justify-center gap-2 text-lg">
						<Icon className="h-5 w-5 text-primary" />
						{config.title}
					</CardTitle>
					<CardDescription className="mx-auto max-w-2xl">
						{config.description}
					</CardDescription>
				</div>
				<Button
					variant={config.buttonVariant}
					onClick={() => onOpen(stage)}
					className="w-full sm:w-auto"
				>
					{config.buttonLabel}
				</Button>
			</CardHeader>
			<CardContent className="space-y-4 pt-6">
				<div className="grid gap-4 md:grid-cols-2">
					{connectionHighlights[stage].map((highlight) => (
						<div
							key={highlight.title}
							className="rounded-lg border bg-muted/50 p-4 transition-colors hover:bg-muted"
						>
							<div className="flex items-start gap-3">
								<HighlightIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
								<div className="space-y-1">
									<p className="font-medium text-foreground">
										{highlight.title}
									</p>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{highlight.description}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
				<p className="border-t pt-4 text-xs text-muted-foreground">
					{config.footer}
				</p>
			</CardContent>
		</Card>
	);
};

const ConnectionsPage = () => {
	const {
		webhookStage,
		webhookCategory,
		setWebhookStage,
		setWebhookCategory,
		openWebhookModal,
	} = useModalStore((state) => ({
		webhookStage: state.webhookStage,
		webhookCategory: state.webhookCategory,
		setWebhookStage: state.setWebhookStage,
		setWebhookCategory: state.setWebhookCategory,
		openWebhookModal: state.openWebhookModal,
	}));

	const [activeCategory, setActiveCategory] =
		useState<WebhookCategory>(webhookCategory);
	const [activeStage, setActiveStage] = useState<WebhookStage>(webhookStage);

	useEffect(() => {
		setActiveCategory(webhookCategory);
		setActiveStage(webhookStage);
	}, [webhookCategory, webhookStage]);

	const filteredLog = useMemo(() => {
		let filtered = connectionActivity;
		if (activeStage !== "feeds") {
			filtered = filtered.filter((row) => row.stage === activeStage);
		}
		// Filter by category if specified
		if (activeCategory) {
			filtered = filtered.filter(
				(row) => !row.category || row.category === activeCategory,
			);
		}
		return filtered;
	}, [activeStage, activeCategory]);

	const handleCategoryChange = (category: WebhookCategory) => {
		setActiveCategory(category);
		setWebhookCategory(category);
	};

	const handleStageChange = (stage: WebhookStage) => {
		setActiveStage(stage);
		setWebhookStage(stage);
	};

	const handleOpenModal = (stage: WebhookStage) => {
		handleStageChange(stage);
		openWebhookModal(stage, activeCategory);
	};

	const categories: WebhookCategory[] = ["leads", "campaigns", "skiptracing"];

	return (
		<div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="flex flex-col items-center gap-5 text-center">
				<div className="space-y-2.5">
					<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						Connections Hub
					</h1>
					<p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
						Manage webhooks, feeds, and delivery activity from a single
						workspace.
					</p>
				</div>
				<button
					type="button"
					onClick={() => {
						if (typeof window !== "undefined") {
							window.dispatchEvent(new Event("dealScale:helpFab:show"));
						}
					}}
					className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					aria-label="Show help and demo"
				>
					<HelpCircle className="h-5 w-5" />
				</button>
			</div>

			{/* Category Tabs */}
			<Tabs
				value={activeCategory}
				onValueChange={(value) =>
					handleCategoryChange(value as WebhookCategory)
				}
				className="w-full space-y-6"
			>
				<div className="flex justify-center">
					<TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-muted p-1.5">
						{categories.map((category) => (
							<TabsTrigger
								key={category}
								value={category}
								className="px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
							>
								{categoryConfig[category].label}
							</TabsTrigger>
						))}
					</TabsList>
				</div>

				{categories.map((category) => (
					<TabsContent
						key={category}
						value={category}
						className="mt-6 space-y-6"
					>
						{/* Stage Tabs within each category */}
						<Tabs
							value={activeStage}
							onValueChange={(value) =>
								handleStageChange(value as WebhookStage)
							}
							className="w-full space-y-6"
						>
							<div className="flex justify-center">
								<TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-muted p-1.5">
									<TabsTrigger
										value="incoming"
										className="px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
									>
										Incoming
									</TabsTrigger>
									<TabsTrigger
										value="outgoing"
										className="px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
									>
										Outgoing
									</TabsTrigger>
									<TabsTrigger
										value="feeds"
										className="px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
									>
										Feeds
									</TabsTrigger>
								</TabsList>
							</div>

							<TabsContent value="incoming" className="mt-6">
								<StageCard stage="incoming" onOpen={handleOpenModal} />
							</TabsContent>
							<TabsContent value="outgoing" className="mt-6">
								<StageCard stage="outgoing" onOpen={handleOpenModal} />
							</TabsContent>
							<TabsContent value="feeds" className="mt-6">
								<StageCard stage="feeds" onOpen={handleOpenModal} />
							</TabsContent>
						</Tabs>
					</TabsContent>
				))}
			</Tabs>

			<Card className="border shadow-sm">
				<CardHeader className="flex flex-col gap-4 border-b bg-muted/30 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-1.5">
						<CardTitle className="text-xl font-semibold">
							Activity History
						</CardTitle>
						<CardDescription className="text-sm">
							Review deliveries, troubleshoot failures, and confirm feed
							refreshes.
						</CardDescription>
					</div>
					<Badge variant="secondary" className="w-fit shrink-0 font-medium">
						{categoryConfig[activeCategory].label} •{" "}
						{activeStage === "feeds" ? "All stages" : `${activeStage} focus`}
					</Badge>
				</CardHeader>
				<CardContent className="p-6">
					{filteredLog.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<p className="text-sm font-medium text-foreground">
								No activity recorded
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								No events recorded for the selected stage yet. Trigger a test
								from the modal to populate history.
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[150px]">Time</TableHead>
									<TableHead>Event</TableHead>
									<TableHead>Endpoint</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="w-[90px]">Latency</TableHead>
									<TableHead>Response</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredLog.map((row) => (
									<TableRow key={row.id}>
										<TableCell className="font-medium">
											{row.createdAt}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Badge variant="outline" className="capitalize">
													{row.stage}
												</Badge>
												{row.event}
											</div>
										</TableCell>
										<TableCell className="max-w-[240px] truncate text-xs font-mono">
											{row.endpoint}
										</TableCell>
										<TableCell>
											{row.status >= 400 ? (
												<Badge
													variant="destructive"
													className="bg-destructive text-white dark:bg-destructive dark:text-white"
												>
													{row.status}
												</Badge>
											) : row.status >= 300 ? (
												<Badge
													variant="outline"
													className="border-primary/30 bg-primary/10 font-medium text-primary dark:border-primary/50 dark:bg-primary/20 dark:text-primary"
												>
													{row.status}
												</Badge>
											) : (
												<Badge
													variant="default"
													className="bg-primary text-primary-foreground"
												>
													{row.status}
												</Badge>
											)}
										</TableCell>
										<TableCell>{row.latency}</TableCell>
										<TableCell>{row.response}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default ConnectionsPage;
