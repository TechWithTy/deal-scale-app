"use client";

import type { FC } from "react";
import { useState } from "react";

import type {
	QuickStartCardChipTone,
	QuickStartCardConfig,
} from "@/components/quickstart/types";
import { FeatureGuard } from "@/components/access/FeatureGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/_utils";
import { ExternalLink, Loader2, Target } from "lucide-react";
import { BorderBeam } from "@/components/magicui/border-beam";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import {
	quickStartPersonas,
	getGoalDefinition,
	getGoalsForPersona,
} from "@/lib/config/quickstart/wizardFlows";
import { useQuickStartWizardStore } from "@/lib/stores/quickstartWizard";
import { HoldableGoalButton } from "@/components/quickstart/HoldableGoalButton";
import { useGoalFlowExecutor } from "@/hooks/useGoalFlowExecutor";
import type { WebhookStage } from "@/lib/stores/dashboard";
import { useLeadListStore } from "@/lib/stores/leadList";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

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
	const { open: openWizard } = useQuickStartWizardStore();
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
				}) => {
					// For wizard card, separate persona/goal chips
					const isWizardCard = key === "wizard";
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
							className={cn(
								"group flex w-full flex-col border-2 transition hover:border-primary/20 hover:shadow-lg",
								cardClassName,
							)}
						>
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
								<div className="absolute top-3 right-3 z-10 flex flex-wrap gap-1.5 justify-end max-w-[50%]">
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

							<CardHeader className="pb-4 text-center">
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
							<CardContent className="flex flex-col pt-0">
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
																await onClick?.();
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
									{isWizardCard && personaId && (
										<>
											{getGoalsForPersona(personaId)
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
										</>
									)}

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
