"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useWorkflowPlatformsStore } from "@/lib/stores/user/workflows/platforms";
import { useSavedWorkflowsStore } from "@/lib/stores/user/workflows/savedWorkflows";
import { FeatureGuard } from "@/components/access/FeatureGuard";
import { cn } from "@/lib/_utils";
import { toast } from "sonner";
import {
	convertPOMLToN8n,
	convertPOMLToMake,
	convertPOMLToKestra,
} from "@/lib/utils/workflow/converter";
import {
	generateWorkflowMermaid,
	validateWorkflow as validateWorkflowStructure,
	parsePOMLToWorkflow,
} from "@/lib/utils/workflow/mermaidGenerator";
import {
	Check,
	X,
	Workflow,
	ExternalLink,
	Code,
	Link as LinkIcon,
	Download,
	Eye,
	AlertCircle,
	RefreshCw,
	GitBranch,
	FileJson,
	FileCode,
	Play,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useEffect } from "react";
import { CodeBlock } from "@/src/components/ui/code-block";

// Dynamically import Mermaid to avoid SSR issues
const Mermaid = dynamic<{ chart: string }>(
	() => import("@/components/ui/mermaid"),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-40 items-center justify-center text-muted-foreground">
				<RefreshCw className="h-6 w-6 animate-spin" />
			</div>
		),
	},
);

interface WorkflowExportModalProps {
	isOpen: boolean;
	onClose: () => void;
	generatedWorkflow: {
		title: string;
		prompt: string;
		monetizationEnabled: boolean;
		priceMultiplier: number;
	};
	onExported?: (workflowId: string) => void;
	onRegenerate?: () => void; // Callback to trigger regeneration
}

