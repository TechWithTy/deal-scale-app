"use client";

import { HelpCircle, List, Rss, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { campaignSteps } from "@/_tests/tours/campaignTour";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import CampaignModalMain from "@/components/reusables/modals/user/campaign/CampaignModalMain";
import LeadBulkSuiteModal from "@/components/reusables/modals/user/lead/LeadBulkSuiteModal";
import LeadModalMain from "@/components/reusables/modals/user/lead/LeadModalMain";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useModalStore } from "@/lib/stores/dashboard";

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

	const resetCampaignStore = useCampaignCreationStore((state) => state.reset);
	const setAreaMode = useCampaignCreationStore((state) => state.setAreaMode);
	const setSelectedLeadListId = useCampaignCreationStore(
		(state) => state.setSelectedLeadListId,
	);
	const setLeadCount = useCampaignCreationStore((state) => state.setLeadCount);
	const setCampaignName = useCampaignCreationStore(
		(state) => state.setCampaignName,
	);
	const openWebhookModal = useModalStore((state) => state.openWebhookModal);

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
				<h1 className="mb-2 font-bold text-3xl text-foreground">Quick Start</h1>
				<p className="text-lg text-muted-foreground">
					Get up and running in minutes. Choose how you’d like to begin.
				</p>
				<button
					onClick={() => setShowWalkthrough(true)}
					className="absolute top-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-muted-foreground transition hover:bg-muted"
					type="button"
				>
					<HelpCircle className="h-5 w-5" />
				</button>
			</div>

			<div className="mx-auto grid max-w-6xl items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
				<Card className="group flex h-full flex-col border-2 transition hover:border-primary/20 hover:shadow-lg">
					<CardHeader className="pb-4 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
							<Upload className="h-6 w-6 text-primary" />
						</div>
						<CardTitle className="text-xl">Create List</CardTitle>
						<CardDescription>
							Upload a CSV to build a new lead list and map your columns
							instantly.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col pt-0">
						<div className="flex flex-1 flex-col gap-3">
							<Button
								variant="outline"
								className="w-full"
								size="lg"
								onClick={triggerFileInput}
								type="button"
							>
								<Upload className="mr-2 h-4 w-4" />
								{bulkCsvFile ? "Change CSV File" : "Upload CSV File"}
							</Button>

							{bulkCsvFile && (
								<div className="text-center text-muted-foreground text-sm">
									<p className="font-medium">{bulkCsvFile.name}</p>
									<p className="text-xs">
										{bulkCsvHeaders.length} columns detected
									</p>
									<p className="text-xs">
										We’ll open the list wizard to finish setup.
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<Card className="group flex h-full flex-col border-2 transition hover:border-primary/20 hover:shadow-lg">
					<CardHeader className="pb-4 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
							<List className="h-6 w-6 text-primary" />
						</div>
						<CardTitle className="text-xl">Select List</CardTitle>
						<CardDescription>
							Choose from your existing lead lists to work with
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col pt-0">
						<Button
							variant="outline"
							className="w-full"
							size="lg"
							onClick={handleSelectList}
							type="button"
						>
							Browse Lists
						</Button>
					</CardContent>
				</Card>

				<Card className="group flex h-full flex-col border-2 transition hover:border-primary/20 hover:shadow-lg">
					<CardHeader className="pb-4 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
							<Upload className="h-6 w-6 text-primary" />
						</div>
						<CardTitle className="text-xl">Import Data</CardTitle>
						<CardDescription>
							Upload your existing lead data or connect external sources
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col pt-0">
						<Button
							variant="outline"
							className="w-full"
							size="lg"
							onClick={handleImportData}
							type="button"
						>
							Import Leads
						</Button>
					</CardContent>
				</Card>

				<Card className="group flex h-full flex-col border-2 transition hover:border-primary/20 hover:shadow-lg">
					<CardHeader className="pb-4 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
							<Rss className="h-6 w-6 text-primary" />
						</div>
						<CardTitle className="text-xl">Webhooks &amp; Feeds</CardTitle>
						<CardDescription>
							Connect DealScale with your CRM and publish lead updates
							instantly.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col gap-3 pt-0">
						<Button
							variant="outline"
							className="w-full"
							size="lg"
							onClick={openWebhookModal}
							type="button"
						>
							Configure Incoming
						</Button>
						<Button
							variant="ghost"
							className="w-full border border-input"
							size="lg"
							onClick={openWebhookModal}
							type="button"
						>
							Configure Outgoing
						</Button>
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
					<h3 className="mb-2 font-semibold text-lg">
						Need Help Getting Started?
					</h3>
					<p className="mb-4 text-muted-foreground text-sm">
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
