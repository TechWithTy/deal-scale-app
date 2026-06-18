import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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
import {
	type FinalizeCampaignForm,
	finalizeCampaignSchema,
} from "@/types/zod/campaign-finalize-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import type { FC } from "react";
import { useState } from "react";
import { FormProvider, type UseFormReturn, useForm } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../../components/ui/form";

interface FinalizeCampaignStepProps {
	estimatedCredits: number;
	onLaunch: () => void;
	onBack: () => void;
	onCreateAbTest?: (label?: string) => void;
}

// Simple mock workflows for selection
const MOCK_WORKFLOWS = [
	{
		id: "wf1",
		name: "Balanced nurture playbook",
		description:
			"Uses the calendar dates you selected for steady outreach, standard retries, and normal follow-up handoffs.",
	},
	{
		id: "wf2",
		name: "High-intent blitz playbook",
		description:
			"Uses your selected calendar dates for faster follow-up on hot leads without creating a separate schedule.",
	},
	{
		id: "wf3",
		name: "Follow-up only playbook",
		description:
			"Uses your selected calendar dates only for follow-up touches after the first interaction.",
	},
];

// Simple mock sales scripts for selection
const MOCK_SCRIPTS = [
	{
		id: "ss1",
		name: "General Sales Script",
		description:
			"Broad qualification script for general outreach during the selected campaign dates.",
	},
	{
		id: "ss2",
		name: "Appointment Setter Script",
		description:
			"Focuses each scheduled touch on booking a follow-up appointment.",
	},
	{
		id: "ss3",
		name: "Appraisal Follow-up Script",
		description: "Guides follow-up after appraisal or valuation conversations.",
	},
];

const formatCredits = (credits: number) =>
	new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
		Math.max(0, Math.round(credits)),
	);

const fallbackPlaybookTooltip =
	"Uses the calendar dates already selected for this campaign. The playbook controls follow-ups, retries, and handoffs.";

const fallbackSalesScriptTooltip =
	"Message or call language the assigned agent follows during each scheduled outreach touch.";

const getAgentTooltip = (agent: { name: string; status?: string }) =>
	`${agent.name} can own scheduled campaign outreach, lead follow-up, and handoffs.${agent.status ? ` Status: ${agent.status}.` : ""}`;

