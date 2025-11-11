"use client";

import { useMemo } from "react";
import { shallow } from "zustand/shallow";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

const TeamWorkflowForm = () => {
	const {
		availableAgents,
		selectedAgentId,
		setSelectedAgentId,
		availableWorkflows,
		selectedWorkflowId,
		setSelectedWorkflowId,
		availableSalesScripts,
		selectedSalesScriptId,
		setSelectedSalesScriptId,
		campaignArea,
		setCampaignArea,
	} = useCampaignCreationStore(
		(state) => ({
			availableAgents: state.availableAgents,
			selectedAgentId: state.selectedAgentId,
			setSelectedAgentId: state.setSelectedAgentId,
			availableWorkflows: state.availableWorkflows,
			selectedWorkflowId: state.selectedWorkflowId,
			setSelectedWorkflowId: state.setSelectedWorkflowId,
			availableSalesScripts: state.availableSalesScripts,
			selectedSalesScriptId: state.selectedSalesScriptId,
			setSelectedSalesScriptId: state.setSelectedSalesScriptId,
			campaignArea: state.campaignArea,
			setCampaignArea: state.setCampaignArea,
		}),
		shallow,
	);

	const agentOptions = useMemo(
		() =>
			availableAgents.map((agent) => ({
				value: agent.id,
				label: `${agent.name} (${agent.status})`,
			})),
		[availableAgents],
	);

	const workflowOptions = useMemo(
		() =>
			availableWorkflows.map((workflow) => ({
				value: workflow.id,
				label: workflow.name,
			})),
		[availableWorkflows],
	);

	const salesScriptOptions = useMemo(
		() =>
			availableSalesScripts.map((script) => ({
				value: script.id,
				label: script.name,
			})),
		[availableSalesScripts],
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">Team & Workflow</CardTitle>
				<CardDescription>
					Assign ownership and automation logic so leads flow to the right
					playbook.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label className="font-medium text-sm">Assigned agent</Label>
					<Select
						value={selectedAgentId ?? undefined}
						onValueChange={(value) => setSelectedAgentId(value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Choose agent" />
						</SelectTrigger>
						<SelectContent>
							{agentOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label className="font-medium text-sm">Workflow automation</Label>
					<Select
						value={selectedWorkflowId ?? undefined}
						onValueChange={(value) => setSelectedWorkflowId(value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Choose workflow" />
						</SelectTrigger>
						<SelectContent>
							{workflowOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label className="font-medium text-sm">Sales script</Label>
					<Select
						value={selectedSalesScriptId ?? undefined}
						onValueChange={(value) => setSelectedSalesScriptId(value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Choose script" />
						</SelectTrigger>
						<SelectContent>
							{salesScriptOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label htmlFor="campaign-area" className="font-medium text-sm">
						Coverage notes
					</Label>
					<Textarea
						id="campaign-area"
						value={campaignArea}
						onChange={(event) => setCampaignArea(event.target.value)}
						placeholder="Neighborhood focus or route notes"
						className="min-h-[100px]"
					/>
				</div>
			</CardContent>
		</Card>
	);
};

export default TeamWorkflowForm;