export function WorkflowExportModal({
	isOpen,
	onClose,
	generatedWorkflow,
	onExported,
	onRegenerate,
}: WorkflowExportModalProps) {
	const [workflowName, setWorkflowName] = useState(generatedWorkflow.title);
	// Mock: Start with n8n selected as connected platform for demo
	const [selectedPlatform, setSelectedPlatform] = useState<
		"n8n" | "make" | "kestra" | null
	>("n8n");
	const [isSaving, setIsSaving] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [isRegenerating, setIsRegenerating] = useState(false);
	const [runStatus, setRunStatus] = useState<
		"idle" | "starting" | "running" | "success" | "failed"
	>("idle");
	const [runError, setRunError] = useState<string | null>(null);
	const [validationError, setValidationError] = useState<string | null>(null);
	const [conversionError, setConversionError] = useState<string | null>(null);

	const { getConnectedPlatforms, isPlatformConnected } =
		useWorkflowPlatformsStore();
	const { createWorkflow } = useSavedWorkflowsStore();

	const connectedPlatforms = getConnectedPlatforms();

	// Mock connected platforms for demo (override store state)
	const mockConnectedPlatforms = ["n8n", "make"] as const;

	// Generate Mermaid diagram from POML using comprehensive generator
	const mermaidDiagram = useMemo(() => {
		try {
			return generateWorkflowMermaid(generatedWorkflow.prompt, "poml");
		} catch (error) {
			console.error("Error generating Mermaid diagram:", error);
			// Fallback to simple diagram
			return `graph TD
    Start([▶ Start])
    Process[Process Workflow]
    End([■ End])
    Start --> Process
    Process --> End
    
    classDef startNode fill:#10b981,stroke:#34d399,color:#fff
    classDef endNode fill:#ef4444,stroke:#f87171,color:#fff
    class Start startNode
    class End endNode`;
		}
	}, [generatedWorkflow.prompt]);

	// Validate workflow structure
	const workflowValidation = useMemo((): {
		valid: boolean;
		errors: string[];
		warnings: string[];
	} => {
		try {
			const workflow = parsePOMLToWorkflow(generatedWorkflow.prompt);
			return validateWorkflowStructure(workflow);
		} catch (error) {
			return {
				valid: false,
				errors: [error instanceof Error ? error.message : "Unknown error"],
				warnings: [],
			};
		}
	}, [generatedWorkflow.prompt]);

	// Validate workflow conversion on load
	useEffect(() => {
		if (!isOpen || !selectedPlatform) return;

		setConversionError(null);

		// Try to convert and validate
		try {
			let config;
			switch (selectedPlatform) {
				case "n8n":
					config = convertPOMLToN8n(generatedWorkflow.prompt);
					break;
				case "make":
					config = convertPOMLToMake(generatedWorkflow.prompt);
					break;
				case "kestra":
					config = convertPOMLToKestra(generatedWorkflow.prompt);
					break;
			}

			// Basic validation - check if conversion produced valid output
			if (
				!config ||
				(typeof config === "string" && config.trim().length === 0)
			) {
				setConversionError("Workflow conversion produced empty output");
			}
		} catch (error) {
			const errorMsg =
				error instanceof Error ? error.message : "Unknown conversion error";
			setConversionError(errorMsg);
			console.error("Workflow conversion validation error:", error);
		}
	}, [isOpen, selectedPlatform, generatedWorkflow.prompt]);

	// Generate converted workflow config for preview
	const convertedWorkflowPreview = useMemo(() => {
		if (!selectedPlatform) return null;

		try {
			let config;
			switch (selectedPlatform) {
				case "n8n":
					config = convertPOMLToN8n(generatedWorkflow.prompt);
					break;
				case "make":
					config = convertPOMLToMake(generatedWorkflow.prompt);
					break;
				case "kestra":
					config = convertPOMLToKestra(generatedWorkflow.prompt);
					break;
			}
			return typeof config === "string"
				? config
				: JSON.stringify(config, null, 2);
		} catch (error) {
			return `Error converting workflow: ${error instanceof Error ? error.message : "Unknown error"}`;
		}
	}, [selectedPlatform, generatedWorkflow.prompt]);

	const platforms = [
		{
			id: "n8n" as const,
			name: "n8n",
			description: "Open-source workflow automation",
			icon: <Workflow className="h-5 w-5" />,
			color: "from-pink-500 to-rose-500",
			connected: mockConnectedPlatforms.includes("n8n"), // Mock: Use demo state
			requiresTier: null, // Available to all tiers
		},
		{
			id: "make" as const,
			name: "Make.com",
			description: "Visual automation platform",
			icon: <Workflow className="h-5 w-5" />,
			color: "from-purple-500 to-blue-500",
			connected: mockConnectedPlatforms.includes("make"), // Mock: Use demo state
			requiresTier: null,
		},
		{
			id: "kestra" as const,
			name: "Kestra",
			description: "Orchestration & scheduling platform",
			icon: <Workflow className="h-5 w-5" />,
			color: "from-indigo-500 to-purple-500",
			connected: false, // Mock: Not connected for demo
			requiresTier: "starter", // Requires Starter plan
		},
	];

	const validateWorkflow = () => {
		let error: string | null = null;

		if (!workflowName.trim()) {
			error = "Please enter a workflow name";
		} else if (workflowName.length < 3 || workflowName.length > 50) {
			error = "Workflow name must be between 3-50 characters";
		} else if (!selectedPlatform) {
			error = "Please select a platform";
		}

		setValidationError(error);
		return error === null;
	};

	// Real-time validation - runs whenever fields change
	useEffect(() => {
		validateWorkflow();
	}, [workflowName, selectedPlatform]);

	const handleSaveAndExport = async () => {
		// Validation already done in real-time, but double-check
		if (!validateWorkflow()) {
			toast.error(validationError || "Validation failed", {
				description: "Please fix the errors before saving",
			});
			return;
		}

		setIsSaving(true);

		try {
			// Convert POML to platform-specific format
			let workflowConfig;
			switch (selectedPlatform) {
				case "n8n":
					workflowConfig = convertPOMLToN8n(generatedWorkflow.prompt);
					break;
				case "make":
					workflowConfig = convertPOMLToMake(generatedWorkflow.prompt);
					break;
				case "kestra":
					workflowConfig = convertPOMLToKestra(generatedWorkflow.prompt);
					break;
			}

			// Save workflow to store
			const workflowId = createWorkflow({
				name: workflowName,
				description: `Generated from AI: ${generatedWorkflow.title}`,
				platform: selectedPlatform!,
				workflowConfig,
				aiPrompt: generatedWorkflow.prompt,
				generatedByAI: true,
				monetization: generatedWorkflow.monetizationEnabled
					? {
							enabled: true,
							priceMultiplier: generatedWorkflow.priceMultiplier,
							isPublic: true,
							acceptedTerms: true,
						}
					: undefined,
			});

			toast.success(`Workflow saved and exported to ${selectedPlatform}!`, {
				description: `${workflowName} is ready to use`,
			});

			if (onExported) {
				onExported(workflowId);
			}

			onClose();
		} catch (error) {
			console.error("Error saving workflow:", error);
			const errorMsg =
				error instanceof Error ? error.message : "Unknown error occurred";
			setValidationError(errorMsg);
			toast.error("Failed to save workflow", {
				description: errorMsg,
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleDownload = async (skipValidation = false) => {
		// Validation already done in real-time, but double-check (unless forced)
		if (!skipValidation && !validateWorkflow()) {
			toast.error(validationError || "Validation failed", {
				description: "Please fix the errors before downloading",
			});
			return;
		}

		// At minimum, require platform selection
		if (!selectedPlatform) {
			toast.error("Platform required", {
				description: "Please select a platform to download",
			});
			return;
		}

		setIsDownloading(true);

		try {
			// Convert POML to platform-specific format
			let workflowConfig;
			let fileExtension;
			let mimeType;

			switch (selectedPlatform) {
				case "n8n":
					workflowConfig = convertPOMLToN8n(generatedWorkflow.prompt);
					fileExtension = "json";
					mimeType = "application/json";
					break;
				case "make":
					workflowConfig = convertPOMLToMake(generatedWorkflow.prompt);
					fileExtension = "json";
					mimeType = "application/json";
					break;
				case "kestra":
					workflowConfig = convertPOMLToKestra(generatedWorkflow.prompt);
					fileExtension = "yaml";
					mimeType = "text/yaml";
					break;
			}

			// Save workflow to store FIRST
			const workflowId = createWorkflow({
				name: workflowName,
				description: `Generated from AI and downloaded`,
				platform: selectedPlatform!,
				workflowConfig,
				aiPrompt: generatedWorkflow.prompt,
				generatedByAI: true,
				monetization: generatedWorkflow.monetizationEnabled
					? {
							enabled: true,
							priceMultiplier: generatedWorkflow.priceMultiplier,
							isPublic: true,
							acceptedTerms: true,
						}
					: undefined,
			});

			// Create download blob
			const blob = new Blob(
				[
					typeof workflowConfig === "string"
						? workflowConfig
						: JSON.stringify(workflowConfig, null, 2),
				],
				{ type: mimeType },
			);
			const url = URL.createObjectURL(blob);

			// Trigger download
			const link = document.createElement("a");
			link.href = url;
			link.download = `${workflowName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${selectedPlatform}.${fileExtension}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			toast.success(`Workflow saved and downloaded!`, {
				description: `${workflowName} for ${selectedPlatform}`,
			});

			// Notify parent that workflow was saved
			if (onExported) {
				onExported(workflowId);
			}
		} catch (error) {
			console.error("Error downloading workflow:", error);
			const errorMsg =
				error instanceof Error ? error.message : "Unknown error occurred";
			setConversionError(errorMsg);
			toast.error("Download failed", {
				description: errorMsg,
				action: {
					label: "Retry",
					onClick: () => handleDownload(true),
				},
			});
		} finally {
			setIsDownloading(false);
		}
	};

	const handleRegenerate = async () => {
		if (!onRegenerate) {
			toast.error("Regeneration not available");
			return;
		}

		setIsRegenerating(true);

		try {
			// Close modal and trigger regeneration
			onClose();
			onRegenerate();

			toast.info("Regenerating workflow...", {
				description: "Please wait while we generate a new workflow",
			});
		} catch (error) {
			console.error("Error triggering regeneration:", error);
			toast.error("Failed to regenerate workflow");
		} finally {
			setIsRegenerating(false);
		}
	};

	const handleRunWorkflow = async () => {
		if (!validateWorkflow()) {
			toast.error(validationError || "Validation failed");
			return;
		}

		if (
			!selectedPlatform ||
			!platforms.find((p) => p.id === selectedPlatform)?.connected
		) {
			toast.error("Platform not connected", {
				description: "Please connect the platform before running",
			});
			return;
		}

		setRunStatus("starting");
		setRunError(null);

		try {
			// Step 1: Convert POML to platform-specific format
			toast.info("Preparing workflow...", {
				description: "Converting to platform format",
			});

			let workflowConfig;
			switch (selectedPlatform) {
				case "n8n":
					workflowConfig = convertPOMLToN8n(generatedWorkflow.prompt);
					break;
				case "make":
					workflowConfig = convertPOMLToMake(generatedWorkflow.prompt);
					break;
				case "kestra":
					workflowConfig = convertPOMLToKestra(generatedWorkflow.prompt);
					break;
			}

			// Step 2: Save workflow to store
			const workflowId = createWorkflow({
				name: workflowName,
				description: "Generated from AI and executed",
				platform: selectedPlatform!,
				workflowConfig,
				aiPrompt: generatedWorkflow.prompt,
				generatedByAI: true,
				monetization: generatedWorkflow.monetizationEnabled
					? {
							enabled: true,
							priceMultiplier: generatedWorkflow.priceMultiplier,
							isPublic: true,
							acceptedTerms: true,
						}
					: undefined,
			});

			toast.success("Workflow saved!", {
				description: "Starting execution...",
			});

			// Step 3: Execute workflow on platform
			setRunStatus("running");

			// TODO: Actual platform execution API calls
			// Examples for each platform:
			// - n8n: POST https://{instanceUrl}/api/v1/workflows/{workflowId}/execute
			// - Make: POST https://api.make.com/v2/scenarios/{scenarioId}/run
			// - Kestra: POST https://{instanceUrl}/api/v1/executions/{namespace}/{flowId}

			// Simulate execution start
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Simulate checking execution status
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setRunStatus("success");

			toast.success(`Workflow running on ${selectedPlatform}!`, {
				description: `${workflowName} started successfully`,
				duration: 4000,
			});

			if (onExported) {
				onExported(workflowId);
			}

			// Close modal after brief delay
			setTimeout(() => {
				onClose();
			}, 1500);
		} catch (error) {
			console.error("Error running workflow:", error);
			const errorMsg =
				error instanceof Error ? error.message : "Unknown error occurred";

			setRunStatus("failed");
			setRunError(errorMsg);

			toast.error("Failed to run workflow", {
				description: errorMsg,
				duration: 5000,
				action: {
					label: "Retry",
					onClick: () => handleRunWorkflow(),
				},
			});
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Workflow className="h-5 w-5 text-primary" />
						Save & Export Workflow
					</DialogTitle>
					<DialogDescription>
						Choose a platform and save your AI-generated workflow
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 space-y-4 overflow-y-auto pr-2">
					{/* Workflow Name Input */}
					<div>
						<Label htmlFor="workflow-name" className="font-medium text-sm">
							Workflow Name
						</Label>
						<Input
							id="workflow-name"
							type="text"
							placeholder="e.g., Lead Enrichment Pipeline"
							value={workflowName}
							onChange={(e) => setWorkflowName(e.target.value)}
							className="mt-2"
							maxLength={50}
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							{workflowName.length}/50 characters
						</p>
					</div>

					{/* Platform Selection */}
					<div>
						<Label className="mb-3 block font-medium text-sm">
							Select Platform
						</Label>
						<div className="grid gap-3">
							{platforms.map((platform) => {
								const isSelected = selectedPlatform === platform.id;
								const PlatformCard = (
									<button
										type="button"
										onClick={() => {
											if (platform.connected) {
												setSelectedPlatform(platform.id);
											}
										}}
										disabled={!platform.connected}
										className={cn(
											"w-full rounded-lg border-2 p-4 text-left transition-all",
											isSelected
												? "border-primary bg-primary/5"
												: "border-border hover:border-primary/50",
											!platform.connected &&
												"cursor-not-allowed opacity-60 hover:border-border",
										)}
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="mb-2 flex items-center gap-3">
													<div
														className={cn(
															"flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white",
															platform.color,
														)}
													>
														{platform.icon}
													</div>
													<div>
														<h3 className="font-semibold text-base">
															{platform.name}
														</h3>
														<p className="text-muted-foreground text-xs">
															{platform.description}
														</p>
													</div>
												</div>
												<div className="mt-2 flex items-center gap-2">
													{platform.connected ? (
														<span className="inline-flex items-center gap-1 font-medium text-green-600 text-xs dark:text-green-400">
															<Check className="h-3 w-3" />
															Connected
														</span>
													) : (
														<span className="inline-flex items-center gap-1 font-medium text-muted-foreground text-xs">
															<X className="h-3 w-3" />
															Not Connected
														</span>
													)}
												</div>
											</div>
											{isSelected && (
												<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
													<Check className="h-4 w-4" />
												</div>
											)}
										</div>
										{!platform.connected && (
											<div className="mt-3 border-border border-t pt-3">
												<Button
													size="sm"
													variant="outline"
													className="w-full"
													onClick={(e) => {
														e.stopPropagation();
														toast.info("Connect Platform", {
															description: `Go to Settings → Integrations to connect ${platform.name}`,
														});
													}}
												>
													<LinkIcon className="mr-2 h-3 w-3" />
													Connect Platform
												</Button>
											</div>
										)}
									</button>
								);

								// Wrap Kestra with FeatureGuard for tier gating
								if (platform.requiresTier) {
									return (
										<FeatureGuard
											key={platform.id}
											featureKey="workflow-kestra"
											fallbackTier={platform.requiresTier}
										>
											{PlatformCard}
										</FeatureGuard>
									);
								}

								return <div key={platform.id}>{PlatformCard}</div>;
							})}
						</div>
					</div>

					{/* Workflow Preview - Mermaid Diagram */}
					<div className="rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4 shadow-md">
						<div className="mb-3 flex items-start gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
								<GitBranch className="h-5 w-5" />
							</div>
							<div className="flex-1">
								<h3 className="flex items-center gap-2 font-semibold text-base">
									Workflow Preview
									<span className="font-normal text-muted-foreground text-xs">
										(AI Generated)
									</span>
								</h3>
								<p className="mt-1 text-muted-foreground text-sm">
									Visual representation of your workflow
								</p>
							</div>
						</div>

						{/* Tab Switcher: Graph vs Code */}
						<Tabs
							defaultValue={
								!workflowValidation.valid || conversionError ? "code" : "graph"
							}
							className="w-full"
						>
							<TabsList className="mb-3 grid w-full grid-cols-2 bg-muted/40 p-1">
								<TabsTrigger
									value="graph"
									className={cn(
										"gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md",
										"data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground",
										"transition-all duration-200",
									)}
									disabled={!workflowValidation.valid || !!conversionError}
								>
									<GitBranch className="h-4 w-4" />
									Graph
									{(!workflowValidation.valid || conversionError) && (
										<span className="ml-1 text-xs">(Invalid)</span>
									)}
								</TabsTrigger>
								<TabsTrigger
									value="code"
									className={cn(
										"gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md",
										"data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground",
										"transition-all duration-200",
									)}
								>
									{selectedPlatform === "kestra" ? (
										<FileCode className="h-4 w-4" />
									) : (
										<FileJson className="h-4 w-4" />
									)}
									Code
									{selectedPlatform && (
										<span className="ml-1 text-[10px] opacity-70">
											({selectedPlatform === "kestra" ? "YAML" : "JSON"})
										</span>
									)}
								</TabsTrigger>
							</TabsList>

							<TabsContent value="graph" className="mt-0">
								{/* Mermaid Diagram */}
								<div className="relative rounded-lg border bg-card/50 p-4">
									<div
										className={cn(
											"transition-all",
											(!workflowValidation.valid || conversionError) &&
												"opacity-40 blur-sm grayscale",
										)}
									>
										<Mermaid chart={mermaidDiagram} />
									</div>
									{(!workflowValidation.valid || conversionError) && (
										<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
											<div className="text-center">
												<AlertCircle className="mx-auto mb-2 h-12 w-12 text-destructive" />
												<p className="font-semibold text-sm">
													Workflow Validation Failed
												</p>
												<p className="mt-1 text-muted-foreground text-xs">
													Switch to Code tab for details
												</p>
											</div>
										</div>
									)}
								</div>
							</TabsContent>

							<TabsContent value="code" className="mt-0">
								{/* Platform-Specific Code View with Syntax Highlighting */}
								<div
									className={cn(
										"overflow-hidden rounded-lg border-2 transition-colors",
										selectedPlatform === "n8n"
											? "border-pink-500/30 bg-pink-500/5"
											: selectedPlatform === "make"
												? "border-orange-500/30 bg-orange-500/5"
												: selectedPlatform === "kestra"
													? "border-indigo-500/30 bg-indigo-500/5"
													: "border-border bg-transparent",
									)}
								>
									{selectedPlatform && convertedWorkflowPreview ? (
										<div className="space-y-3">
											{/* Platform Header - Clean and minimal */}
											<div className="flex items-center gap-2">
												<div
													className={cn(
														"flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
														selectedPlatform === "n8n"
															? "border-pink-500/50 bg-pink-500/10 text-pink-600 dark:text-pink-400"
															: selectedPlatform === "make"
																? "border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400"
																: "border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
													)}
												>
													<Workflow className="h-3 w-3" />
													{selectedPlatform === "n8n"
														? "n8n"
														: selectedPlatform === "make"
															? "Make.com"
															: "Kestra"}
												</div>
												<Separator orientation="vertical" className="h-4" />
												<span className="text-muted-foreground text-xs">
													Converted{" "}
													{selectedPlatform === "kestra" ? "YAML" : "JSON"}{" "}
													workflow
												</span>
											</div>
											<CodeBlock
												language={
													selectedPlatform === "kestra" ? "yaml" : "json"
												}
												filename={
													selectedPlatform === "n8n"
														? "workflow.n8n.json"
														: selectedPlatform === "make"
															? "scenario.make.json"
															: "flow.kestra.yaml"
												}
												code={convertedWorkflowPreview}
											/>
										</div>
									) : (
										<div className="rounded-lg border bg-card/50 p-8 text-center">
											<Code className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
											<p className="font-semibold text-sm">
												No Platform Selected
											</p>
											<p className="mt-1 text-muted-foreground text-xs">
												Select a platform above to see the converted workflow
												code
											</p>
											<div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
												<span className="flex items-center gap-1">
													<div className="h-2 w-2 rounded-full bg-pink-500" />
													n8n JSON
												</span>
												<span className="flex items-center gap-1">
													<div className="h-2 w-2 rounded-full bg-orange-500" />
													Make JSON
												</span>
												<span className="flex items-center gap-1">
													<div className="h-2 w-2 rounded-full bg-indigo-500" />
													Kestra YAML
												</span>
											</div>
										</div>
									)}
								</div>
							</TabsContent>
						</Tabs>

						{/* Workflow Details */}
						<div className="mt-3 grid grid-cols-2 gap-3">
							<div className="rounded-lg border bg-card/30 p-3">
								<p className="mb-1 font-medium text-muted-foreground text-xs">
									Workflow Name
								</p>
								<p className="font-semibold text-sm">
									{workflowName || (
										<span className="text-muted-foreground italic">
											Not set
										</span>
									)}
								</p>
							</div>
							<div className="rounded-lg border bg-card/30 p-3">
								<p className="mb-1 font-medium text-muted-foreground text-xs">
									Target Platform
								</p>
								<p className="font-semibold text-sm">
									{selectedPlatform ? (
										<span className="inline-flex items-center gap-1.5">
											{platforms.find((p) => p.id === selectedPlatform)?.name}
											<Check className="h-3 w-3 text-green-500" />
										</span>
									) : (
										<span className="text-muted-foreground italic">
											Not selected
										</span>
									)}
								</p>
							</div>
						</div>

						{generatedWorkflow.monetizationEnabled && (
							<div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
								<p className="mb-1 font-medium text-muted-foreground text-xs">
									Monetization
								</p>
								<p className="flex items-center gap-2 text-sm">
									<span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
										<Check className="h-3 w-3" />
										Enabled
									</span>
									<span className="text-muted-foreground">
										· {generatedWorkflow.priceMultiplier}x multiplier
									</span>
								</p>
							</div>
						)}

						{/* Validation Errors */}
						{(validationError ||
							conversionError ||
							!workflowValidation.valid) && (
							<div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
								<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
								<div className="flex-1">
									<p className="font-medium text-destructive text-sm">
										{conversionError
											? "Conversion Error"
											: !workflowValidation.valid
												? "Workflow Structure Error"
												: "Validation Error"}
									</p>
									<p className="mt-1 text-destructive/80 text-xs">
										{conversionError ||
											validationError ||
											workflowValidation.errors[0]}
									</p>
									{!workflowValidation.valid &&
										workflowValidation.errors.length > 1 && (
											<ul className="mt-2 list-inside list-disc text-destructive/70 text-xs">
												{workflowValidation.errors
													.slice(1)
													.map((err: string, idx: number) => (
														<li key={`error-${idx}`}>{err}</li>
													))}
											</ul>
										)}
									{conversionError && (
										<p className="mt-2 text-destructive/70 text-xs">
											Try downloading the current version or regenerate the
											workflow
										</p>
									)}
								</div>
							</div>
						)}

						{/* Validation Warnings */}
						{workflowValidation.warnings.length > 0 && (
							<div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
								<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
								<div className="flex-1">
									<p className="font-medium text-amber-900 text-sm dark:text-amber-100">
										Warnings ({workflowValidation.warnings.length})
									</p>
									<ul className="mt-1 list-inside list-disc text-amber-800 text-xs dark:text-amber-200">
										{workflowValidation.warnings.map(
											(warning: string, idx: number) => (
												<li key={`warning-${idx}`}>{warning}</li>
											),
										)}
									</ul>
								</div>
							</div>
						)}

						{/* Run Status/Error Display */}
						{runStatus === "failed" && runError && (
							<div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
								<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
								<div className="flex-1">
									<p className="font-medium text-red-900 text-sm dark:text-red-100">
										Execution Failed
									</p>
									<p className="mt-1 text-red-800 text-xs dark:text-red-200">
										{runError}
									</p>
									<p className="mt-2 text-red-700 text-xs dark:text-red-300">
										The workflow was saved but failed to start. Check platform
										connection and try again.
									</p>
								</div>
							</div>
						)}

						{runStatus === "success" && (
							<div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
								<Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
								<div className="flex-1">
									<p className="font-medium text-emerald-900 text-sm dark:text-emerald-100">
										Workflow Started Successfully!
									</p>
									<p className="mt-1 text-emerald-800 text-xs dark:text-emerald-200">
										Your workflow is now running on{" "}
										{platforms.find((p) => p.id === selectedPlatform)?.name}
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Converted Workflow Preview (JSON/YAML) - Expandable */}
					{selectedPlatform && (
						<Accordion type="single" collapsible className="w-full">
							<AccordionItem value="converted" className="rounded-lg border">
								<AccordionTrigger className="px-4 hover:no-underline">
									<div className="flex items-center gap-2">
										{selectedPlatform === "kestra" ? (
											<FileCode className="h-4 w-4" />
										) : (
											<FileJson className="h-4 w-4" />
										)}
										<span className="font-medium text-sm">
											{selectedPlatform === "kestra" ? "YAML" : "JSON"} Preview
											<span className="ml-2 text-muted-foreground text-xs">
												(
												{platforms.find((p) => p.id === selectedPlatform)?.name}
												)
											</span>
										</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-4 pb-4">
									<pre className="max-h-[300px] overflow-x-auto overflow-y-auto rounded-md bg-muted p-3 font-mono text-xs">
										{convertedWorkflowPreview}
									</pre>
									<div className="mt-3 text-muted-foreground text-xs">
										<p>
											This is the converted workflow that will be exported to{" "}
											{platforms.find((p) => p.id === selectedPlatform)?.name}
										</p>
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					)}

					{/* POML Preview - Collapsible */}
					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="preview" className="rounded-lg border">
							<AccordionTrigger className="px-4 hover:no-underline">
								<div className="flex items-center gap-2">
									<Code className="h-4 w-4" />
									<span className="font-medium text-sm">POML Preview</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<pre className="max-h-[300px] overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
									{generatedWorkflow.prompt}
								</pre>
								{selectedPlatform && (
									<div className="mt-3 text-muted-foreground text-xs">
										<p className="mb-1 font-medium">
											Platform:{" "}
											{platforms.find((p) => p.id === selectedPlatform)?.name}
										</p>
										<p>
											This POML will be converted to{" "}
											{selectedPlatform === "kestra" ? "YAML" : "JSON"} format
											for {selectedPlatform}
										</p>
									</div>
								)}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>

				{/* Footer Actions */}
				<div className="flex gap-2 border-t pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={
							isSaving ||
							isDownloading ||
							isRegenerating ||
							runStatus === "running" ||
							runStatus === "starting"
						}
					>
						{runStatus === "success" ? "Close" : "Cancel"}
					</Button>

					{/* Show Run button when validated and ready */}
					{!validationError && !conversionError && workflowValidation.valid && (
						<Button
							type="button"
							onClick={handleRunWorkflow}
							disabled={
								runStatus !== "idle" ||
								!selectedPlatform ||
								!platforms.find((p) => p.id === selectedPlatform)?.connected
							}
							className={cn(
								"gap-2 shadow-lg transition-all",
								runStatus === "idle" &&
									"bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700",
								runStatus === "starting" &&
									"animate-pulse bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
								runStatus === "running" &&
									"bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
								runStatus === "success" &&
									"bg-gradient-to-r from-emerald-600 to-green-600 text-white",
								runStatus === "failed" &&
									"bg-gradient-to-r from-red-600 to-red-700 text-white",
							)}
						>
							{runStatus === "starting" ? (
								<>
									<RefreshCw className="h-4 w-4 animate-spin" />
									Starting...
								</>
							) : runStatus === "running" ? (
								<>
									<RefreshCw className="h-4 w-4 animate-spin" />
									Running...
								</>
							) : runStatus === "success" ? (
								<>
									<Check className="h-4 w-4" />
									Started!
								</>
							) : runStatus === "failed" ? (
								<>
									<AlertCircle className="h-4 w-4" />
									Run Failed
								</>
							) : (
								<>
									<Play className="h-4 w-4" />
									Run Workflow
								</>
							)}
						</Button>
					)}

					{conversionError ? (
						<>
							{/* Show Download & Regenerate when conversion fails */}
							<Button
								type="button"
								variant="destructive"
								onClick={() => handleDownload(true)}
								disabled={isDownloading}
								className="flex-1 gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
							>
								{isDownloading ? (
									<>
										<RefreshCw className="h-4 w-4 animate-spin" />
										Downloading...
									</>
								) : (
									<>
										<AlertCircle className="h-4 w-4" />
										Download Failed
									</>
								)}
							</Button>
							<Button
								type="button"
								onClick={handleRegenerate}
								disabled={isRegenerating || !onRegenerate}
								className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg hover:from-orange-600 hover:to-amber-700"
							>
								{isRegenerating ? (
									<>
										<RefreshCw className="h-4 w-4 animate-spin" />
										Regenerating...
									</>
								) : (
									<>
										<RefreshCw className="h-4 w-4" />
										Regenerate Workflow
									</>
								)}
							</Button>
						</>
					) : validationError ? (
						<>
							{/* Show validation failed state - download current code */}
							<Button
								type="button"
								onClick={() => handleDownload(true)}
								disabled={isDownloading || !selectedPlatform}
								className="flex-1 gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg hover:from-emerald-700 hover:to-green-700"
							>
								{isDownloading ? (
									<>
										<RefreshCw className="h-4 w-4 animate-spin" />
										Downloading...
									</>
								) : (
									<>
										<Download className="h-4 w-4" />
										Download
									</>
								)}
							</Button>
							<Button
								type="button"
								onClick={handleRegenerate}
								disabled={isRegenerating || !onRegenerate}
								className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg hover:from-orange-600 hover:to-amber-700"
							>
								{isRegenerating ? (
									<>
										<RefreshCw className="h-4 w-4 animate-spin" />
										Regenerating...
									</>
								) : (
									<>
										<RefreshCw className="h-4 w-4" />
										Retry
									</>
								)}
							</Button>
						</>
					) : (
						<>
							{/* Normal flow - Download and Save & Export (validated, green) */}
							<Button
								type="button"
								onClick={() => handleDownload(false)}
								disabled={isDownloading}
								className="flex-1 gap-2 border-0 bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg hover:from-emerald-700 hover:to-green-700"
							>
								{isDownloading ? (
									<>
										<RefreshCw className="h-4 w-4 animate-spin" />
										Downloading...
									</>
								) : (
									<>
										<Download className="h-4 w-4" />
										Download Workflow
									</>
								)}
							</Button>
							<Button
								type="button"
								onClick={handleSaveAndExport}
								disabled={
									isSaving ||
									!selectedPlatform ||
									!platforms.find((p) => p.id === selectedPlatform)?.connected
								}
								className="flex-1 gap-2 shadow-lg"
							>
								{isSaving ? (
									<>
										<RefreshCw className="h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<ExternalLink className="h-4 w-4" />
										Save & Export
									</>
								)}
							</Button>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
