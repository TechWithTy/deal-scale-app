"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	ArrowUpFromLine,
	Download,
	Info,
	MessageCircle,
	Play,
	Search,
	Link2,
	Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import type { QuickStartPersonaId } from "@/lib/config/quickstart/wizardFlows";

// Available CRMs on the platform
const AVAILABLE_CRMS = [
	{ id: "goHighLevel", name: "GoHighLevel", icon: "🚀" },
	{ id: "loftyCRM", name: "Lofty CRM", icon: "🏠" },
	{ id: "salesforce", name: "Salesforce", icon: "☁️" },
	{ id: "hubspot", name: "HubSpot", icon: "🧡" },
] as const;

// Persona-mapped placeholder texts
const PERSONA_PLACEHOLDERS: Record<QuickStartPersonaId, string[]> = {
	investor: [
		"Search cash-flowing properties...",
		"Calculate ROI scenarios...",
		"Track portfolio performance...",
		"Find off-market deals...",
	],
	wholesaler: [
		"Find motivated sellers...",
		"Analyze deal flow...",
		"Export to CRM...",
		"Calculate assignment fees...",
	],
	agent: [
		"Generate listing appointments...",
		"Score seller leads...",
		"Automate follow-ups...",
		"Track commission pipeline...",
	],
	loan_officer: [
		"Find mortgage-ready leads...",
		"Pre-qualify borrowers...",
		"Track loan applications...",
		"Calculate loan scenarios...",
	],
};

const DEFAULT_PLACEHOLDERS = [
	"Search actions or type a command...",
	"Upload leads or connect CRM...",
	"Start your AI workflow...",
	"Automate your real estate business...",
];

interface QuickStartInputCardProps {
	onUploadClick?: () => void;
	onEnrichToggle?: (enabled: boolean) => void;
	className?: string;
}

