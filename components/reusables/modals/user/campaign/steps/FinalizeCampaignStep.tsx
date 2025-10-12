import React, { useMemo, type FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import {
	finalizeCampaignSchema,
	type FinalizeCampaignForm,
} from "@/types/zod/campaign-finalize-schema";

interface FinalizeCampaignStepProps {
	estimatedCredits: number;
	onLaunch: () => void;
	onBack: () => void;
}

const FinalizeCampaignStep: FC<FinalizeCampaignStepProps> = ({
	estimatedCredits,
	onLaunch,
	onBack,
}) => {
	// Debug logging for FinalizeCampaignStep
	console.log("FinalizeCampaignStep Debug:", {
		estimatedCredits,
		onLaunch,
		onBack,
	});

	const {
		campaignName,
		setCampaignName,
		selectedAgentId,
		setSelectedAgentId,
		availableAgents,
		selectedWorkflowId,
		setSelectedWorkflowId,
		availableWorkflows,
		selectedSalesScriptId,
		setSelectedSalesScriptId,
		availableSalesScripts,
	} = useCampaignCreationStore();

	const form: UseFormReturn<FinalizeCampaignForm> =
		useForm<FinalizeCampaignForm>({
			resolver: zodResolver(finalizeCampaignSchema),
			defaultValues: {
				campaignName: campaignName,
				selectedAgentId: selectedAgentId || undefined,
				selectedWorkflowId: selectedWorkflowId || undefined,
				selectedSalesScriptId: selectedSalesScriptId || undefined,
				campaignGoal: "",
			},
			mode: "onChange",
		});

	const watchedValues = form.watch();

	const blockingIssues = useMemo(() => {
		const normalizedValues = {
			...watchedValues,
			selectedAgentId:
				typeof watchedValues.selectedAgentId === "string" &&
				watchedValues.selectedAgentId.trim().length > 0
					? watchedValues.selectedAgentId
					: undefined,
			selectedWorkflowId:
				typeof watchedValues.selectedWorkflowId === "string" &&
				watchedValues.selectedWorkflowId.trim().length > 0
					? watchedValues.selectedWorkflowId
					: undefined,
			selectedSalesScriptId:
				typeof watchedValues.selectedSalesScriptId === "string" &&
				watchedValues.selectedSalesScriptId.trim().length > 0
					? watchedValues.selectedSalesScriptId
					: undefined,
		};

		const validation = finalizeCampaignSchema.safeParse(normalizedValues);

		if (validation.success) {
			return [];
		}

		const { fieldErrors, formErrors } = validation.error.flatten();
		const issues = [
			...formErrors,
			...Object.values(fieldErrors).flatMap((messages) => messages ?? []),
		].filter((message): message is string => Boolean(message));

		return Array.from(new Set(issues));
	}, [watchedValues]);

	const handleLaunch = (data: FinalizeCampaignForm) => {
		setCampaignName(data.campaignName);
		setSelectedAgentId(data.selectedAgentId);
		setSelectedWorkflowId(data.selectedWorkflowId);
		setSelectedSalesScriptId(data.selectedSalesScriptId);
		// campaignGoal is local to this component, but you could add it to the store if needed
		onLaunch();
	};

	return (
		<FormProvider {...form}>
			<form
				onSubmit={form.handleSubmit(handleLaunch)}
				className="mx-auto max-w-lg space-y-6"
			>
				<h2 className="font-semibold text-lg dark:text-white">
					Finalize your campaign
				</h2>

				<FormField
					control={form.control}
					name="campaignName"
					render={({ field }) => (
						<FormItem>
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
						<FormItem>
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
											<div className="flex items-center gap-2">
												<span>{agent.name}</span>
												<span
													className={`h-2 w-2 rounded-full ${
														agent.status === "active"
															? "bg-green-500"
															: agent.status === "away"
																? "bg-yellow-500"
																: "bg-gray-400"
													}`}
													title={agent.status}
												/>
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
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								Workflow
							</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a workflow" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{availableWorkflows.map((workflow) => (
										<SelectItem key={workflow.id} value={workflow.id}>
											{workflow.name}
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
					name="selectedSalesScriptId"
					render={({ field }) => (
						<FormItem>
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
									{availableSalesScripts.map((script) => (
										<SelectItem key={script.id} value={script.id}>
											{script.name}
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
						<FormItem>
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

				<div className="space-y-4 pt-4">
					{(() => {
						console.log(
							"FinalizeCampaignStep render - estimatedCredits:",
							estimatedCredits,
						);
						return null;
					})()}
					<p className="text-gray-500 text-sm dark:text-gray-400">
						{estimatedCredits > 0
							? `This campaign will cost ${estimatedCredits} credits.`
							: "Configure your campaign settings to see cost estimate."}
					</p>

					{blockingIssues.length > 0 && (
						<div
							aria-live="polite"
							className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive"
						>
							<p className="font-medium text-sm">
								Complete the following before launching:
							</p>
							<ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
								{blockingIssues.map((issue) => (
									<li key={issue}>{issue}</li>
								))}
							</ul>
						</div>
					)}

					<Button
						type="submit"
						className="w-full"
						disabled={!form.formState.isValid}
					>
						Launch Campaign
					</Button>
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
