"use client";

import { useEffect, useMemo, useRef } from "react";
import { shallow } from "zustand/shallow";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import PersonaStep from "@/components/quickstart/wizard/steps/PersonaStep";
import GoalStep from "@/components/quickstart/wizard/steps/GoalStep";
import SummaryStep from "@/components/quickstart/wizard/steps/SummaryStep";
import { quickStartCardDescriptors } from "@/lib/config/quickstart";
import {
	applyQuickStartTemplatePreset,
	getQuickStartTemplate,
} from "@/lib/config/quickstart/templates";
import {
	getGoalDefinition,
	getGoalsForPersona,
	quickStartPersonas,
	type QuickStartGoalId,
	type QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";
import {
	QUICK_START_DEFAULT_STEP,
	type QuickStartWizardStep,
	useQuickStartWizardStore,
} from "@/lib/stores/quickstartWizard";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

const STEP_ORDER: readonly QuickStartWizardStep[] = [
	"persona",
	"goal",
	"summary",
];

const QuickStartWizard = () => {
	const {
		isOpen,
		activeStep,
		activePreset,
		pendingAction,
		goToStep,
		cancel,
		complete,
	} = useQuickStartWizardStore(
		(state) => ({
			isOpen: state.isOpen,
			activeStep: state.activeStep,
			activePreset: state.activePreset,
			pendingAction: state.pendingAction,
			goToStep: state.goToStep,
			cancel: state.cancel,
			complete: state.complete,
		}),
		shallow,
	);
	const { personaId, goalId, selectPersona, selectGoal } =
		useQuickStartWizardDataStore();

	const personaOptions = quickStartPersonas;
	const goalOptions = personaId ? getGoalsForPersona(personaId) : [];
	const selectedGoal = goalId ? getGoalDefinition(goalId) : null;
	const templateId =
		activePreset?.templateId ?? selectedGoal?.templateId ?? null;
	const template = templateId ? getQuickStartTemplate(templateId) : null;
	const lastAppliedTemplateId = useRef<typeof templateId>(null);

	useEffect(() => {
		if (!isOpen) {
			lastAppliedTemplateId.current = null;
			return;
		}

		if (!templateId) {
			return;
		}

		if (lastAppliedTemplateId.current === templateId) {
			return;
		}

		applyQuickStartTemplatePreset(
			templateId,
			useCampaignCreationStore.getState(),
		);
		lastAppliedTemplateId.current = templateId;
	}, [isOpen, templateId]);

	const cardDescriptorById = useMemo(() => {
		const entries = quickStartCardDescriptors.map(
			(descriptor) =>
				[
					descriptor.id,
					{
						title: descriptor.title,
						description: descriptor.description,
					},
				] as const,
		);

		return new Map(entries);
	}, []);

	const summarySteps = useMemo(() => {
		if (!selectedGoal) {
			return [];
		}

		return selectedGoal.flow
			.map((flowStep) => {
				const descriptor = cardDescriptorById.get(flowStep.cardId);
				if (!descriptor) {
					return null;
				}

				return {
					...flowStep,
					title: descriptor.title,
					description: descriptor.description,
				};
			})
			.filter((step): step is NonNullable<typeof step> => step !== null);
	}, [cardDescriptorById, selectedGoal]);

	if (!isOpen) {
		return null;
	}

	const stepIndex = STEP_ORDER.indexOf(activeStep);
	const progressLabel =
		stepIndex >= 0 ? `Step ${stepIndex + 1} of ${STEP_ORDER.length}` : null;

	const handlePersonaSelect = (nextPersonaId: QuickStartPersonaId) => {
		selectPersona(nextPersonaId);
		goToStep("goal");
	};

	const handleGoalSelect = (nextGoalId: QuickStartGoalId) => {
		selectGoal(nextGoalId);
		goToStep("summary");
	};

	const handleBack = () => {
		if (activeStep === "goal") {
			goToStep("persona");
			return;
		}

		if (activeStep === "summary") {
			goToStep("goal");
		}
	};

	const handlePrimary = () => {
		if (activeStep === "persona") {
			goToStep("goal");
			return;
		}

		if (activeStep === "goal") {
			if (goalId) {
				goToStep("summary");
			}
			return;
		}

		complete();
	};

	const hasPendingAction = Boolean(pendingAction);
	const primaryLabel =
		activeStep === "summary"
			? hasPendingAction
				? "Close & start plan"
				: "Close wizard"
			: activeStep === "goal"
				? "Generate plan"
				: "Continue";
	const primaryDisabled =
		(activeStep === "persona" && !personaId) ||
		(activeStep === "goal" && !goalId);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					cancel();
				}
			}}
		>
			<DialogContent
				data-testid="quickstart-wizard"
				className="w-full max-w-5xl space-y-6"
			>
				<DialogHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
					<div className="text-left space-y-1">
						<DialogTitle className="text-2xl">QuickStart Wizard</DialogTitle>
						<DialogDescription>
							{template
								? `Template: ${template.label}`
								: "We’ll guide you through the exact cards to launch your workflow."}
						</DialogDescription>
					</div>
					<Button type="button" variant="ghost" onClick={cancel}>
						Close Wizard
					</Button>
				</DialogHeader>
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<span className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
							{progressLabel ?? "QuickStart"}
						</span>
						{personaId ? (
							<span className="rounded-full bg-primary/10 px-3 py-1 text-primary text-xs font-medium">
								Persona:{" "}
								{personaOptions.find((persona) => persona.id === personaId)
									?.title ?? ""}
							</span>
						) : null}
					</div>
					{activeStep === "persona" ? (
						<PersonaStep
							personas={personaOptions}
							selectedPersonaId={personaId}
							onSelect={handlePersonaSelect}
						/>
					) : null}
					{activeStep === "goal" ? (
						<GoalStep
							goals={goalOptions}
							selectedGoalId={goalId}
							onSelect={handleGoalSelect}
						/>
					) : null}
					{activeStep === "summary" ? (
						<SummaryStep
							goal={selectedGoal}
							steps={summarySteps}
							template={template}
						/>
					) : null}
					<div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="text-muted-foreground text-sm">
							{activeStep === "summary"
								? "Follow the plan below in order—each card is ready when you close the wizard."
								: "You can revisit previous steps at any time."}
						</div>
						<div className="flex items-center gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={handleBack}
								disabled={activeStep === QUICK_START_DEFAULT_STEP}
							>
								Back
							</Button>
							<Button
								type="button"
								onClick={handlePrimary}
								disabled={primaryDisabled}
							>
								{primaryLabel}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default QuickStartWizard;