const FinalizeCampaignStep: FC<FinalizeCampaignStepProps> = ({
	estimatedCredits,
	onLaunch,
	onBack,
	onCreateAbTest,
}) => {
	const {
		campaignName,
		setCampaignName,
		selectedAgentId,
		setSelectedAgentId,
		availableAgents,
	} = useCampaignCreationStore();

	const [popoverOpen, setPopoverOpen] = useState(false);
	const [variantLabel, setVariantLabel] = useState("Variant B");

	const form: UseFormReturn<FinalizeCampaignForm> =
		useForm<FinalizeCampaignForm>({
			resolver: zodResolver(finalizeCampaignSchema),
			defaultValues: {
				campaignName: campaignName,
				selectedAgentId: selectedAgentId || undefined,
				selectedWorkflowId: MOCK_WORKFLOWS[0]?.id,
				selectedSalesScriptId: MOCK_SCRIPTS[0]?.id,
				campaignGoal: "",
			},
			mode: "onChange",
		});

	const handleLaunch = (data: FinalizeCampaignForm) => {
		setCampaignName(data.campaignName);
		setSelectedAgentId(data.selectedAgentId);
		onLaunch();
	};

	return (
		<FormProvider {...form}>
			<form
				onSubmit={form.handleSubmit(handleLaunch)}
				className="mx-auto max-w-lg space-y-6"
				data-tour="campaign-finalize-step"
			>
				<h2 className="font-semibold text-lg dark:text-white">
					Finalize your campaign
				</h2>

				<FormField
					control={form.control}
					name="campaignName"
					render={({ field }) => (
						<FormItem data-tour="campaign-finalize-name">
							<FormLabel>Campaign Name</FormLabel>
							<FormControl>
								<Input placeholder="Enter campaign name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="selectedAgentId"
					render={({ field }) => (
						<FormItem data-tour="campaign-finalize-agent">
							<FormLabel className="flex items-center gap-2">
								Assign AI Agent
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<InfoCircledIcon />
										</TooltipTrigger>
										<TooltipContent>
											<p>Select an AI agent to manage this campaign.</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select an agent" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{availableAgents.map((agent) => (
										<SelectItem key={agent.id} value={agent.id}>
											<div className="flex w-full items-center justify-between gap-3">
												<div className="flex min-w-0 items-center gap-2">
													<span className="truncate">{agent.name}</span>
													<span
														className={`h-2 w-2 shrink-0 rounded-full ${
															agent.status === "active"
																? "bg-green-500"
																: agent.status === "away"
																	? "bg-yellow-500"
																	: "bg-gray-400"
														}`}
														title={agent.status}
													/>
												</div>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<span
																aria-label={`${agent.name} details`}
																className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
																onPointerDown={(event) =>
																	event.stopPropagation()
																}
																title={getAgentTooltip(agent)}
															>
																<InfoCircledIcon className="h-4 w-4" />
															</span>
														</TooltipTrigger>
														<TooltipContent className="max-w-xs">
															<p>{getAgentTooltip(agent)}</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="selectedWorkflowId"
					render={({ field }) => (
						<FormItem data-tour="campaign-finalize-workflow">
							<FormLabel className="flex items-center gap-2">
								Automation playbook
							</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a playbook" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{MOCK_WORKFLOWS.map((wf) => (
										<SelectItem key={wf.id} value={wf.id}>
											<span className="flex w-full items-center justify-between gap-3">
												<span className="truncate">{wf.name}</span>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<span
																aria-label={`${wf.name} details`}
																className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
																onPointerDown={(event) =>
																	event.stopPropagation()
																}
																title={
																	wf.description ?? fallbackPlaybookTooltip
																}
															>
																<InfoCircledIcon className="h-4 w-4" />
															</span>
														</TooltipTrigger>
														<TooltipContent className="max-w-xs">
															<p>{wf.description ?? fallbackPlaybookTooltip}</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-muted-foreground text-xs">
								Your schedule controls when outreach runs. This playbook
								controls what follow-up logic runs after each lead interaction.
							</p>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="selectedSalesScriptId"
					render={({ field }) => (
						<FormItem data-tour="campaign-finalize-script">
							<FormLabel className="flex items-center gap-2">
								Sales Script
							</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a sales script" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{MOCK_SCRIPTS.map((s) => (
										<SelectItem key={s.id} value={s.id}>
											<span className="flex w-full items-center justify-between gap-3">
												<span className="truncate">{s.name}</span>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<span
																aria-label={`${s.name} details`}
																className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
																onPointerDown={(event) =>
																	event.stopPropagation()
																}
																title={
																	s.description ?? fallbackSalesScriptTooltip
																}
															>
																<InfoCircledIcon className="h-4 w-4" />
															</span>
														</TooltipTrigger>
														<TooltipContent className="max-w-xs">
															<p>
																{s.description ?? fallbackSalesScriptTooltip}
															</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="campaignGoal"
					render={({ field }) => (
						<FormItem data-tour="campaign-finalize-goal">
							<FormLabel>Campaign Goal</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Enter your campaign goal (1 sentence min, 1-2 paragraphs max)"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="space-y-4 pt-4" data-tour="campaign-launch-actions">
					<p className="text-gray-500 text-sm dark:text-gray-400">
						{estimatedCredits > 0
							? `Estimated usage: ${formatCredits(estimatedCredits)} credits based on the selected audience, channel, and schedule.`
							: "Configure your campaign settings to see cost estimate."}
					</p>

					<Button
						type="submit"
						className="w-full"
						disabled={!form.formState.isValid}
					>
						Launch Campaign
					</Button>
					{onCreateAbTest && (
						<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
							<PopoverTrigger asChild>
								<Button
									type="button"
									className="w-full"
									variant="secondary"
									onClick={() => {
										// Sync current values before opening
										const values = form.getValues();
										setCampaignName(values.campaignName);
										setSelectedAgentId(values.selectedAgentId ?? null);
										setPopoverOpen(true);
									}}
								>
									Create A/B Test
								</Button>
							</PopoverTrigger>
							<PopoverContent
								align="end"
								className="w-72"
								side="top"
								sideOffset={8}
							>
								<div className="space-y-3">
									<div>
										<label
											htmlFor="variant-name"
											className="mb-1 block font-medium text-sm"
										>
											Name this variation
										</label>
										<Input
											id="variant-name"
											value={variantLabel}
											onChange={(e) => setVariantLabel(e.target.value)}
											placeholder="Variant name"
											autoFocus
										/>
									</div>
									<div className="flex justify-end gap-2">
										<Button
											type="button"
											variant="ghost"
											onClick={() => setPopoverOpen(false)}
										>
											Cancel
										</Button>
										<Button
											type="button"
											onClick={() => {
												onCreateAbTest(variantLabel.trim() || "Variant B");
												setPopoverOpen(false);
											}}
										>
											Continue
										</Button>
									</div>
								</div>
							</PopoverContent>
						</Popover>
					)}
					<Button
						onClick={onBack}
						className="w-full"
						variant="outline"
						type="button"
					>
						Back
					</Button>
				</div>
			</form>
		</FormProvider>
	);
};

export default FinalizeCampaignStep;
