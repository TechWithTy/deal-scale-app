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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { InfoCircledIcon } from "@radix-ui/react-icons";

const fallbackPlaybookTooltip =
	"Uses the calendar dates already selected for this campaign. The playbook controls follow-ups, retries, and handoffs.";

const fallbackSalesScriptTooltip =
	"Message or call language used during each scheduled outreach touch.";

const getAgentTooltip = (agent: {
	label: string;
	status?: string;
	email?: string;
}) =>
	`${agent.label} can own scheduled campaign outreach, lead follow-up, and handoffs.${agent.status ? ` Status: ${agent.status}.` : ""}${agent.email ? ` Email: ${agent.email}.` : ""}`;

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
				status: agent.status,
				email: agent.email,
			})),
		[availableAgents],
	);

	const workflowOptions = useMemo(
		() =>
			availableWorkflows.map((workflow) => ({
				value: workflow.id,
				label: workflow.name,
				description: workflow.description,
			})),
		[availableWorkflows],
	);

	const salesScriptOptions = useMemo(
		() =>
			availableSalesScripts.map((script) => ({
				value: script.id,
				label: script.name,
				description: script.description,
			})),
		[availableSalesScripts],
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">Team & Automation</CardTitle>
				<CardDescription>
					Assign ownership and choose the follow-up playbook. Scheduling is
					configured separately.
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
									<span className="flex w-full items-center justify-between gap-3">
										<span className="truncate">{option.label}</span>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<span
														aria-label={`${option.label} details`}
														className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
														onPointerDown={(event) => event.stopPropagation()}
														title={getAgentTooltip(option)}
													>
														<InfoCircledIcon className="h-4 w-4" />
													</span>
												</TooltipTrigger>
												<TooltipContent className="max-w-xs">
													<p>{getAgentTooltip(option)}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label className="font-medium text-sm">Automation playbook</Label>
					<Select
						value={selectedWorkflowId ?? undefined}
						onValueChange={(value) => setSelectedWorkflowId(value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Choose playbook" />
						</SelectTrigger>
						<SelectContent>
							{workflowOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									<span className="flex w-full items-center justify-between gap-3">
										<span className="truncate">{option.label}</span>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<span
														aria-label={`${option.label} details`}
														className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
														onPointerDown={(event) => event.stopPropagation()}
														title={
															option.description ?? fallbackPlaybookTooltip
														}
													>
														<InfoCircledIcon className="h-4 w-4" />
													</span>
												</TooltipTrigger>
												<TooltipContent className="max-w-xs">
													<p>{option.description ?? fallbackPlaybookTooltip}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</span>
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
									<span className="flex w-full items-center justify-between gap-3">
										<span className="truncate">{option.label}</span>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<span
														aria-label={`${option.label} details`}
														className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
														onPointerDown={(event) => event.stopPropagation()}
														title={
															option.description ?? fallbackSalesScriptTooltip
														}
													>
														<InfoCircledIcon className="h-4 w-4" />
													</span>
												</TooltipTrigger>
												<TooltipContent className="max-w-xs">
													<p>
														{option.description ?? fallbackSalesScriptTooltip}
													</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</span>
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
