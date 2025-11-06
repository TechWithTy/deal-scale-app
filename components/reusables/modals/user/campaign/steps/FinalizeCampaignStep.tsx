import React, { useEffect, useMemo, useState, type FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Sparkles, Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import AllRecipientDropdown from "@/external/ai-avatar-dropdown/AllRecipientDropdown";

interface FinalizeCampaignStepProps {
	estimatedCredits: number;
	onLaunch: () => void;
	onBack: () => void;
	onCreateAbTest?: (label?: string) => void;
	onTestCampaign?: () => void;
	onEvaluate?: (criteria: {
		name?: string;
		description?: string;
		type: "chat.mockConversation";
		messages: Array<{
			role: string;
			content: string;
			type?: string;
		}>;
	}) => void;
	isModalOpen?: boolean;
}

const FinalizeCampaignStep: FC<FinalizeCampaignStepProps> = ({
	estimatedCredits,
	onLaunch,
	onBack,
	onCreateAbTest,
	onTestCampaign,
	onEvaluate,
	isModalOpen = true,
}) => {
	const isMountedRef = React.useRef(true);

	React.useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);
	// Debug logging for FinalizeCampaignStep
	console.log("FinalizeCampaignStep Debug:", {
		estimatedCredits,
		onLaunch,
		onBack,
		onCreateAbTest,
		onTestCampaign,
		onEvaluate,
	});

	const [popoverOpen, setPopoverOpen] = useState(false);
	const [variantLabel, setVariantLabel] = useState("Variant B");
	const [evaluatePopoverOpen, setEvaluatePopoverOpen] = useState(false);
	const [evalName, setEvalName] = useState("");
	const [evalDescription, setEvalDescription] = useState("");
	const [evalMessages, setEvalMessages] = useState<
		Array<{ role: string; content: string; type?: string }>
	>([{ role: "user", content: "" }]);
	const [selectedDefaultEval, setSelectedDefaultEval] = useState<string>("");

	const {
		campaignName,
		setCampaignName,
		campaignGoal,
		setCampaignGoal,
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
				campaignName,
				selectedAgentId: selectedAgentId || undefined,
				selectedWorkflowId: selectedWorkflowId || undefined,
				selectedSalesScriptId: selectedSalesScriptId || undefined,
				campaignGoal: campaignGoal || "",
			},
			mode: "onChange",
		});

	useEffect(() => {
		form.register("selectedWorkflowId");
		form.register("selectedSalesScriptId");
	}, [form]);

	// Sync form values with store - only when modal is open
	useEffect(() => {
		// Don't sync if modal is closed or component is unmounted
		if (!isModalOpen || !isMountedRef.current) return;

		const normalizedCampaignName = campaignName ?? "";
		if (form.getValues("campaignName") !== normalizedCampaignName) {
			form.setValue("campaignName", normalizedCampaignName, {
				shouldDirty: false,
				shouldValidate: false,
			});
		}

		// Only sync workflowId if it's a valid string (schema requires string)
		if (selectedWorkflowId && typeof selectedWorkflowId === "string") {
			const currentValue = form.getValues("selectedWorkflowId");
			if (currentValue !== selectedWorkflowId) {
				form.setValue("selectedWorkflowId", selectedWorkflowId, {
					shouldDirty: false,
					shouldValidate: false,
				});
			}
		}

		// Only sync salesScriptId if it's a valid string (schema requires string)
		if (selectedSalesScriptId && typeof selectedSalesScriptId === "string") {
			const currentValue = form.getValues("selectedSalesScriptId");
			if (currentValue !== selectedSalesScriptId) {
				form.setValue("selectedSalesScriptId", selectedSalesScriptId, {
					shouldDirty: false,
					shouldValidate: false,
				});
			}
		}
	}, [
		campaignName,
		selectedWorkflowId,
		selectedSalesScriptId,
		form,
		isModalOpen,
	]);

	const watchedCampaignName = form.watch("campaignName");
	const watchedCampaignGoal = form.watch("campaignGoal");
	const watchedAgentId = form.watch("selectedAgentId");
	const watchedWorkflowId = form.watch("selectedWorkflowId");
	const watchedSalesScriptId = form.watch("selectedSalesScriptId");

	// Sync watched form values to store - only when modal is open
	useEffect(() => {
		// Don't sync if modal is closed or component is unmounted
		if (!isModalOpen || !isMountedRef.current) return;

		const normalizedCampaignName = watchedCampaignName ?? "";
		if (campaignName !== normalizedCampaignName) {
			setCampaignName(normalizedCampaignName);
		}

		const normalizedCampaignGoal = watchedCampaignGoal ?? "";
		if (campaignGoal !== normalizedCampaignGoal) {
			setCampaignGoal(normalizedCampaignGoal);
		}

		const normalizedAgentId = watchedAgentId ?? null;
		if (selectedAgentId !== normalizedAgentId) {
			setSelectedAgentId(normalizedAgentId);
		}

		const normalizedWorkflowId = watchedWorkflowId ?? null;
		if (selectedWorkflowId !== normalizedWorkflowId) {
			setSelectedWorkflowId(normalizedWorkflowId);
		}

		const normalizedSalesScriptId = watchedSalesScriptId ?? null;
		if (selectedSalesScriptId !== normalizedSalesScriptId) {
			setSelectedSalesScriptId(normalizedSalesScriptId);
		}
	}, [
		watchedCampaignName,
		watchedAgentId,
		watchedCampaignGoal,
		watchedWorkflowId,
		watchedSalesScriptId,
		campaignName,
		campaignGoal,
		selectedAgentId,
		selectedWorkflowId,
		selectedSalesScriptId,
		setCampaignName,
		setCampaignGoal,
		setSelectedAgentId,
		setSelectedWorkflowId,
		setSelectedSalesScriptId,
		isModalOpen,
	]);

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
		if (campaignName !== data.campaignName) {
			setCampaignName(data.campaignName);
		}
		if ((campaignGoal || "") !== (data.campaignGoal || "")) {
			setCampaignGoal(data.campaignGoal || "");
		}
		if (selectedAgentId !== data.selectedAgentId) {
			setSelectedAgentId(data.selectedAgentId ?? null);
		}
		if (selectedWorkflowId !== data.selectedWorkflowId) {
			setSelectedWorkflowId(data.selectedWorkflowId ?? null);
		}
		if (selectedSalesScriptId !== data.selectedSalesScriptId) {
			setSelectedSalesScriptId(data.selectedSalesScriptId ?? null);
		}
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
							<FormControl>
								<AllRecipientDropdown
									value={field.value}
									onChange={(val) => {
										field.onChange(val);
										setSelectedAgentId(val);
									}}
									availablePeople={availableAgents}
									placeholderAgent="Select an agent"
								/>
							</FormControl>
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

					{/* Test and Evaluate controls */}
					<div className="space-y-2">
						<div className="grid grid-cols-2 gap-2">
							<Button
								type="button"
								variant="secondary"
								className="w-full"
								onClick={() => {
									if (onTestCampaign) onTestCampaign();
									else {
										toast(
											"Starting test campaign at 50% cost. Calls route to your primary number; transfers go to your configured agent.",
										);
									}
								}}
							>
								Test Campaign
							</Button>
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() => setEvaluatePopoverOpen(true)}
							>
								Evaluate
							</Button>
							<Dialog
								open={evaluatePopoverOpen}
								onOpenChange={setEvaluatePopoverOpen}
							>
								<DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl flex-col overflow-hidden sm:w-full">
									<DialogHeader className="flex-shrink-0">
										<DialogTitle>Evaluation Criteria</DialogTitle>
										<p className="text-muted-foreground text-sm">
											Configure evaluation criteria to test your campaign's
											conversation flow and responses.
										</p>
									</DialogHeader>
									<div className="flex min-h-0 flex-1 flex-col">
										{/* Scrollable content area */}
										<div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-2">
											{/* Default Eval Template Selector */}
											<div>
												<label
													htmlFor="default-eval"
													className="mb-1 block font-medium text-sm"
												>
													Use Default Template (Optional)
												</label>
												<Select
													value={selectedDefaultEval}
													onValueChange={(value) => {
														setSelectedDefaultEval(value);
														if (value === "conversation-flow") {
															setEvalName("Conversation Flow Test");
															setEvalDescription(
																"Evaluates the flow of conversation and ensures proper responses at key checkpoints.",
															);
															setEvalMessages([
																{
																	role: "user",
																	content:
																		"Hello, I'm interested in your services",
																	type: "mockConversation",
																},
																{
																	role: "assistant",
																	content: "",
																	type: "evaluation",
																},
															]);
														} else if (value === "transfer-check") {
															setEvalName("Transfer Condition Test");
															setEvalDescription(
																"Verifies that transfer conditions are correctly triggered when specified criteria are met.",
															);
															setEvalMessages([
																{
																	role: "user",
																	content: "I need to speak with a human agent",
																	type: "mockConversation",
																},
																{
																	role: "assistant",
																	content: "",
																	type: "evaluation",
																},
															]);
														} else if (value === "custom") {
															setEvalName("");
															setEvalDescription("");
															setEvalMessages([{ role: "user", content: "" }]);
														}
													}}
												>
													<SelectTrigger id="default-eval">
														<SelectValue placeholder="Choose a template or create custom" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="custom">
															Create Custom
														</SelectItem>
														<SelectItem value="conversation-flow">
															Conversation Flow Test
														</SelectItem>
														<SelectItem value="transfer-check">
															Transfer Condition Test
														</SelectItem>
													</SelectContent>
												</Select>
											</div>

											{/* Eval Name */}
											<div>
												<label
													htmlFor="eval-name"
													className="mb-1 block font-medium text-sm"
												>
													Evaluation Name
												</label>
												<Input
													id="eval-name"
													value={evalName}
													onChange={(e) => setEvalName(e.target.value)}
													placeholder="Enter evaluation name"
													maxLength={80}
												/>
												<p className="mt-1 text-muted-foreground text-xs">
													{evalName.length}/80 characters
												</p>
											</div>

											{/* Eval Description */}
											<div>
												<div className="mb-1 flex items-center gap-1.5">
													<label
														htmlFor="eval-description"
														className="block font-medium text-sm"
													>
														Description (Optional)
													</label>
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<button
																	type="button"
																	className="inline-flex items-center justify-center"
																	onClick={(e) => e.preventDefault()}
																>
																	<InfoCircledIcon className="h-3.5 w-3.5 text-muted-foreground" />
																</button>
															</TooltipTrigger>
															<TooltipContent side="top" className="max-w-xs">
																<p>
																	Provide a brief description of what this
																	evaluation checks for. This helps you remember
																	the purpose of the evaluation later.
																</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</div>
												<Textarea
													id="eval-description"
													value={evalDescription}
													onChange={(e) => setEvalDescription(e.target.value)}
													placeholder="Describe what this evaluation checks for"
													maxLength={500}
													rows={3}
												/>
												<p className="mt-1 text-muted-foreground text-xs">
													{evalDescription.length}/500 characters
												</p>
											</div>

											{/* Messages List */}
											<div>
												<div className="mb-2 flex items-center justify-between">
													<div className="flex items-center gap-1.5">
														<label
															htmlFor="messages-section"
															className="block font-medium text-sm"
														>
															Messages (Required)
														</label>
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger asChild>
																	<button
																		type="button"
																		className="inline-flex items-center justify-center"
																		onClick={(e) => e.preventDefault()}
																	>
																		<InfoCircledIcon className="h-3.5 w-3.5 text-muted-foreground" />
																	</button>
																</TooltipTrigger>
																<TooltipContent side="top" className="max-w-xs">
																	<p>
																		Define the conversation messages to
																		evaluate. Each message can be from a User,
																		Assistant, or serve as an Evaluation
																		checkpoint. Add multiple messages to test
																		the full conversation flow.
																	</p>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													</div>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => {
															setEvalMessages([
																...evalMessages,
																{
																	role: "user",
																	content: "",
																},
															]);
														}}
														className="h-7 gap-1"
													>
														<Plus className="h-3 w-3" />
														Add Message
													</Button>
												</div>
												<Button
													type="button"
													variant="secondary"
													size="sm"
													onClick={() => {
														toast.info("AI generation coming soon!");
														// TODO: Implement AI generation logic
													}}
													className="mb-3 w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md hover:from-purple-700 hover:to-violet-700 hover:shadow-lg"
												>
													<Sparkles className="mr-2 h-4 w-4" />
													Generate with AI
												</Button>
												<div id="messages-section" className="space-y-2">
													{evalMessages.map((message, index) => (
														<div
															key={`message-${index}-${message.role}`}
															className="space-y-2 rounded-md border p-2"
														>
															<div className="flex items-center justify-between">
																<Select
																	value={message.role}
																	onValueChange={(value) => {
																		const updated = [...evalMessages];
																		updated[index].role = value;
																		setEvalMessages(updated);
																	}}
																>
																	<SelectTrigger className="h-8 w-32">
																		<SelectValue />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value="user">User</SelectItem>
																		<SelectItem value="assistant">
																			Assistant
																		</SelectItem>
																		<SelectItem value="evaluation">
																			Evaluation
																		</SelectItem>
																	</SelectContent>
																</Select>
																{evalMessages.length > 1 && (
																	<Button
																		type="button"
																		variant="ghost"
																		size="sm"
																		onClick={() => {
																			const updated = evalMessages.filter(
																				(_, i) => i !== index,
																			);
																			setEvalMessages(
																				updated.length > 0
																					? updated
																					: [
																							{
																								role: "user",
																								content: "",
																							},
																						],
																			);
																		}}
																		className="h-7 w-7 p-0 text-destructive hover:text-destructive"
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																)}
															</div>
															<Textarea
																value={message.content}
																onChange={(e) => {
																	const updated = [...evalMessages];
																	updated[index].content = e.target.value;
																	setEvalMessages(updated);
																}}
																placeholder={
																	message.role === "evaluation"
																		? "Evaluation checkpoint message"
																		: `Enter ${message.role} message`
																}
																rows={2}
																className="text-sm"
															/>
														</div>
													))}
												</div>
											</div>
										</div>
									</div>
									{/* Actions */}
									<div className="flex flex-shrink-0 justify-end gap-2 border-t pt-4">
										<Button
											type="button"
											variant="ghost"
											onClick={() => {
												setEvaluatePopoverOpen(false);
												setEvalName("");
												setEvalDescription("");
												setEvalMessages([{ role: "user", content: "" }]);
												setSelectedDefaultEval("");
											}}
										>
											Cancel
										</Button>
										<Button
											type="button"
											onClick={() => {
												const hasEmptyMessage = evalMessages.some(
													(m) => !m.content.trim(),
												);
												if (hasEmptyMessage) {
													toast.error("All messages must have content");
													return;
												}

												const evalPayload = {
													name: evalName.trim() || undefined,
													description: evalDescription.trim() || undefined,
													type: "chat.mockConversation" as const,
													messages: evalMessages.map((m) => ({
														role: m.role,
														content: m.content,
														type: m.type || "mockConversation",
													})),
												};

												if (onEvaluate) {
													onEvaluate(evalPayload);
												} else {
													toast.success(
														`Evaluation criteria configured: ${evalPayload.name || "Unnamed"}`,
													);
												}

												setEvaluatePopoverOpen(false);
											}}
											disabled={
												evalMessages.length === 0 ||
												evalMessages.some((m) => !m.content.trim())
											}
										>
											Run Evaluation
										</Button>
									</div>
								</DialogContent>
							</Dialog>
						</div>
						<p className="px-1 text-muted-foreground text-xs">
							Tests cost 50% of normal credits and are automatically routed to
							your primary number. If transfer is enabled, test calls will
							transfer to the configured agent.
						</p>
					</div>

					{onCreateAbTest && (
						<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
							<PopoverTrigger asChild>
								<Button
									type="button"
									className="w-full"
									variant="secondary"
									onClick={() => {
										// Sync current form values to store before creating A/B test
										const values = form.getValues();
										setCampaignName(values.campaignName);
										setCampaignGoal(values.campaignGoal || "");
										setSelectedAgentId(values.selectedAgentId ?? null);
										if (values.selectedWorkflowId) {
											setSelectedWorkflowId(values.selectedWorkflowId);
										}
										if (values.selectedSalesScriptId) {
											setSelectedSalesScriptId(values.selectedSalesScriptId);
										}
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
