"use client";

import { useEffect, useState } from "react";
import type { Agent } from "@/components/forms/agent/utils/schema";
import {
	fetchAgents,
	createAgent,
	updateAgent,
} from "@/components/forms/agent/utils/api";
import { AgentList } from "./AgentList";
import { AgentForm } from "@/components/forms/agent/AgentForm";
import { Button } from "@/components/ui/button";

// * The main component for managing AI agents.
// ? It orchestrates the state and logic for CRUD operations.
export function AiAgentsManager() {
	const [agents, setAgents] = useState<Agent[]>([]);
	const [view, setView] = useState<"list" | "create" | "edit">("list");
	const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>(
		undefined,
	);

	useEffect(() => {
		async function loadAgents() {
			const fetchedAgents = await fetchAgents();
			setAgents(fetchedAgents);
		}
		loadAgents();
	}, []);

	const handleFormSubmit = async (data: Agent) => {
		if (view === "edit" && typeof selectedAgent?.id === "string") {
			await updateAgent(selectedAgent.id, data);
		} else {
			await createAgent(data);
		}
		const updatedAgents = await fetchAgents();
		setAgents(updatedAgents);
		setView("list");
		setSelectedAgent(undefined);
	};

	const handleEdit = (agent: Agent) => {
		setSelectedAgent(agent);
		setView("edit");
	};

	const handleCancel = () => {
		setView("list");
		setSelectedAgent(undefined);
	};

	return (
		<div className="space-y-4">
			{view === "list" && (
				<>
					<div className="flex items-center justify-between">
						<h1 className="font-bold text-2xl">AI Sales Agents</h1>
						<Button onClick={() => setView("create")}>Create Agent</Button>
					</div>
					<AgentList
						onEdit={handleEdit}
						agents={agents}
						setAgents={setAgents}
					/>
				</>
			)}

			{(view === "create" || view === "edit") && (
				<AgentForm
					onSubmit={handleFormSubmit}
					onCancel={handleCancel}
					defaultValues={selectedAgent}
					isEditing={view === "edit"}
				/>
			)}
		</div>
	);
}
