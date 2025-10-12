"use client";

import { HelpCircle, List, Rss, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { campaignSteps } from "@/_tests/tours/campaignTour";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import CampaignModalMain from "@/components/reusables/modals/user/campaign/CampaignModalMain";
import LeadBulkSuiteModal from "@/components/reusables/modals/user/lead/LeadBulkSuiteModal";
import LeadModalMain from "@/components/reusables/modals/user/lead/LeadModalMain";
import SavedSearchModal from "@/components/reusables/modals/SavedSearchModal";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useBulkCsvUpload } from "@/components/quickstart/useBulkCsvUpload";
import { useQuickStartSavedSearches } from "@/components/quickstart/useQuickStartSavedSearches";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useModalStore } from "@/lib/stores/dashboard";
import type { WebhookStage } from "@/lib/stores/dashboard";

type CampaignContext = {
	readonly leadListId: string;
	readonly leadListName: string;
	readonly leadCount: number;
};

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
	const [campaignModalContext, setCampaignModalContext] =
		useState<CampaignContext | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const openWebhookModal = useModalStore((state) => state.openWebhookModal);

	const campaignStore = useCampaignCreationStore();
	const {
		savedSearches,
		deleteSavedSearch,
		setSearchPriority,
		handleCloseSavedSearches,
		handleSelectSavedSearch,
		savedSearchModalOpen,
	} = useQuickStartSavedSearches();

	const triggerFileInput = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleSelectList = useCallback(() => {
		setLeadModalMode("select");
		setShowLeadModal(true);
	}, []);

	const handleLaunchCampaign = useCallback(
		({ leadListId, leadListName, leadCount }: CampaignContext) => {
			campaignStore.reset();
			campaignStore.setAreaMode("leadList");
			campaignStore.setSelectedLeadListId(leadListId);
			campaignStore.setLeadCount(leadCount);
			campaignStore.setCampaignName(`${leadListName} Campaign`);
			setCampaignModalContext({ leadListId, leadListName, leadCount });
			setShowCampaignModal(true);
			setShowLeadModal(false);
		},
		[campaignStore],
	);

	const handleSuiteLaunchComplete = useCallback(
		(payload: CampaignContext) => {
			handleLaunchCampaign(payload);
			return true;
		},
		[handleLaunchCampaign],
	);

	const handleCloseLeadModal = useCallback(() => setShowLeadModal(false), []);

	const handleImportFromSource = useCallback(() => {
		triggerFileInput();
	}, [triggerFileInput]);

	const handleOpenWebhookModal = useCallback(
		(stage: WebhookStage) => openWebhookModal(stage),
		[openWebhookModal],
	);

	const handleStartTour = useCallback(() => setIsTourOpen(true), []);

	const handleCloseTour = useCallback(() => setIsTourOpen(false), []);

	const handleCampaignModalToggle = useCallback(
		(open: boolean) => {
			setShowCampaignModal(open);
			if (!open) {
				setCampaignModalContext(null);
				campaignStore.reset();
			}
		},
		[campaignStore],
	);

	const handleCloseBulkModal = useCallback(() => {
		setShowBulkSuiteModal(false);
		setBulkCsvFile(null);
		setBulkCsvHeaders([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	const handleCsvUpload = useBulkCsvUpload({
		onFileChange: setBulkCsvFile,
		onHeadersParsed: setBulkCsvHeaders,
		onShowModal: () => setShowBulkSuiteModal(true),
	});

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
							onClick={handleImportFromSource}
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
							onClick={() => handleOpenWebhookModal("incoming")}
							type="button"
						>
							Configure Incoming
						</Button>
						<Button
							variant="ghost"
							className="w-full border border-input"
							size="lg"
							onClick={() => handleOpenWebhookModal("outgoing")}
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
				isOpen={showCampaignModal}
				onOpenChange={handleCampaignModalToggle}
				initialLeadListId={campaignModalContext?.leadListId}
				initialLeadListName={campaignModalContext?.leadListName}
				initialLeadCount={campaignModalContext?.leadCount ?? 0}
				initialStep={0}
			/>

			<SavedSearchModal
				open={savedSearchModalOpen}
				onClose={handleCloseSavedSearches}
				savedSearches={savedSearches}
				onDelete={deleteSavedSearch}
				onSelect={handleSelectSavedSearch}
				onSetPriority={setSearchPriority}
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
