import { AiAgentsManager } from "@/components/aiAgents";

// * This is the main page for managing AI agents.
// ? It wraps the AiAgentsManager component in a standard page layout.
export default function AgentsPage() {
	return (
		<div className="container mx-auto py-10">
			<AiAgentsManager />
		</div>
	);
}
