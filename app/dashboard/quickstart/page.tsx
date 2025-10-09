"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { HelpCircle, List, Rss, Upload, Webhook } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import LeadModalMain from "@/components/reusables/modals/user/lead/LeadModalMain";
import LeadBulkSuiteModal from "@/components/reusables/modals/user/lead/LeadBulkSuiteModal";
import CampaignModalMain from "@/components/reusables/modals/user/campaign/CampaignModalMain";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import { campaignSteps } from "@/_tests/tours/campaignTour";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useModalStore, type WebhookStage } from "@/lib/stores/dashboard";

export default function QuickStartPage() {
	const [showLeadModal, setShowLeadModal] = useState(false);
	const [leadModalMode, setLeadModalMode] = useState<"select" | "create">(
		"create",
	);
	const [showWalkthrough, setShowWalkthrough] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);
	const [bulkCsvFile, setBulkCsvFile] = useState<File | null>(null);
	const [bulkCsvHeaders, setBulkCsvHeaders] = useState<string[]>([]);
	const [showBulkSuiteModal, setShowBulkSuiteModal] = useState(false);
	const [showCampaignModal, setShowCampaignModal] = useState(false);
	const [campaignModalContext, setCampaignModalContext] = useState<{
		leadListId: string;
		leadListName: string;
		leadCount: number;
	} | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const openWebhookModal = useModalStore((state) => state.openWebhookModal);

	const resetCampaignStore = useCampaignCreationStore((state) => state.reset);
	const setAreaMode = useCampaignCreationStore((state) => state.setAreaMode);
	const setSelectedLeadListId = useCampaignCreationStore(
		(state) => state.setSelectedLeadListId,
	);
	const setLeadCount = useCampaignCreationStore((state) => state.setLeadCount);
	const setCampaignName = useCampaignCreationStore(
		(state) => state.setCampaignName,
	);

	const handleSelectList = () => {
		setLeadModalMode("select");
		setShowLeadModal(true);
	};

	const handleLaunchCampaign = ({
		leadListId,
		leadListName,
		leadCount,
	}: {
		leadListId: string;
		leadListName: string;
		leadCount: number;
	}) => {
		resetCampaignStore();
		setAreaMode("leadList");
		setSelectedLeadListId(leadListId);
		setLeadCount(leadCount);
		setCampaignName(`${leadListName} Campaign`);
		setCampaignModalContext({ leadListId, leadListName, leadCount });
		setShowCampaignModal(true);
		setShowLeadModal(false);
	};

	const handleSuiteLaunchComplete = ({
		leadListId,
		leadListName,
		leadCount,
	}: {
		leadListId: string;
		leadListName: string;
		leadCount: number;
	}) => {
		handleLaunchCampaign({ leadListId, leadListName, leadCount });
		return true;
	};

	const handleCloseLeadModal = () => {
		setShowLeadModal(false);
	};

	const handleImportData = () => {
		setShowBulkSuiteModal(true);
	};

	const handleOpenWebhookModal = (stage: WebhookStage) => {
		openWebhookModal(stage);
	};

	const handleStartTour = () => setIsTourOpen(true);
	const handleCloseTour = () => setIsTourOpen(false);

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith(".csv") && !file.type.includes("csv")) {
			toast.error("Please select a CSV file");
			return;
		}

		setBulkCsvFile(file);

		const reader = new FileReader();
		reader.onload = (e) => {
			const csvText = e.target?.result as string;
			if (!csvText) return;

			const lines = csvText.split("\n").filter((line) => line.trim().length);
			if (lines.length === 0) {
				toast.error("CSV file appears to be empty");
				return;
			}

			const headers = lines[0]
				.split(",")
				.map((header) => header.trim().replace(/"/g, ""))
				.filter((header) => header.length > 0)
				.slice(0, 50);

			if (headers.length === 0) {
				toast.error("No valid headers found in CSV file");
				return;
			}

			setBulkCsvHeaders(headers);
			toast.success(
				`Found ${headers.length} columns in CSV: ${headers
					.slice(0, 3)
					.join(", ")}${headers.length > 3 ? "..." : ""}`,
			);

			setShowBulkSuiteModal(true);
		};

		reader.onerror = () => {
			toast.error("Error reading CSV file");
		};

		reader.readAsText(file);
	};

	const handleCampaignModalToggle = (open: boolean) => {
		setShowCampaignModal(open);
		if (!open) {
			setCampaignModalContext(null);
			resetCampaignStore();
		}
	};

	const handleCloseBulkModal = () => {
		setShowBulkSuiteModal(false);
		setBulkCsvFile(null);
		setBulkCsvHeaders([]);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="relative mb-8 text-center">
				<h1 className="mb-2 text-3xl font-bold text-foreground">Quick Start</h1>
				<p className="text-lg text-muted-foreground">
					Get up and running in minutes. Choose how you’d like to begin.
				</p>
				<button
					onClick={() => setShowWalkthrough(true)}
					className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-muted-foreground transition hover:bg-muted"
					type="button"
				>
					<HelpCircle className="h-5 w-5" />
				</button>
			</div>

			<div className="mx-auto grid max-w-5xl gap-6 items-stretch md:grid-cols-2 xl:grid-cols-3">
				<Card className="group flex h-full flex-col border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 transition hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20">
					<CardHeader className="pb-4 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 transition-colors group-hover:bg-primary/30">
							<Upload className="h-6 w-6 text-primary" />
						</div>
						<CardTitle className="text-xl text-primary">Import Data</CardTitle>
						<CardDescription>
							Upload your existing lead data or connect external sources
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col pt-0">
						<div className="flex flex-1 flex-col gap-3">
							<Button
								variant="outline"
								className="w-full border-primary/30 text-primary hover:bg-primary/10"
								size="lg"
								onClick={handleImportData}
								type="button"
							>
								Import Leads
							</Button>
							<p className="text-center text-xs text-muted-foreground">
								Connect external data sources and APIs
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="group flex h-full flex-col border-2 transition hover:border-primary/20 hover:shadow-lg">
					<CardHeader className="pb-4 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
							<List className="h-6 w-6 text-primary" />
						</div>
						<CardTitle className="text-xl">Manage Lists</CardTitle>
						<CardDescription>
							Create new lead lists from CSV files or work with existing lists
							to start campaigns
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col pt-0">
						<div className="flex flex-1 flex-col gap-3">
							<Button
								className="w-full"
								size="lg"
								onClick={triggerFileInput}
								type="button"
							>
								<Upload className="mr-2 h-4 w-4" />
								{bulkCsvFile ? "Change CSV File" : "Upload CSV File"}
							</Button>
							<Button
								variant="outline"
								className="w-full"
								size="lg"
								onClick={handleSelectList}
								type="button"
							>
								Browse Lists
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="group flex h-full flex-col border-2 transition hover:border-primary/20 hover:shadow-lg">
					<CardHeader className="pb-4 text-center">
						<div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
							<Webhook className="h-6 w-6 text-primary" />
							<Rss className="absolute -bottom-1 -right-1 h-4 w-4 text-primary/70" />
						</div>
						<CardTitle className="text-xl">Webhooks &amp; Feeds</CardTitle>
						<CardDescription>
							Connect DealScale with your CRM and publish updates instantly.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col pt-0">
						<div className="flex flex-1 flex-col gap-3">
							<Button
								className="w-full"
								size="lg"
								onClick={() => handleOpenWebhookModal("incoming")}
								type="button"
							>
								Setup Incoming
							</Button>
							<Button
								variant="outline"
								className="w-full"
								size="lg"
								onClick={() => handleOpenWebhookModal("outgoing")}
								type="button"
							>
								Setup Outgoing
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept=".csv,text/csv"
				onChange={handleCsvUpload}
				className="hidden"
			/>

			<LeadModalMain
				isOpen={showLeadModal}
				onClose={handleCloseLeadModal}
				initialListMode={leadModalMode}
				onLaunchCampaign={handleLaunchCampaign}
			/>

			<LeadBulkSuiteModal
				isOpen={showBulkSuiteModal}
				onClose={handleCloseBulkModal}
				initialCsvFile={bulkCsvFile}
				initialCsvHeaders={bulkCsvHeaders}
				onSuiteLaunchComplete={(payload) => {
					handleSuiteLaunchComplete(payload);
					handleCloseBulkModal();
					return true;
				}}
			/>

			<CampaignModalMain
				isOpen={showCampaignModal && Boolean(campaignModalContext)}
				onOpenChange={handleCampaignModalToggle}
				initialLeadListId={campaignModalContext?.leadListId}
				initialLeadListName={campaignModalContext?.leadListName}
				initialLeadCount={campaignModalContext?.leadCount ?? 0}
				initialStep={0}
			/>

			<WalkThroughModal
				isOpen={showWalkthrough}
				onClose={() => setShowWalkthrough(false)}
				videoUrl="https://www.youtube.com/watch?v=hyosynoNbSU"
				title="Welcome To Deal Scale"
				subtitle="Get help getting started with your lead generation platform."
				steps={campaignSteps}
				isTourOpen={isTourOpen}
				onStartTour={handleStartTour}
				onCloseTour={handleCloseTour}
			/>

			<div className="mx-auto mt-12 max-w-2xl text-center">
				<div className="rounded-lg bg-muted/50 p-6">
					<h3 className="mb-2 text-lg font-semibold">
						Need Help Getting Started?
					</h3>
					<p className="mb-4 text-sm text-muted-foreground">
						Our step-by-step guide will walk you through creating your first
						campaign, managing leads, and optimizing your outreach strategy.
					</p>
					<Button asChild variant="outline" size="sm">
						<Link href="https://docs.dealscale.io/quick-start" target="_blank">
							View Getting Started Guide
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
