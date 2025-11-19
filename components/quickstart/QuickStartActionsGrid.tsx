"use client";

import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";

import { FeatureGuard } from "@/components/access/FeatureGuard";
import { BorderBeam } from "@/components/magicui/border-beam";
import { HoldableGoalButton } from "@/components/quickstart/HoldableGoalButton";
import { QuickStartCardMeteors } from "@/components/quickstart/QuickStartCardMeteors";
import type {
	QuickStartCardChipTone,
	QuickStartCardConfig,
} from "@/components/quickstart/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useGoalFlowExecutor } from "@/hooks/useGoalFlowExecutor";
import { cn } from "@/lib/_utils";
import {
	getGoalDefinition,
	getGoalsForPersona,
	quickStartPersonas,
} from "@/lib/config/quickstart/wizardFlows";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import type { WebhookStage } from "@/lib/stores/dashboard";
import { useLeadListStore } from "@/lib/stores/leadList";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { ExternalLink, Loader2, Target } from "lucide-react";

interface QuickStartActionsGridProps {
	readonly cards: QuickStartCardConfig[];
	readonly onLaunchGoalFlow?: () => void;
	readonly onImport?: () => void;
	readonly onCampaignCreate?: () => void;
	readonly onOpenWebhookModal?: (stage: WebhookStage) => void;
	readonly onStartNewSearch?: () => void;
	readonly onBrowserExtension?: () => void;
	readonly createRouterPush?: (path: string) => () => void;
}

const featureToneStyles: Record<QuickStartCardChipTone, string> = {
	primary: "border-primary/30 bg-primary/10 text-primary dark:text-primary-300",
	success:
		"border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
	warning:
		"border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
	info: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300",
	accent:
		"border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300",
	neutral:
		"border-muted bg-muted text-muted-foreground dark:text-muted-foreground",
};

type MeteorAssignment = {
	readonly intensity: "high" | "normal";
	readonly seed: number;
};

const assignMeteors = (cards: QuickStartCardConfig[]) => {
	const assignments = new Map<string, MeteorAssignment>();
	const eligibleCards = cards.filter((card) => card.key !== "wizard");
	const deterministicSeed = (key: string) => {
		let hash = 0;
		for (let index = 0; index < key.length; index += 1) {
			hash = (hash << 5) - hash + key.charCodeAt(index);
			hash |= 0;
		}
		const value = Math.abs(Math.sin(hash));
		return value % 1;
	};

	eligibleCards.forEach((card, index) => {
		assignments.set(card.key, {
			intensity: index < 2 ? "high" : "normal",
			seed: deterministicSeed(card.key),
		});
	});

	return assignments;
};