export function QuickStartInputCard({
	onUploadClick,
	onEnrichToggle,
	className,
}: QuickStartInputCardProps) {
	const router = useRouter();
	const userProfile = useUserProfileStore((state) => state.userProfile);
	const personaId = useQuickStartWizardDataStore((state) => state.personaId);

	const [inputValue, setInputValue] = useState("");
	const [enrichEnabled, setEnrichEnabled] = useState(true);
	const [chatEnabled, setChatEnabled] = useState(false);
	const [chatMessages, setChatMessages] = useState<
		Array<{ role: "user" | "assistant"; content: string }>
	>([]);
	const [uploadMode, setUploadMode] = useState<"csv" | "crm">("csv");
	const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
	const [placeholderKey, setPlaceholderKey] = useState(0);

	// Check CRM connection status
	const crmConnected = useMemo(() => {
		const accounts = userProfile?.connectedAccounts;
		return Boolean(accounts?.goHighLevel || accounts?.loftyCRM);
	}, [userProfile]);

	// Get connected CRMs with status
	const crmStatuses = useMemo(() => {
		const accounts = userProfile?.connectedAccounts;
		return AVAILABLE_CRMS.map((crm) => ({
			...crm,
			connected: Boolean(accounts?.[crm.id as keyof typeof accounts]),
		}));
	}, [userProfile]);

	// Count connected CRMs
	const connectedCount = useMemo(() => {
		return crmStatuses.filter((crm) => crm.connected).length;
	}, [crmStatuses]);

	// Get placeholders based on persona
	const placeholders = useMemo(() => {
		if (chatEnabled) {
			return ["Type a message to chat with AI..."];
		}
		if (personaId && PERSONA_PLACEHOLDERS[personaId]) {
			return PERSONA_PLACEHOLDERS[personaId];
		}
		return DEFAULT_PLACEHOLDERS;
	}, [personaId, chatEnabled]);

	// Default to CRM mode if CRM is connected
	useEffect(() => {
		if (crmConnected) {
			setUploadMode("crm");
		}
	}, [crmConnected]);

	// Cycle through placeholders
	useEffect(() => {
		if (chatEnabled || inputValue) return;

		const interval = setInterval(() => {
			setCurrentPlaceholderIndex((prev) => {
				const next = (prev + 1) % placeholders.length;
				// Force re-render of TypingAnimation by changing key
				setPlaceholderKey((k) => k + 1);
				return next;
			});
		}, 4000); // Wait 4 seconds before cycling to next placeholder

		return () => clearInterval(interval);
	}, [placeholders.length, chatEnabled, inputValue]);

	const handleExecute = () => {
		if (!inputValue.trim()) {
			toast.info("Enter a command or search term");
			return;
		}

		// If chat is enabled, start/continue chat conversation
		if (chatEnabled) {
			const userMessage = inputValue.trim();
			setChatMessages((prev) => [
				...prev,
				{ role: "user", content: userMessage },
			]);

			// Simulate AI response
			setTimeout(() => {
				setChatMessages((prev) => [
					...prev,
					{
						role: "assistant",
						content: `I received your message: "${userMessage}". Chat mode is active. I can help you with your real estate workflow!`,
					},
				]);
			}, 1000);

			setInputValue("");
			toast.success("Message sent to AI assistant");
			return;
		}

		// Parse common commands when chat is disabled
		const command = inputValue.toLowerCase().trim();

		if (
			command.includes("upload") ||
			command.includes("import") ||
			command.includes("lead")
		) {
			toast.info("Opening upload dialog...");
			onUploadClick?.();
			setInputValue("");
			return;
		}

		if (command.includes("campaign")) {
			router.push("/dashboard/campaigns");
			setInputValue("");
			return;
		}

		// Default: treat as search
		toast.info(`Searching for: ${inputValue}`);
		setInputValue("");
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleExecute();
		}
	};

	const handleConnectCRM = () => {
		router.push("/dashboard/connections");
		toast.info("Opening CRM connections...");
	};

	const handleDownloadExample = () => {
		// Generate example CSV content
		const exampleData = [
			[
				"First Name",
				"Last Name",
				"Email",
				"Phone",
				"Address",
				"City",
				"State",
				"Zip",
			],
			[
				"John",
				"Doe",
				"john.doe@example.com",
				"555-0100",
				"123 Main St",
				"Springfield",
				"IL",
				"62701",
			],
			[
				"Jane",
				"Smith",
				"jane.smith@example.com",
				"555-0101",
				"456 Oak Ave",
				"Portland",
				"OR",
				"97201",
			],
			[
				"Bob",
				"Johnson",
				"bob.johnson@example.com",
				"555-0102",
				"789 Pine Rd",
				"Austin",
				"TX",
				"78701",
			],
		];

		const csvContent = exampleData.map((row) => row.join(",")).join("\n");
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute("download", "example_leads.csv");
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		toast.success("Example CSV downloaded");
	};

	const handleEnrichToggle = (checked: boolean) => {
		setEnrichEnabled(checked);
		onEnrichToggle?.(checked);
		toast.success(
			checked ? "Data enrichment enabled" : "Data enrichment disabled",
		);
	};

	const handleChatToggle = (checked: boolean) => {
		setChatEnabled(checked);
		if (checked) {
			toast.success("Chat mode enabled - type to start chatting");
			setChatMessages([]);
		} else {
			toast.info("Chat mode disabled - commands active");
		}
	};

	return (
		<Card
			className={`border-primary/20 bg-card/95 shadow-xl backdrop-blur-sm ${className || ""}`}
		>
			<CardContent className="space-y-4 p-6">
				{/* Search/Input Row */}
				<div
					className={`flex items-center gap-3 rounded-lg border p-1 pr-2 transition-all focus-within:ring-2 ${
						chatEnabled
							? "border-green-500/50 bg-green-950/20 focus-within:border-green-500 focus-within:ring-green-500/20"
							: "border-primary/30 bg-background/50 focus-within:border-primary/50 focus-within:ring-primary/20"
					}`}
				>
					<Search className="ml-3 h-5 w-5 text-muted-foreground" />
					<div className="relative flex-1">
						{!inputValue && (
							<div className="pointer-events-none absolute inset-0 flex items-center px-2">
								<TypingAnimation
									key={placeholderKey}
									duration={80}
									className="text-muted-foreground"
								>
									{placeholders[currentPlaceholderIndex]}
								</TypingAnimation>
							</div>
						)}
						<input
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyPress={handleKeyPress}
							className="w-full border-none bg-transparent px-2 py-3 text-foreground focus:outline-none"
						/>
					</div>
					<Button
						size="icon"
						onClick={handleExecute}
						className="h-10 w-10 rounded-full"
						disabled={!inputValue.trim()}
					>
						<Play className="ml-0.5 h-4 w-4" />
					</Button>
				</div>

				{/* Separator */}
				<div className="border-t border-border/50" />

				{/* Actions Row */}
				<div className="flex flex-wrap items-center justify-between gap-4">
					{/* Left: File Operations with Toggle */}
					<div className="flex flex-wrap items-center gap-3">
						{/* Segmented Toggle */}
						<div className="inline-flex rounded-lg border border-border bg-background p-1">
							<button
								type="button"
								onClick={() => setUploadMode("csv")}
								className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
									uploadMode === "csv"
										? "bg-primary text-primary-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Upload CSV
							</button>
							<button
								type="button"
								onClick={() => setUploadMode("crm")}
								className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
									uploadMode === "crm"
										? "bg-primary text-primary-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Connect CRM
							</button>
						</div>

						{/* Action Button */}
						{uploadMode === "csv" && (
							<>
								<Button
									variant="outline"
									size="sm"
									onClick={onUploadClick}
									className="gap-2"
								>
									<ArrowUpFromLine className="h-4 w-4" />
									Upload File
								</Button>
								<button
									type="button"
									onClick={handleDownloadExample}
									className="flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
								>
									<Download className="h-3.5 w-3.5" />
									Example CSV
								</button>
							</>
						)}
					</div>

					{/* Right: Enrich and Chat */}
					<div className="flex items-center gap-4">
						{/* Enrich Toggle */}
						<div className="flex items-center gap-2">
							<span className="text-sm">Enrich</span>
							<TooltipProvider delayDuration={200}>
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											type="button"
											className="text-muted-foreground transition-colors hover:text-foreground"
										>
											<Info className="h-4 w-4" />
										</button>
									</TooltipTrigger>
									<TooltipContent>
										<p className="max-w-xs text-sm">
											Automatically enrich your leads with additional data like
											property details, market info, and contact verification
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<Switch
								checked={enrichEnabled}
								onCheckedChange={handleEnrichToggle}
							/>
						</div>

						{/* Enable Chat Toggle */}
						<div className="flex items-center gap-2">
							<MessageCircle className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">Chat</span>
							<Switch
								checked={chatEnabled}
								onCheckedChange={handleChatToggle}
							/>
						</div>
					</div>
				</div>

				{/* CRM List Display */}
				{uploadMode === "crm" && (
					<>
						<div className="border-t border-border/50" />
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<p className="text-muted-foreground text-sm">
									Available CRM Integrations
								</p>
								{connectedCount > 0 && (
									<Badge variant="outline" className="gap-1.5">
										{connectedCount} Connected
									</Badge>
								)}
							</div>
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
								{crmStatuses.map((crm) => (
									<TooltipProvider key={crm.id} delayDuration={200}>
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													onClick={() => {
														if (crm.connected) {
															handleConnectCRM();
														}
													}}
													className={`group relative flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
														crm.connected
															? "border-green-500/50 bg-green-500/5 hover:border-green-500/70 hover:bg-green-500/10"
															: "border-border/50 bg-background/30 opacity-40 hover:opacity-60"
													}`}
												>
													{/* Icon */}
													<span className="text-2xl">{crm.icon}</span>

													{/* Name */}
													<span
														className={`text-center text-xs font-medium ${
															crm.connected
																? "text-foreground"
																: "text-muted-foreground"
														}`}
													>
														{crm.name}
													</span>

													{/* Connected Badge */}
													{crm.connected && (
														<div className="absolute top-2 right-2">
															<div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
																<Check className="h-3 w-3 text-white" />
															</div>
														</div>
													)}
												</button>
											</TooltipTrigger>
											<TooltipContent>
												<p className="text-sm">
													{crm.connected
														? `${crm.name} is connected - Click to manage`
														: `Navigate to your profile to connect ${crm.name}`}
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								))}
							</div>
							{connectedCount === 0 && (
								<div className="rounded-lg bg-muted/50 p-3 text-center">
									<p className="text-muted-foreground text-sm">
										No CRMs connected yet.{" "}
										<button
											type="button"
											onClick={handleConnectCRM}
											className="text-primary underline-offset-4 hover:underline"
										>
											Go to connections
										</button>
									</p>
								</div>
							)}
						</div>
					</>
				)}

				{/* Chat Messages Display */}
				{chatEnabled && chatMessages.length > 0 && (
					<>
						<div className="border-t border-border/50" />
						<div className="max-h-48 space-y-2 overflow-y-auto rounded-lg bg-background/30 p-3">
							{chatMessages.map((message, index) => (
								<div
									key={index}
									className={`flex ${
										message.role === "user" ? "justify-end" : "justify-start"
									}`}
								>
									<div
										className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
											message.role === "user"
												? "bg-primary text-primary-foreground"
												: "bg-muted text-foreground"
										}`}
									>
										{message.content}
									</div>
								</div>
							))}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
