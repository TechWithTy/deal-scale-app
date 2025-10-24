import type { FC } from "react";

import { cn } from "@/lib/_utils";
import type {
	QuickStartPersonaDefinition,
	QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";

interface PersonaStepProps {
	readonly personas: readonly QuickStartPersonaDefinition[];
	readonly selectedPersonaId: QuickStartPersonaId | null;
	readonly onSelect: (personaId: QuickStartPersonaId) => void;
}

const PersonaStep: FC<PersonaStepProps> = ({
	personas,
	selectedPersonaId,
	onSelect,
}) => (
	<div className="space-y-6" data-testid="quickstart-persona-step">
		<p className="text-muted-foreground text-sm">
			Tell us who you are so we can tailor the QuickStart plan for your
			workflow.
		</p>
		<div className="grid gap-4 md:grid-cols-3">
			{personas.map((persona) => {
				const isSelected = persona.id === selectedPersonaId;
				return (
					<button
						key={persona.id}
						type="button"
						data-testid={`quickstart-persona-option-${persona.id}`}
						aria-pressed={isSelected}
						onClick={() => onSelect(persona.id)}
						className={cn(
							"flex flex-col gap-3 rounded-lg border bg-card p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							isSelected
								? "border-primary shadow-lg"
								: "border-border hover:border-primary/40 hover:shadow",
						)}
					>
						<div>
							<p className="font-semibold text-lg">{persona.title}</p>
							<p className="text-primary text-sm">{persona.headline}</p>
						</div>
						<p className="text-muted-foreground text-sm leading-relaxed">
							{persona.description}
						</p>
						{isSelected ? (
							<span className="rounded-full bg-primary/10 px-3 py-1 text-center font-medium text-primary text-xs">
								Selected persona
							</span>
						) : null}
					</button>
				);
			})}
		</div>
	</div>
);

export default PersonaStep;
