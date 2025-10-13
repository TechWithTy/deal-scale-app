"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import QuickStartActionsGrid from "@/components/quickstart/QuickStartActionsGrid";
import QuickStartBadgeList from "@/components/quickstart/QuickStartBadgeList";
import QuickStartHeader from "@/components/quickstart/QuickStartHeader";
import QuickStartHelp from "@/components/quickstart/QuickStartHelp";
import { useQuickStartCards } from "@/components/quickstart/useQuickStartCards";
import { useQuickStartSavedSearches } from "@/components/quickstart/useQuickStartSavedSearches";
import HelpModal from "@/components/reusables/modals/HelpModal";
import SavedSearchModal from "@/components/reusables/modals/SavedSearchModal";
import { CampaignModalMain } from "@/components/reusables/modals/user/campaign/CampaignModalMain";
import LeadBulkSuiteModal from "@/components/reusables/modals/user/lead/LeadBulkSuiteModal";
import LeadModalMain from "@/components/reusables/modals/user/lead/LeadModalMain";
import {
	useCampaignCreationStore,
	type CampaignCreationState,
} from "@/lib/stores/campaignCreation";
import { useModalStore } from "@/lib/stores/dashboard";
import type { WebhookStage } from "@/lib/stores/dashboard";
import { shallow } from "zustand/shallow";

void React;

interface CampaignContext {
	readonly leadListId: string;
	readonly leadListName: string;
	readonly leadCount: number;
}

