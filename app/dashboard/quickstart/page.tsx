"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
	HelpCircle,
	List,
	Rss,
	Upload,
	Webhook,
	Download,
	Plus,
	Database,
	Settings,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { useRouter } from "next/navigation";

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
	const router = useRouter();
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

	const handleConnectionSettings = () => {
		toast.info("Data source connections and API configuration coming soon!");
	};

	const handleImportFromSource = () => {
		toast.info(
			"Universal data import feature coming soon! Connect to APIs, CRM systems, and more.",
		);
	};

	const handleImportData = () => {
		setShowBulkSuiteModal(true);
	};

	const handleCampaignCreation = () => {
		resetCampaignStore();
		setAreaMode("leadList");
		setCampaignModalContext(null); // Start fresh without pre-selected lead list
		setShowCampaignModal(true);
	};

	const handleViewTemplates = () => {
		toast.info("Campaign templates feature coming soon!");
	};

	const navigateToCampaigns = () => {
		router.push("/dashboard/campaigns");
	};

	const navigateToLeads = () => {
		router.push("/dashboard/lead-lists");
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
						<CardTitle className="text-xl text-primary">
							Import & Manage Data
						</CardTitle>
						<CardDescription>
							Import leads from any source and manage your data connections
							seamlessly
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col pt-0">
						<div className="flex flex-1 flex-col gap-3">
							<Button
								variant="outline"
								className="w-full border-primary/30 text-primary hover:bg-primary/10"
								size="lg"
								onClick={handleImportFromSource}
								type="button"
							>
								<Upload className="mr-2 h-4 w-4" />
								Import from Any Source
							</Button>
							<Button
								variant="outline"
								className="w-full border-primary/30 text-primary hover:bg-primary/10"
								size="lg"
								onClick={handleSelectList}
								type="button"
							>
								<List className="mr-2 h-4 w-4" />
								Browse Existing Lists
							</Button>
							<Button
								variant="outline"
								className="w-full border-primary/30 text-primary hover:bg-primary/10"
								size="lg"
								onClick={handleConnectionSettings}
								type="button"
							>
								<Settings className="mr-2 h-4 w-4" />
								Configure Connections
							</Button>
							<p className="text-center text-xs text-muted-foreground">
								Connect APIs, CRM systems, databases, and more
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="group flex h-full flex-col border-2 transition hover:border-primary/20 hover:shadow-lg">
					<CardHeader className="pb-4 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
							<Plus className="h-6 w-6 text-primary" />
						</div>
						<CardTitle className="text-xl">Create Campaign</CardTitle>
						<CardDescription>
							Launch automated outreach campaigns with AI-powered messaging and
							lead management
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col pt-0">
						<div className="flex flex-1 flex-col gap-3">
							<Button
								className="w-full"
								size="lg"
								onClick={handleCampaignCreation}
								type="button"
							>
								Start Campaign
							</Button>
							<Button
								variant="outline"
								className="w-full"
								size="lg"
								onClick={handleViewTemplates}
								type="button"
							>
								View Templates
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

				<Card className="group flex h-full flex-col border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 transition hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20">
					<CardHeader className="pb-4 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 transition-colors group-hover:bg-primary/30">
							<Database className="h-6 w-6 text-primary" />
						</div>
						<CardTitle className="text-xl text-primary">
							Control Your Data
						</CardTitle>
						<CardDescription>
							View & manage campaigns, export lead lists, conduct A/B tests, and
							analyze your data
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col pt-0">
						<div className="flex flex-1 flex-col gap-3">
							<Button
								className="w-full"
								size="lg"
								onClick={navigateToCampaigns}
								type="button"
							>
								View & Manage Campaigns
							</Button>
							<Button
								variant="outline"
								className="w-full"
								size="lg"
								onClick={navigateToLeads}
								type="button"
							>
								Manage Leads
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="group flex h-full flex-col border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-400/10 transition hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/20">
					<CardHeader className="pb-4 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 transition-colors group-hover:bg-orange-500/30">
							<Download className="h-6 w-6 text-orange-600" />
						</div>
						<CardTitle className="text-xl text-orange-600">
							Browser Extension
						</CardTitle>
						<CardDescription>
							Enhance your workflow with our browser extension for seamless lead
							capture
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col pt-0">
						<div className="flex flex-1 flex-col gap-3">
							<Button
								variant="outline"
								className="w-full border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
								size="lg"
								onClick={() => {
									window.open("https://chrome.google.com/webstore", "_blank");
									toast("Browser extension download coming soon!");
								}}
								type="button"
							>
								<Download className="mr-2 h-4 w-4" />
								Download Extension
							</Button>
							<p className="text-center text-xs text-muted-foreground">
								Capture leads directly from any website
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Advanced Features Section */}
			<div className="mx-auto mt-8 max-w-5xl">
				<div className="text-center mb-6">
					<h3 className="text-lg font-semibold text-foreground mb-2">
						Advanced Features
					</h3>
					<p className="text-sm text-muted-foreground">
						Powerful tools for comprehensive lead management and analysis
					</p>
				</div>
				<div className="flex flex-wrap justify-center gap-3">
					<Badge
						variant="secondary"
						className="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-primary/10 transition-colors"
						onClick={() =>
							toast.info(
								"Export lead lists to CSV, Excel, and other formats coming soon!",
							)
						}
					>
						📤 Export Lead Lists
					</Badge>
					<Badge
						variant="secondary"
						className="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-primary/10 transition-colors"
						onClick={() =>
							toast.info(
								"A/B testing framework for campaign optimization coming soon!",
							)
						}
					>
						🧪 Run A/B Tests
					</Badge>
					<Badge
						variant="secondary"
						className="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-primary/10 transition-colors"
						onClick={() =>
							toast.info(
								"Advanced analytics dashboard with insights and reporting coming soon!",
							)
						}
					>
						📊 Data Analysis
					</Badge>
					<Badge
						variant="secondary"
						className="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-primary/10 transition-colors"
						onClick={() =>
							toast.info(
								"Smart webpage scanning for contact information coming soon!",
							)
						}
					>
						📄 Scan Webpages
					</Badge>
					<Badge
						variant="secondary"
						className="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-primary/10 transition-colors"
						onClick={() =>
							toast.info(
								"One-click dialing from any webpage contact information coming soon!",
							)
						}
					>
						📞 Auto-Dial Contacts
					</Badge>
					<Badge
						variant="secondary"
						className="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-primary/10 transition-colors"
						onClick={() =>
							toast.info(
								"Unified inbox for texts, emails, and lead communications coming soon!",
							)
						}
					>
						💬 Message Management
					</Badge>
				</div>
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
				isOpen={showCampaignModal}
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
