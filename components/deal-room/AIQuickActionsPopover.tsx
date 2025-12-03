"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
	Sparkles,
	FileText,
	Send,
	CheckCircle,
	Mail,
	FileSignature,
	Calculator,
	MessageSquare,
	Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface AIQuickAction {
	id: string;
	label: string;
	description: string;
	icon: React.ReactNode;
	category: "documents" | "payments" | "communication" | "analysis";
	isEnterprise: boolean;
	action: () => void;
}

interface AIQuickActionsPopoverProps {
	dealId: string;
	propertyAddress: string;
	userTier?: "free" | "basic" | "pro" | "enterprise";
}

export function AIQuickActionsPopover({
	dealId,
	propertyAddress,
	userTier = "basic",
}: AIQuickActionsPopoverProps) {
	const [isOpen, setIsOpen] = useState(false);
	const isEnterprise = userTier === "enterprise" || userTier === "pro";

	const quickActions: AIQuickAction[] = [
		{
			id: "generate-purchase-agreement",
			label: "Generate Purchase Agreement",
			description: "AI-powered purchase agreement draft",
			icon: <FileSignature className="h-4 w-4" />,
			category: "documents",
			isEnterprise: true,
			action: () => {
				toast.success("Generating purchase agreement...", {
					description: "AI is drafting your document",
				});
				setIsOpen(false);
			},
		},
		{
			id: "generate-offer-letter",
			label: "Draft Offer Letter",
			description: "Create personalized offer letter",
			icon: <FileText className="h-4 w-4" />,
			category: "documents",
			isEnterprise: false,
			action: () => {
				toast.success("Drafting offer letter...");
				setIsOpen(false);
			},
		},
		{
			id: "generate-inspection-request",
			label: "Inspection Request Letter",
			description: "Request repairs based on inspection",
			icon: <FileText className="h-4 w-4" />,
			category: "documents",
			isEnterprise: true,
			action: () => {
				toast.success("Generating inspection request...");
				setIsOpen(false);
			},
		},
		{
			id: "send-earnest-money",
			label: "Send Earnest Money Check",
			description: "Generate and send earnest deposit",
			icon: <CheckCircle className="h-4 w-4" />,
			category: "payments",
			isEnterprise: true,
			action: () => {
				toast.success("Processing earnest money...");
				setIsOpen(false);
			},
		},
		{
			id: "send-down-payment",
			label: "Send Down Payment",
			description: "Process down payment transaction",
			icon: <Send className="h-4 w-4" />,
			category: "payments",
			isEnterprise: true,
			action: () => {
				toast.success("Processing down payment...");
				setIsOpen(false);
			},
		},
		{
			id: "email-stakeholders",
			label: "Email All Stakeholders",
			description: "Send update to team members",
			icon: <Mail className="h-4 w-4" />,
			category: "communication",
			isEnterprise: false,
			action: () => {
				toast.success("Composing email...");
				setIsOpen(false);
			},
		},
		{
			id: "generate-closing-checklist",
			label: "Generate Closing Checklist",
			description: "AI-powered closing task list",
			icon: <CheckCircle className="h-4 w-4" />,
			category: "documents",
			isEnterprise: true,
			action: () => {
				toast.success("Generating checklist...");
				setIsOpen(false);
			},
		},
		{
			id: "calculate-roi",
			label: "Detailed ROI Analysis",
			description: "Run comprehensive financial analysis",
			icon: <Calculator className="h-4 w-4" />,
			category: "analysis",
			isEnterprise: false,
			action: () => {
				toast.info("Opening ROI calculator...");
				setIsOpen(false);
			},
		},
		{
			id: "ai-negotiation-tips",
			label: "AI Negotiation Assistant",
			description: "Get AI-powered negotiation strategies",
			icon: <MessageSquare className="h-4 w-4" />,
			category: "analysis",
			isEnterprise: true,
			action: () => {
				toast.success("Analyzing negotiation strategies...");
				setIsOpen(false);
			},
		},
	];

	const handleActionClick = (action: AIQuickAction) => {
		if (action.isEnterprise && !isEnterprise) {
			toast.error("Enterprise Feature", {
				description:
					"Upgrade to Enterprise to unlock AI-powered deal management",
			});
			return;
		}
		action.action();
	};

	const groupedActions = quickActions.reduce(
		(acc, action) => {
			if (!acc[action.category]) {
				acc[action.category] = [];
			}
			acc[action.category].push(action);
			return acc;
		},
		{} as Record<string, AIQuickAction[]>,
	);

	const categoryLabels = {
		documents: "Documents",
		payments: "Payments",
		communication: "Communication",
		analysis: "Analysis",
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="gap-2">
					<Sparkles className="h-4 w-4" />
					AI Quick Actions
					<Badge variant="secondary" className="ml-1">
						{quickActions.filter((a) => !a.isEnterprise || isEnterprise).length}
					</Badge>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0" align="end">
				<div className="p-4 pb-2">
					<h4 className="font-semibold text-sm">AI Quick Actions</h4>
					<p className="text-muted-foreground text-xs">
						Automate common deal tasks with AI
					</p>
				</div>
				<div className="max-h-[400px] overflow-y-auto px-2 pb-2">
					{Object.entries(groupedActions).map(([category, actions], idx) => (
						<div key={category}>
							{idx > 0 && <Separator className="my-2" />}
							<div className="px-2 py-1">
								<p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
									{categoryLabels[category as keyof typeof categoryLabels]}
								</p>
								<div className="space-y-1">
									{actions.map((action) => {
										const isLocked = action.isEnterprise && !isEnterprise;
										return (
											<button
												key={action.id}
												type="button"
												onClick={() => handleActionClick(action)}
												disabled={isLocked}
												className={`flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors ${
													isLocked
														? "cursor-not-allowed opacity-50"
														: "hover:bg-muted"
												}`}
											>
												<div
													className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${
														isLocked
															? "bg-muted text-muted-foreground"
															: "bg-primary/10 text-primary"
													}`}
												>
													{isLocked ? (
														<Lock className="h-4 w-4" />
													) : (
														action.icon
													)}
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<p className="font-medium text-sm">
															{action.label}
														</p>
														{action.isEnterprise && (
															<Badge
																variant="outline"
																className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-xs"
															>
																Enterprise
															</Badge>
														)}
													</div>
													<p className="text-muted-foreground text-xs">
														{action.description}
													</p>
												</div>
											</button>
										);
									})}
								</div>
							</div>
						</div>
					))}
				</div>
				{!isEnterprise && (
					<div className="border-t bg-muted/50 p-3">
						<p className="mb-2 text-center text-xs">
							Unlock all AI features with Enterprise
						</p>
						<Button size="sm" className="w-full gap-1.5">
							<Sparkles className="h-3.5 w-3.5" />
							Upgrade to Enterprise
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