export default function QuickStartPage() {
	const [showLeadModal, setShowLeadModal] = useState(false);
	const [leadModalMode, setLeadModalMode] = useState<"select" | "create">(
		"create",
	);
	const [showWalkthrough, setShowWalkthrough] = useState(false);
	const [showHelpModal, setShowHelpModal] = useState(false);
	const [showBulkSuiteModal, setShowBulkSuiteModal] = useState(false);
	const [showCampaignModal, setShowCampaignModal] = useState(false);
	const [campaignModalContext, setCampaignModalContext] =
		useState<CampaignContext | null>(null);
	const previousCampaignModalOpenRef = useRef(showCampaignModal);
	const campaignResetTimeoutRef = useRef<number | null>(null);
	const quickstartDebugEnabled = process.env.NODE_ENV !== "production" && false; // Temporarily disabled for browser compatibility testing
	const logQuickStartDebug = useCallback(
		(phase: string, details: Record<string, unknown>) => {
			if (!quickstartDebugEnabled) return;
			// eslint-disable-next-line no-console -- intentional debug surface for modal close loops
			console.debug(`[QuickStart] ${phase}`, details);
		},
		[quickstartDebugEnabled],
	);
	const logQuickStartWarn = useCallback(
		(phase: string, details: Record<string, unknown>) => {
			if (!quickstartDebugEnabled) return;
			// eslint-disable-next-line no-console -- intentional debug surface for modal close loops
			console.warn(`[QuickStart] ${phase}`, details);
		},
		[quickstartDebugEnabled],
	);
	const campaignModalTransitionRef = useRef({
		lastState: false,
		lastTimestamp: 0,
		rapidTransitionCount: 0,
	});
	const previousCampaignContextRef = useRef<CampaignContext | null>(
		campaignModalContext,
	);

	const router = useRouter();
	const openWebhookModal = useModalStore((state) => state.openWebhookModal);
	const {
		reset: resetCampaignStore,
		setAreaMode,
		setSelectedLeadListId,
		setLeadCount,
		setCampaignName,
	} = useCampaignCreationStore(
		(state: CampaignCreationState) => ({
			reset: state.reset,
			setAreaMode: state.setAreaMode,
			setSelectedLeadListId: state.setSelectedLeadListId,
			setLeadCount: state.setLeadCount,
			setCampaignName: state.setCampaignName,
		}),
		shallow,
	);

	const {
		savedSearches,
		deleteSavedSearch,
		setSearchPriority,
		handleStartNewSearch,
		handleOpenSavedSearches,
		handleCloseSavedSearches,
		handleSelectSavedSearch,
		savedSearchModalOpen,
	} = useQuickStartSavedSearches();

	const handleSelectList = useCallback(() => {
		setLeadModalMode("select");
		setShowLeadModal(true);
	}, []);

	const handleLaunchCampaign = useCallback(
		({ leadListId, leadListName, leadCount }: CampaignContext) => {
			resetCampaignStore();
			setAreaMode("leadList");
			setSelectedLeadListId(leadListId);
			setLeadCount(leadCount);
			setCampaignName(`${leadListName} Campaign`);
			logQuickStartDebug("campaign-modal-launch-request", {
				leadListId,
				leadListName,
				leadCount,
				stack: new Error("campaign-modal-launch-request").stack,
			});
			setCampaignModalContext({ leadListId, leadListName, leadCount });
			setShowCampaignModal(true);
			setShowLeadModal(false);
		},
		[
			resetCampaignStore,
			setAreaMode,
			setSelectedLeadListId,
			setLeadCount,
			setCampaignName,
			logQuickStartDebug,
		],
	);

	const handleSuiteLaunchComplete = useCallback(
		(payload: CampaignContext) => {
			logQuickStartDebug("campaign-modal-bulk-suite-request", {
				payload,
				stack: new Error("campaign-modal-bulk-suite-request").stack,
			});
			handleLaunchCampaign(payload);
			return true;
		},
		[handleLaunchCampaign, logQuickStartDebug],
	);

	const handleCloseLeadModal = useCallback(() => setShowLeadModal(false), []);

	const handleConnectionSettings = useCallback(
		() =>
			toast.info("Data source connections and API configuration coming soon!"),
		[],
	);

	const handleImportFromSource = useCallback(
		() => setShowBulkSuiteModal(true),
		[],
	);

	const handleCampaignCreation = useCallback(() => {
		resetCampaignStore();
		setAreaMode("leadList");
		logQuickStartDebug("campaign-modal-new-campaign", {
			stack: new Error("campaign-modal-new-campaign").stack,
		});
		setCampaignModalContext(null);
		setShowCampaignModal(true);
	}, [resetCampaignStore, setAreaMode, logQuickStartDebug]);

	const handleViewTemplates = useCallback(
		() => toast.info("Campaign templates feature coming soon!"),
		[],
	);

	const handleOpenWebhookModal = useCallback(
		(stage: WebhookStage) => openWebhookModal(stage),
		[openWebhookModal],
	);

	const handleWalkthroughOpen = useCallback(() => setShowHelpModal(true), []);

	const handleBrowserExtension = useCallback(() => {
		window.open("https://chrome.google.com/webstore", "_blank");
		toast("Browser extension download coming soon!");
	}, []);

	const createRouterPush = useCallback(
		(path: string) => () => {
			router.push(path);
		},
		[router],
	);

	const handleCampaignModalToggle = useCallback(
		(open: boolean) => {
			logQuickStartDebug("campaign-modal-open-change", {
				open,
				origin: "CampaignModalMain.onOpenChange",
				stack: new Error("campaign-modal-open-change").stack,
			});
			setShowCampaignModal(open);
		},
		[logQuickStartDebug],
	);

	const handleCampaignLaunched = useCallback(
		({
			campaignId,
			channelType,
		}: { campaignId: string; channelType: string }) => {
			logQuickStartDebug("campaign-modal-launched", {
				campaignId,
				channelType,
				stack: new Error("campaign-modal-launched").stack,
			});
			setShowCampaignModal(false);

			logQuickStartDebug("campaign-modal-opening-webhooks", {
				campaignId,
				channelType,
				stack: new Error("campaign-modal-opening-webhooks").stack,
			});

			// Open webhooks outgoing modal instead of navigating to campaigns
			openWebhookModal("outgoing");
		},
		[openWebhookModal, logQuickStartDebug],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const previous = previousCampaignContextRef.current;
		if (previous !== campaignModalContext) {
			logQuickStartDebug("campaign-modal-context-changed", {
				previous,
				next: campaignModalContext,
			});
			previousCampaignContextRef.current = campaignModalContext;
		}
	}, [campaignModalContext, logQuickStartDebug]);

	useEffect(() => {
		const now = Date.now(); // Use Date.now() instead of performance.now() for better browser compatibility
		const previousState = campaignModalTransitionRef.current.lastState;
		const timeSinceLast =
			now - campaignModalTransitionRef.current.lastTimestamp;
		const nextRapidTransitionCount =
			previousState === showCampaignModal
				? campaignModalTransitionRef.current.rapidTransitionCount
				: timeSinceLast < 750
					? campaignModalTransitionRef.current.rapidTransitionCount + 1
					: 1;

		campaignModalTransitionRef.current = {
			lastState: showCampaignModal,
			lastTimestamp: now,
			rapidTransitionCount: nextRapidTransitionCount,
		};

		logQuickStartDebug("campaign-modal-visibility-updated", {
			previous: previousState,
			next: showCampaignModal,
			deltaMs: timeSinceLast,
			rapidTransitionCount: nextRapidTransitionCount,
			contextPresent: Boolean(campaignModalContext),
		});

		if (nextRapidTransitionCount > 3 && previousState !== showCampaignModal) {
			// Reduced from 5 to 3 for better compatibility
			logQuickStartWarn("campaign-modal-rapid-toggle-detected", {
				transitions: nextRapidTransitionCount,
				deltaMs: timeSinceLast,
				stack: new Error("campaign-modal-rapid-toggle").stack,
			});
		}
	}, [
		showCampaignModal,
		campaignModalContext,
		logQuickStartDebug,
		logQuickStartWarn,
	]);

	useEffect(() => {
		const wasOpen = previousCampaignModalOpenRef.current;
		previousCampaignModalOpenRef.current = showCampaignModal;

		if (wasOpen && !showCampaignModal) {
			logQuickStartDebug("campaign-modal-close-observed", {
				source: "visibility-effect",
				campaignModalContext,
			});
			setCampaignModalContext(null);

			// Clear any existing timeout before setting a new one
			if (campaignResetTimeoutRef.current !== null) {
				clearTimeout(campaignResetTimeoutRef.current);
			}

			logQuickStartDebug("campaign-modal-close-detected", {
				source: "launch-or-dismiss",
			});

			// Use a more conservative timeout for better browser compatibility
			campaignResetTimeoutRef.current = window.setTimeout(() => {
				logQuickStartDebug("campaign-store-reset", {
					reason: "modal-close-timer",
				});
				resetCampaignStore();
				campaignResetTimeoutRef.current = null;
			}, 300); // Increased from 150ms to 300ms for better compatibility

			return () => {
				if (campaignResetTimeoutRef.current !== null) {
					clearTimeout(campaignResetTimeoutRef.current);
					campaignResetTimeoutRef.current = null;
				}
			};
		}

		if (!showCampaignModal && campaignResetTimeoutRef.current !== null) {
			logQuickStartDebug("campaign-modal-close-cleanup", {
				hasTimeout: true,
			});
			return () => {
				if (campaignResetTimeoutRef.current !== null) {
					clearTimeout(campaignResetTimeoutRef.current);
					campaignResetTimeoutRef.current = null;
				}
			};
		}

		return undefined;
	}, [
		showCampaignModal,
		resetCampaignStore,
		logQuickStartDebug,
		setCampaignModalContext,
	]);

	useEffect(
		() => () => {
			if (campaignResetTimeoutRef.current !== null) {
				logQuickStartDebug("campaign-modal-timeout-dispose", {
					reason: "component-unmount",
				});
				clearTimeout(campaignResetTimeoutRef.current);
				campaignResetTimeoutRef.current = null;
			}
		},
		[],
	);

	const handleCloseBulkModal = useCallback(
		() => setShowBulkSuiteModal(false),
		[],
	);

	const cards = useQuickStartCards({
		onImport: handleImportFromSource,
		onSelectList: handleSelectList,
		onConfigureConnections: handleConnectionSettings,
		onCampaignCreate: handleCampaignCreation,
		onViewTemplates: handleViewTemplates,
		onOpenWebhookModal: handleOpenWebhookModal,
		onBrowserExtension: handleBrowserExtension,
		createRouterPush,
		onStartNewSearch: handleStartNewSearch,
		onOpenSavedSearches: handleOpenSavedSearches,
	});

	return (
		<div className="container mx-auto px-4 py-8">
			<QuickStartHeader onOpenWalkthrough={handleWalkthroughOpen} />

			{/* <div className="mb-10 flex justify-center">
				<QuickStartBadgeList />
			</div> */}

			<QuickStartActionsGrid cards={cards} />

			<QuickStartHelp />

			<LeadModalMain
				isOpen={showLeadModal}
				onClose={handleCloseLeadModal}
				initialListMode={leadModalMode}
				onLaunchCampaign={handleLaunchCampaign}
			/>

			<LeadBulkSuiteModal
				isOpen={showBulkSuiteModal}
				onClose={handleCloseBulkModal}
				initialCsvFile={null}
				initialCsvHeaders={[]}
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
				onCampaignLaunched={handleCampaignLaunched}
			/>

			<SavedSearchModal
				open={savedSearchModalOpen}
				onClose={handleCloseSavedSearches}
				savedSearches={savedSearches}
				onDelete={deleteSavedSearch}
				onSelect={handleSelectSavedSearch}
				onSetPriority={setSearchPriority}
			/>

			<HelpModal
				isOpen={showHelpModal}
				onClose={() => setShowHelpModal(false)}
			/>
		</div>
	);
}
