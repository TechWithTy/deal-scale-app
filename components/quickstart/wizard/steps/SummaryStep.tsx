import type { FC } from "react";

import type { QuickStartTemplateDefinition } from "@/lib/config/quickstart/templates";
import type {
	QuickStartFlowStepDefinition,
	QuickStartGoalDefinition,
} from "@/lib/config/quickstart/wizardFlows";

interface SummaryStepProps {
	readonly goal: QuickStartGoalDefinition | null;
	readonly steps: readonly (QuickStartFlowStepDefinition & {
		readonly title: string;
		readonly description: string;
	})[];
	readonly template: QuickStartTemplateDefinition | null;
}

const SummaryStep: FC<SummaryStepProps> = ({ goal, steps, template }) => {
	if (!goal) {
		return (
			<div className="space-y-4" data-testid="quickstart-summary-step">
				<p className="text-muted-foreground text-sm">
					Select a persona and goal to see your personalized launch plan.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6" data-testid="quickstart-summary-step">
			<div className="space-y-2">
				<h3 className="font-semibold text-xl">{goal.title}</h3>
				<p className="text-muted-foreground text-sm leading-relaxed">
					{goal.outcome}
				</p>
			</div>
			<ol className="space-y-4">
				{steps.map((step, index) => (
					<li
						key={`${step.cardId}-${index}`}
						className="flex gap-4 rounded-lg border border-primary/40 border-dashed bg-primary/5 p-4"
					>
						<span className="mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary font-semibold text-background">
							{index + 1}
						</span>
						<div className="space-y-1">
							<p className="font-medium text-lg">{step.title}</p>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{step.description}
							</p>
							<p className="text-primary text-sm leading-relaxed">
								{step.note}
							</p>
						</div>
					</li>
				))}
			</ol>
			{template ? (
				<div
					className="space-y-2 rounded-lg border bg-muted/10 p-4"
					data-testid="quickstart-summary-template"
				>
					<h4 className="font-semibold text-lg">{template.summary.headline}</h4>
					<ul className="list-disc space-y-1 pl-5 text-muted-foreground text-sm">
						{template.summary.bullets.map((bullet) => (
							<li key={bullet}>{bullet}</li>
						))}
					</ul>
				</div>
			) : null}
		</div>
	);
};

export default SummaryStep;
