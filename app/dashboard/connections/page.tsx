"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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
import { useModalStore, type WebhookStage } from "@/lib/stores/dashboard";
import {
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
		<Card>
			<CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<CardTitle className="flex items-center gap-2">
						<Icon className="h-5 w-5 text-primary" />
						{config.title}
					</CardTitle>
					<CardDescription>{config.description}</CardDescription>
				</div>
				<Button variant={config.buttonVariant} onClick={() => onOpen(stage)}>
					{config.buttonLabel}
				</Button>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2">
					{connectionHighlights[stage].map((highlight) => (
						<div
							key={highlight.title}
							className="rounded-lg border bg-card/40 p-4"
						>
							<div className="flex items-start gap-3">
								<HighlightIcon className="mt-1 h-5 w-5 text-primary" />
								<div>
									<p className="font-medium text-foreground">
										{highlight.title}
									</p>
									<p className="text-sm text-muted-foreground">
										{highlight.description}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
				<p className="text-xs text-muted-foreground">{config.footer}</p>
			</CardContent>
		</Card>
	);
};

const ConnectionsPage = () => {
	const { webhookStage, setWebhookStage, openWebhookModal } = useModalStore(
		(state) => ({
			webhookStage: state.webhookStage,
			setWebhookStage: state.setWebhookStage,
			openWebhookModal: state.openWebhookModal,
		}),
	);

	const [activeStage, setActiveStage] = useState<WebhookStage>(webhookStage);

	useEffect(() => {
		setActiveStage(webhookStage);
	}, [webhookStage]);

	const filteredLog = useMemo(() => {
		if (activeStage === "feeds") return connectionActivity;
		return connectionActivity.filter((row) => row.stage === activeStage);
	}, [activeStage]);

	const handleStageChange = (stage: WebhookStage) => {
		setActiveStage(stage);
		setWebhookStage(stage);
	};

	const handleOpenModal = (stage: WebhookStage) => {
		handleStageChange(stage);
		openWebhookModal(stage);
	};

	return (
		<div className="space-y-10">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">
						Connections Hub
					</h1>
					<p className="text-muted-foreground">
						Manage webhooks, feeds, and delivery activity from a single
						workspace.
					</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/docs/webhooks" aria-label="Open webhook documentation">
						View docs
						<ArrowUpRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</div>

			<Tabs
				value={activeStage}
				onValueChange={(value) => handleStageChange(value as WebhookStage)}
			>
				<TabsList className="grid w-full gap-2 md:w-auto md:grid-cols-3">
					<TabsTrigger value="incoming">Incoming</TabsTrigger>
					<TabsTrigger value="outgoing">Outgoing</TabsTrigger>
					<TabsTrigger value="feeds">Feeds</TabsTrigger>
				</TabsList>

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

			<Card>
				<CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<CardTitle>Activity history</CardTitle>
						<CardDescription>
							Review deliveries, troubleshoot failures, and confirm feed
							refreshes.
						</CardDescription>
					</div>
					<Badge variant="secondary">
						{activeStage === "feeds" ? "All stages" : `${activeStage} focus`}
					</Badge>
				</CardHeader>
				<CardContent>
					{filteredLog.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No events recorded for the selected stage yet. Trigger a test from
							the modal to populate history.
						</p>
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
											<Badge
												variant={
													row.status >= 400 ? "destructive" : "secondary"
												}
											>
												{row.status}
											</Badge>
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
