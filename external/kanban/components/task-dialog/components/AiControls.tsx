"use client";

import type { AgentType } from "../utils/aiUtils";

export interface AiControlsProps {
	agentType: AgentType;
	setAgentType: (t: AgentType) => void;
	selectedAgentId: string | null;
	setSelectedAgentId: (id: string | null) => void;
	mockAgentsByType: Record<AgentType, { id: string; name: string }[]>;
	resetPreview: () => void;
}

export function AiControls({
	agentType,
	setAgentType,
	selectedAgentId,
	setSelectedAgentId,
	mockAgentsByType,
	resetPreview,
}: AiControlsProps) {
	return (
		<>
			<div className="grid gap-2">
				<label className="text-sm font-medium" htmlFor="agent-type">
					Agent Type
				</label>
				<select
					id="agent-type"
					className="h-9 rounded-md border bg-background px-3 text-sm"
					value={agentType}
					onChange={(e) => {
						setAgentType(e.target.value as AgentType);
						setSelectedAgentId(null);
						resetPreview();
					}}
				>
					<option value="text">Text</option>
					<option value="voice">Voice</option>
					<option value="social">Social</option>
					<option value="direct_mail">Direct Mail</option>
				</select>
			</div>

			<div className="grid gap-2">
				<label className="text-sm font-medium" htmlFor="agent-select">
					Available Agents
				</label>
				<select
					id="agent-select"
					className="h-9 rounded-md border bg-background px-3 text-sm"
					value={selectedAgentId ?? ""}
					onChange={(e) => setSelectedAgentId(e.target.value || null)}
				>
					<option value="" disabled>
						Select an agent
					</option>
					{mockAgentsByType[agentType].map((a) => (
						<option key={a.id} value={a.id}>
							{a.name}
						</option>
					))}
				</select>
			</div>
		</>
	);
}
