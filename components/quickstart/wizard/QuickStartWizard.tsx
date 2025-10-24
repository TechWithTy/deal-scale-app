"use client";

import type { FC } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getQuickStartTemplate } from "@/lib/config/quickstart/templates";
import {
	QUICK_START_DEFAULT_STEP,
	type QuickStartWizardStep,
	useQuickStartWizardStore,
} from "@/lib/stores/quickstartWizard";

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

const QuickStartWizard: FC = () => {
	const { isOpen, activeStep, activePreset, goToStep, close } =
		useQuickStartWizardStore();

	if (!isOpen) {
		return null;
	}

	const template =
		activePreset?.templateId && getQuickStartTemplate(activePreset.templateId);
	const stepMeta =
		STEP_METADATA[activeStep] ?? STEP_METADATA[QUICK_START_DEFAULT_STEP];

	return (
		<Card
			data-testid="quickstart-wizard"
			className="mx-auto mt-10 w-full max-w-5xl border-2"
		>
			<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<CardTitle className="text-2xl">QuickStart Wizard</CardTitle>
					<CardDescription>
						{template
							? `Template: ${template.label}`
							: "Follow the guided steps to launch your DealScale workflow."}
					</CardDescription>
				</div>
				<Button type="button" variant="ghost" onClick={close}>
					Close Wizard
				</Button>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
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
				<div className="rounded-lg border bg-muted/30 p-6">
					<h3 className="mb-2 font-semibold text-xl">{stepMeta.title}</h3>
					<p className="text-muted-foreground text-sm leading-relaxed">
						{stepMeta.description}
					</p>
				</div>
			</CardContent>
		</Card>
	);
};

export default QuickStartWizard;
