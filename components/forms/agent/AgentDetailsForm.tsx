"use client";

import { AgentAvatar } from "@/components/aiAgents/AgentAvatar";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Agent } from "./utils/schema";

interface AgentDetailsFormProps {
	form: UseFormReturn<Agent>;
	imagePreview: string | null;
	handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AgentDetailsForm({
	form,
	imagePreview,
	handleImageChange,
}: AgentDetailsFormProps) {
	const { name, type, description } = form.watch();
	const isGenerationDisabled = !name || !type || !description;
	const requiresOutreachFields =
		type === "phone-call" || type === "text-message";
	const salesScriptLabel =
		type === "text-message" ? "Text Message Script" : "Sales Script";
	const salesScriptPlaceholder =
		type === "text-message"
			? "e.g., Hi [Name], this is [Agent] with..."
			: "e.g., Hi [Name], I'm calling from...";
	const [salesScriptFileName, setSalesScriptFileName] = useState("");
	const [salesScriptUploadError, setSalesScriptUploadError] = useState("");

	const handleSalesScriptUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
		onChange: (value: string) => void,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const isTextFile =
			file.type.startsWith("text/") ||
			file.name.toLowerCase().endsWith(".txt") ||
			file.name.toLowerCase().endsWith(".md");

		if (!isTextFile) {
			setSalesScriptFileName("");
			setSalesScriptUploadError("Upload a .txt, .md, or text-based file.");
			event.target.value = "";
			return;
		}

		try {
			const contents = await file.text();
			onChange(contents);
			setSalesScriptFileName(file.name);
			setSalesScriptUploadError("");
		} catch {
			setSalesScriptFileName("");
			setSalesScriptUploadError("Could not read that text file.");
		} finally {
			event.target.value = "";
		}
	};

	return (
		<>
			<FormField
				control={form.control}
				name="image"
				render={({ field }) => (
					<FormItem data-tour="agent-manager-image">
						<FormLabel>Agent Image</FormLabel>
						<div className="flex items-center space-x-4">
							<AgentAvatar src={imagePreview} alt="Agent Preview" size={64} />
							<div className="flex w-full items-center space-x-2">
								<FormControl>
									<Input
										type="file"
										accept="image/*"
										onChange={handleImageChange}
									/>
								</FormControl>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<span className="inline-block cursor-not-allowed">
												<Button
													type="button"
													variant="outline"
													className={`whitespace-nowrap ${
														isGenerationDisabled ? "pointer-events-none" : ""
													}`}
													disabled={isGenerationDisabled}
												>
													Generate Image
												</Button>
											</span>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												Please fill out Name, Agent Type, and Description to
												-enable image generation.
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem data-tour="agent-manager-name">
						<FormLabel>Name</FormLabel>
						<FormControl>
							<Input
								data-tour="agent-manager-name-control"
								placeholder="e.g., Q4 Sales Agent"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="type"
				render={({ field }) => (
					<FormItem data-tour="agent-manager-type">
						<FormLabel>Agent Type</FormLabel>
						<Select onValueChange={field.onChange} defaultValue={field.value}>
							<FormControl>
								<SelectTrigger data-tour="agent-manager-type-control">
									<SelectValue placeholder="Select an agent type" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="phone-call">Phone Call Agent</SelectItem>
								<SelectItem value="text-message">Text Message Agent</SelectItem>
								<SelectItem value="direct mail">Direct Mail</SelectItem>
								<SelectItem value="linkedin">LinkedIn</SelectItem>
								<SelectItem value="facebook">Facebook</SelectItem>
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
					<FormItem data-tour="agent-manager-description">
						<FormLabel>Description</FormLabel>
						<FormControl>
							<Textarea
								placeholder="e.g., A brief summary of the agent's purpose."
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="campaignGoal"
				render={({ field }) => (
					<FormItem data-tour="agent-manager-goal">
						<FormLabel>
							Campaign Goal{requiresOutreachFields ? " *" : ""}
						</FormLabel>
						<FormControl>
							<Textarea
								data-tour="agent-manager-goal-control"
								placeholder="e.g., Book 150 qualified demos in Q4."
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="persona"
				render={({ field }) => (
					<FormItem data-tour="agent-manager-persona">
						<FormLabel>Persona{requiresOutreachFields ? " *" : ""}</FormLabel>
						<FormControl>
							<Input
								data-tour="agent-manager-persona-control"
								placeholder="e.g., Friendly & Helpful"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="salesScript"
				render={({ field }) => (
					<FormItem data-tour="agent-manager-script">
						<FormLabel>
							{salesScriptLabel}
							{requiresOutreachFields ? " *" : ""}
						</FormLabel>
						<div className="space-y-3">
							<FormControl>
								<Textarea
									data-tour="agent-manager-script-control"
									placeholder={salesScriptPlaceholder}
									{...field}
								/>
							</FormControl>
							<div
								className="rounded-md border border-border border-dashed bg-muted/30 p-3"
								data-tour="agent-manager-script-upload"
							>
								<FormLabel
									htmlFor="sales-script-upload"
									className="mb-2 block text-muted-foreground text-xs"
								>
									Upload text file
								</FormLabel>
								<Input
									id="sales-script-upload"
									data-tour="agent-manager-script-upload-control"
									type="file"
									accept=".txt,.md,text/plain,text/markdown"
									onChange={(event) =>
										handleSalesScriptUpload(event, field.onChange)
									}
								/>
								{salesScriptFileName && (
									<p className="mt-2 text-muted-foreground text-xs">
										Loaded {salesScriptFileName}
									</p>
								)}
								{salesScriptUploadError && (
									<p className="mt-2 text-destructive text-xs">
										{salesScriptUploadError}
									</p>
								)}
							</div>
						</div>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
}