const QuickStartActionsGrid: FC<QuickStartActionsGridProps> = ({
	cards,
	onLaunchGoalFlow,
	onImport = () => {},
	onCampaignCreate = () => {},
	onOpenWebhookModal = () => {},
	onStartNewSearch = () => {},
	onBrowserExtension = () => {},
	createRouterPush = (path: string) => () => {},
}) => {
	const [loadingAction, setLoadingAction] = useState<string | null>(null);
	const { personaId, goalId, selectGoal } = useQuickStartWizardDataStore();
	const { open: openWizard, launchWithAction } = useQuickStartWizardStore();
	const leadListStore = useLeadListStore();
	const campaignStore = useCampaignCreationStore();

	// Set up goal flow executor with headless automation
	const { executeGoalFlow, retry, cancel } = useGoalFlowExecutor({
		onImport,
		onCampaignCreate,
		onOpenWebhookModal,
		onStartNewSearch,
		onBrowserExtension,
		createRouterPush,
		leadListStore,
		campaignStore,
		personaId,
	});

	const cardSignature = useMemo(
		() => cards.map((card) => card.key).join("|"),
		[cards],
	);

	const eligibleKeys = useMemo(
		() => cards.filter((card) => card.key !== "wizard").map((card) => card.key),
		[cards],
	);

	const [meteorAssignments, setMeteorAssignments] = useState<
		Map<string, MeteorAssignment>
	>(() => assignMeteors(cards));
	const [activeMeteorKey, setActiveMeteorKey] = useState<string | null>(
		() => eligibleKeys[0] ?? null,
	);

	useEffect(() => {
		setMeteorAssignments(assignMeteors(cards));
	}, [cards]);

	useEffect(() => {
		if (!eligibleKeys.length) {
			setActiveMeteorKey(null);
			return;
		}

		setActiveMeteorKey((previous) => {
			if (previous && eligibleKeys.includes(previous)) {
				return previous;
			}
			return eligibleKeys[0] ?? null;
		});
	}, [eligibleKeys]);

	useEffect(() => {
		if (eligibleKeys.length <= 1 || !activeMeteorKey) {
			return;
		}

		const delay = Math.floor(Math.random() * 20000) + 10000; // 10-30s
		const timer = window.setTimeout(() => {
			const currentIndex = eligibleKeys.indexOf(activeMeteorKey);
			const nextIndex =
				currentIndex === -1 ? 0 : (currentIndex + 1) % eligibleKeys.length;
			setActiveMeteorKey(eligibleKeys[nextIndex] ?? null);
		}, delay);

		return () => window.clearTimeout(timer);
	}, [eligibleKeys, activeMeteorKey]);

	return (
		<div className="mx-auto grid max-w-5xl items-start justify-items-stretch gap-6 px-4 md:grid-flow-dense md:grid-cols-2 md:px-0 xl:grid-cols-3">
			{cards.map(
				({
					key,
					title,
					description,
					icon: Icon,
					iconNode,
					actions,
					cardClassName,
					titleClassName,
					iconWrapperClassName,
					iconClassName,
					footer,
					featureChips,
					showBorderBeam,
					borderBeamConfig,
					wizardPreset,
				}) => {
					// For wizard card, separate persona/goal chips
					const isWizardCard = key === "wizard";
					const meteorConfig = meteorAssignments.get(key);
					const isActiveMeteor =
						meteorConfig && activeMeteorKey !== null && key === activeMeteorKey;
					const userPreferenceChips =
						isWizardCard && (personaId || goalId)
							? [
									...(personaId
										? [
												{
													label: `👤 ${quickStartPersonas.find((p) => p.id === personaId)?.title || personaId}`,
													tone: "primary" as QuickStartCardChipTone,
												},
											]
										: []),
									...(goalId
										? [
												{
													label: `🎯 ${getGoalDefinition(goalId)?.title || goalId}`,
													tone: "success" as QuickStartCardChipTone,
												},
											]
										: []),
								]
							: [];

					return (
						<Card
							key={key}
							data-beam-collider="true"
							className={cn(
								"group relative flex w-full flex-col overflow-hidden border-2 transition duration-300",
								isActiveMeteor
									? "-translate-y-1 border-primary/30 shadow-2xl shadow-primary/25"
									: "hover:-translate-y-1 hover:border-primary/35 hover:shadow-2xl",
								!isActiveMeteor && !meteorConfig
									? "hover:border-primary/20 hover:shadow-lg"
									: null,
								cardClassName,
							)}
						>
							{isActiveMeteor ? (
								<QuickStartCardMeteors
									intensity={meteorConfig.intensity}
									seed={meteorConfig.seed}
								/>
							) : null}
							{/* BorderBeam effect for featured cards */}
							{showBorderBeam && borderBeamConfig && (
								<BorderBeam
									size={borderBeamConfig.size}
									duration={borderBeamConfig.duration}
									delay={borderBeamConfig.delay}
									colorFrom={borderBeamConfig.colorFrom}
									colorTo={borderBeamConfig.colorTo}
								/>
							)}

							{/* User Preference Chips - Top Right Corner */}
							{isWizardCard && userPreferenceChips.length > 0 && (
								<div className="absolute top-3 right-3 z-10 flex max-w-[50%] flex-wrap justify-end gap-1.5">
									{userPreferenceChips.map(({ label, tone = "primary" }) => (
										<Badge
											key={label}
											variant="outline"
											className={cn(
												"border px-2.5 py-0.5 font-semibold text-[10px] shadow-md backdrop-blur-sm",
												featureToneStyles[tone],
											)}
										>
											{label}
										</Badge>
									))}
								</div>
							)}

							<CardHeader className="relative z-10 pb-4 text-center">
								<div
									className={cn(
										"mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20",
										iconWrapperClassName,
									)}
								>
									{iconNode ??
										(Icon ? (
											<Icon
												className={cn("h-6 w-6 text-primary", iconClassName)}
											/>
										) : null)}
								</div>
								<CardTitle className={cn("text-xl", titleClassName)}>
									{title}
								</CardTitle>
								<CardDescription>{description}</CardDescription>
								{featureChips?.length ? (
									<div className="mt-4 flex flex-wrap justify-center gap-2">
										{featureChips.map(({ label, tone = "primary" }) => (
											<Badge
												key={label}
												variant="outline"
												className={cn(
													"border px-3 py-1 font-medium text-[11px]",
													featureToneStyles[tone],
												)}
											>
												{label}
											</Badge>
										))}
									</div>
								) : null}
							</CardHeader>
							<CardContent className="relative z-10 flex flex-col pt-0">
								<div className="flex flex-col gap-3">
									{actions.map(
										({
											label,
											icon: ActionIcon,
											variant,
											className,
											onClick,
											isRoute,
										}) => {
											const actionKey = `${key}-${label}`;
											const isLoading = loadingAction === actionKey;
											const isGuidedSetupButton =
												isWizardCard && label.includes("Guided Setup");

											// Determine if this action needs feature gating
											const needsGating =
												label === "Create AI Assistant" ||
												label === "Clone Voice";

											const button = (
												<div
													key={label}
													className={cn(
														"relative",
														isGuidedSetupButton && "overflow-hidden rounded-md",
													)}
												>
													{/* Add BorderBeam to Guided Setup button */}
													{isGuidedSetupButton && (
														<BorderBeam
															size={120}
															duration={5}
															delay={0}
															colorFrom="#fbbf24"
															colorTo="#a855f7"
														/>
													)}
													<Button
														type="button"
														size="lg"
														variant={variant}
														className={cn(
															"w-full justify-center gap-2",
															className,
														)}
														disabled={isLoading}
														onClick={async () => {
															setLoadingAction(actionKey);
															try {
																// Only launch wizard for explicit "Guided Setup" actions
																// All other actions execute directly, even if card has wizardPreset
																// This decouples wizard launch from regular action execution
																if (
																	isGuidedSetupButton &&
																	wizardPreset &&
																	onLaunchGoalFlow
																) {
																	// Guided Setup button: launch wizard with onLaunchGoalFlow as the action
																	// This ensures the action executes the flow directly, not reopening the wizard
																	launchWithAction(
																		wizardPreset,
																		onLaunchGoalFlow,
																	);
																} else {
																	// All other actions: execute directly without wizard
																	await onClick?.();
																}
															} finally {
																// Clear loading after a brief delay
																setTimeout(() => setLoadingAction(null), 500);
															}
														}}
													>
														{isLoading ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<ActionIcon className="h-4 w-4" />
														)}
														{label}
														{isRoute && !isLoading && (
															<ExternalLink className="ml-2 h-3 w-3 opacity-50" />
														)}
													</Button>
												</div>
											);

											// Wrap with FeatureGuard if needed
											if (needsGating) {
												return (
													<FeatureGuard
														key={label}
														featureKey={
															label === "Create AI Assistant"
																? "ai-agents"
																: "voice-cloning"
														}
														fallbackTier="starter"
														fallbackMode="overlay"
														iconOnly={true}
														overlayContent={() => null}
													>
														{button}
													</FeatureGuard>
												);
											}

											return button;
										},
									)}

									{/* Dynamic Goal Buttons - After main actions */}
									{isWizardCard &&
										personaId &&
										getGoalsForPersona(personaId)
											.slice(0, 2)
											.map((goal) => {
												const isCurrentGoal = goalId === goal.id;

												return (
													<HoldableGoalButton
														key={goal.id}
														goal={goal}
														isCurrentGoal={isCurrentGoal}
														onNormalClick={() => {
															console.log(
																"[QuickStart] 🎯 Single click - opening first step normally",
																{
																	goalId: goal.id,
																	firstStep: goal.flow[0]?.cardId,
																},
															);

															// Select the goal first
															selectGoal(goal.id);

															// Open the first step modal (normal behavior)
															if (onLaunchGoalFlow) {
																onLaunchGoalFlow();
															}
														}}
														onHoldComplete={async () => {
															// Hold complete: Always execute full automated flow
															selectGoal(goal.id);

															console.log(
																"[QuickStart] Hold complete - running full automation",
																{
																	goalId: goal.id,
																},
															);

															// Execute the entire flow automatically
															await executeGoalFlow(goal);
														}}
														onRetry={retry}
														onCancel={cancel}
													/>
												);
											})}
									{footer}
								</div>
							</CardContent>
						</Card>
					);
				},
			)}
		</div>
	);
};

export default QuickStartActionsGrid;
