"use client";

import { AgentForm } from "@/components/forms/agent/AgentForm";
import {
	createAgent,
	fetchAgents,
	updateAgent,
} from "@/components/forms/agent/utils/api";
import type { Agent } from "@/components/forms/agent/utils/schema";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { AgentList } from "./AgentList";

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

	useEffect(() => {
		const openCreate = () => {
			setSelectedAgent(undefined);
			setView("create");
		};
		const closeCreate = () => {
			setSelectedAgent(undefined);
			setView("list");
		};

		window.addEventListener("tour-open-agent-manager-create", openCreate);
		window.addEventListener("tour-close-agent-manager-create", closeCreate);
		return () => {
			window.removeEventListener("tour-open-agent-manager-create", openCreate);
			window.removeEventListener(
				"tour-close-agent-manager-create",
				closeCreate,
			);
		};
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
					<div
						className="flex items-center justify-between"
						data-tour="agents-header"
					>
						<h1 className="font-bold text-2xl">AI Sales Agents</h1>
						<Button data-tour="agents-create" onClick={() => setView("create")}>
							Create Agent
						</Button>
					</div>
					<div data-tour="agents-table">
						<AgentList
							onEdit={handleEdit}
							agents={agents}
							setAgents={setAgents}
						/>
					</div>
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
