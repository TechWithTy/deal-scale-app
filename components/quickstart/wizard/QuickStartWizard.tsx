"use client";

import type { FC } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { getQuickStartTemplate } from "@/lib/config/quickstart/templates";
import {
	QUICK_START_DEFAULT_STEP,
	type QuickStartWizardStep,
	useQuickStartWizardStore,
} from "@/lib/stores/quickstartWizard";
import LeadCaptureStep from "./steps/LeadCaptureStep";
import LeadIntakeStep from "./steps/LeadIntakeStep";
import MarketDiscoveryStep from "./steps/MarketDiscoveryStep";
import CampaignBasicsStep from "./steps/CampaignBasicsStep";
import ReviewStep from "./steps/ReviewStep";
import TestAndLaunchStep from "./steps/TestAndLaunchStep";

const WIZARD_STEPS: QuickStartWizardStep[] = [
	"lead-intake",
	"market-discovery",
	"campaign-basics",
	"review",
	"test-and-launch",
	"lead-capture",
];

const STEP_METADATA: Record<
	QuickStartWizardStep,
	{ title: string; description: string }
> = {
	"lead-intake": {
		title: "Lead Intake",
		description:
			"Upload lists, capture leads from integrations, or sync saved searches to prime your pipeline.",
	},
	"market-discovery": {
		title: "Market Discovery",
		description:
			"Explore distressed opportunities and geo-target segments to fuel your campaigns with intelligence.",
	},
	"campaign-basics": {
		title: "Campaign Basics",
		description:
			"Configure channels, cadences, and agent assignments before activating automations.",
	},
	review: {
		title: "Review",
		description:
			"Confirm your targeting, messaging, and safeguards before handing off to the launch step.",
	},
	"test-and-launch": {
		title: "Test & Launch",
		description:
			"Validate routing, deliverability, and handoffs—then activate the campaign when everything looks good.",
	},
	"lead-capture": {
		title: "Lead Capture",
		description:
			"Deploy browser extensions and on-site widgets to feed new contacts directly into DealScale.",
	},
};

const STEP_COMPONENTS: Record<QuickStartWizardStep, FC> = {
	"lead-intake": LeadIntakeStep,
	"market-discovery": MarketDiscoveryStep,
	"campaign-basics": CampaignBasicsStep,
	review: ReviewStep,
	"test-and-launch": TestAndLaunchStep,
	"lead-capture": LeadCaptureStep,
};

const QuickStartWizard: FC = () => {
	const { isOpen, activeStep, activePreset, goToStep, close } =
		useQuickStartWizardStore();

	const template =
		activePreset?.templateId && getQuickStartTemplate(activePreset.templateId);
	const stepMeta =
		STEP_METADATA[activeStep] ?? STEP_METADATA[QUICK_START_DEFAULT_STEP];
	const ActiveComponent =
		STEP_COMPONENTS[activeStep] ?? STEP_COMPONENTS[QUICK_START_DEFAULT_STEP];

	if (!isOpen) {
		return null;
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					close();
				}
			}}
		>
			<DialogContent
				data-testid="quickstart-wizard"
				className="w-full max-w-5xl space-y-6"
			>
				<DialogHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
					<div className="text-left">
						<DialogTitle className="text-2xl">QuickStart Wizard</DialogTitle>
						<DialogDescription>
							{template
								? `Template: ${template.label}`
								: "Follow the guided steps to launch your DealScale workflow."}
						</DialogDescription>
					</div>
					<Button type="button" variant="ghost" onClick={close}>
						Close Wizard
					</Button>
				</DialogHeader>
				<div className="flex flex-col gap-6">
					<div className="flex flex-wrap gap-2">
						{WIZARD_STEPS.map((step) => (
							<Button
								key={step}
								type="button"
								variant={step === activeStep ? "default" : "outline"}
								onClick={() => goToStep(step)}
								className="capitalize"
							>
								{STEP_METADATA[step].title}
							</Button>
						))}
					</div>
					<div className="space-y-4">
						<div className="rounded-lg border bg-muted/30 p-6">
							<h3 className="mb-2 text-xl font-semibold">{stepMeta.title}</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{stepMeta.description}
							</p>
						</div>
						<ActiveComponent />
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default QuickStartWizard;
