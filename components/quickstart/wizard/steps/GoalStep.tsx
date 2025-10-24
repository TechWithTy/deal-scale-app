import type { FC } from "react";

import { cn } from "@/lib/_utils";
import type {
	QuickStartGoalDefinition,
	QuickStartGoalId,
} from "@/lib/config/quickstart/wizardFlows";

interface GoalStepProps {
	readonly goals: readonly QuickStartGoalDefinition[];
	readonly selectedGoalId: QuickStartGoalId | null;
	readonly onSelect: (goalId: QuickStartGoalId) => void;
}

const GoalStep: FC<GoalStepProps> = ({ goals, selectedGoalId, onSelect }) => (
	<div className="space-y-6" data-testid="quickstart-goal-step">
		<p className="text-muted-foreground text-sm">
			Choose the outcome you care about most. We’ll assemble the essential steps
			automatically.
		</p>
		<div className="grid gap-4 md:grid-cols-2">
			{goals.map((goal) => {
				const isSelected = goal.id === selectedGoalId;
				return (
					<button
						key={goal.id}
						type="button"
						data-testid={`quickstart-goal-option-${goal.id}`}
						aria-pressed={isSelected}
						onClick={() => onSelect(goal.id)}
						className={cn(
							"flex h-full flex-col gap-3 rounded-lg border bg-card p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							isSelected
								? "border-primary shadow-lg"
								: "border-border hover:border-primary/40 hover:shadow",
						)}
					>
						<div>
							<p className="font-semibold text-lg">{goal.title}</p>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{goal.description}
							</p>
						</div>
						<div className="rounded-md bg-primary/5 p-3 text-primary text-sm">
							{goal.outcome}
						</div>
						{isSelected ? (
							<span className="rounded-full bg-primary/10 px-3 py-1 text-center font-medium text-primary text-xs">
								Selected focus
							</span>
						) : null}
					</button>
				);
			})}
		</div>
	</div>
);

export default GoalStep;
