"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	getGoalDefinition,
	getGoalsForPersona,
	quickStartGoals,
	quickStartPersonas,
} from "@/lib/config/quickstart/wizardFlows";
import type { ClientType, DemoConfig } from "@/types/user";
import type {
	QuickStartGoalId,
	QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";
import { Building2, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

interface DemoConfigEditorProps {
	demoConfig?: DemoConfig;
	userId: string;
	onUpdate: (config: DemoConfig) => void;
}

const PERSONA_TO_CLIENT_TYPE: Record<QuickStartPersonaId, ClientType> = {
	investor: "investor",
	wholesaler: "wholesaler",
	agent: "agent",
	lender: "loan_officer",
};

const CLIENT_TYPE_TO_PERSONA: Record<ClientType, QuickStartPersonaId> = {
	investor: "investor",
	wholesaler: "wholesaler",
	agent: "agent",
	loan_officer: "lender",
};

export function DemoConfigEditor({
	demoConfig,
	userId,
	onUpdate,
}: DemoConfigEditorProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [localConfig, setLocalConfig] = useState<DemoConfig>(demoConfig || {});

	const personaOptions = useMemo(
		() =>
			quickStartPersonas.filter((persona) =>
				Object.prototype.hasOwnProperty.call(
					PERSONA_TO_CLIENT_TYPE,
					persona.id,
				),
			),
		[],
	);

	const selectedPersona: QuickStartPersonaId | undefined =
		localConfig.clientType
			? CLIENT_TYPE_TO_PERSONA[localConfig.clientType]
			: undefined;

	const personaGoals = useMemo(() => {
		if (!selectedPersona) {
			return quickStartGoals;
		}
		return getGoalsForPersona(selectedPersona);
	}, [selectedPersona]);

	const handleFieldChange = (
		field: keyof DemoConfig,
		value: string | undefined,
	) => {
		const updated = { ...localConfig, [field]: value || undefined };
		setLocalConfig(updated);
		onUpdate(updated);
	};

	const handlePersonaSelect = (personaId: QuickStartPersonaId) => {
		const clientType = PERSONA_TO_CLIENT_TYPE[personaId];
		const goals = getGoalsForPersona(personaId);
		const currentGoal = localConfig.goal;
		const hasCurrentGoal = goals.some((goal) => goal.title === currentGoal);
		const fallbackGoal = goals[0]?.title ?? undefined;

		const updated: DemoConfig = {
			...localConfig,
			clientType,
			goal: hasCurrentGoal ? currentGoal : fallbackGoal,
		};
		setLocalConfig(updated);
		onUpdate(updated);
	};

	const handleGoalSelect = (goalId: QuickStartGoalId) => {
		const goal = getGoalDefinition(goalId);
		handleFieldChange("goal", goal?.title ?? undefined);
	};

	const selectedGoalId = useMemo(() => {
		if (!localConfig.goal) return "";
		const goal = personaGoals.find(
			(definition) => definition.title === localConfig.goal,
		);
		return goal?.id ?? "";
	}, [localConfig.goal, personaGoals]);

	const handleSocialChange = (
		platform: keyof NonNullable<DemoConfig["social"]>,
		value: string,
	) => {
		const updated = {
			...localConfig,
			social: {
				...localConfig.social,
				[platform]: value || undefined,
			},
		};
		setLocalConfig(updated);
		onUpdate(updated);
	};

	return (
		<div className="rounded-lg border border-border bg-muted/30 p-3">
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="w-full justify-between p-0 hover:bg-transparent"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center gap-2">
					<Building2 className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium text-sm">Demo Configuration</span>
					{localConfig.companyName && (
						<span className="text-muted-foreground text-xs">
							({localConfig.companyName})
						</span>
					)}
				</div>
				{isExpanded ? (
					<ChevronUp className="h-4 w-4" />
				) : (
					<ChevronDown className="h-4 w-4" />
				)}
			</Button>

			{isExpanded && (
				<div className="mt-3 space-y-3">
					{/* Company Info */}
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-1">
							<Label
								htmlFor={`company-name-${userId}`}
								className="text-muted-foreground text-xs"
							>
								Company Name
							</Label>
							<Input
								id={`company-name-${userId}`}
								value={localConfig.companyName || ""}
								onChange={(e) =>
									handleFieldChange("companyName", e.target.value)
								}
								placeholder="Acme Real Estate"
								className="h-8 text-sm"
							/>
						</div>
						<div className="space-y-1">
							<Label
								htmlFor={`industry-${userId}`}
								className="text-muted-foreground text-xs"
							>
								Industry
							</Label>
							<Input
								id={`industry-${userId}`}
								value={localConfig.industry || ""}
								onChange={(e) => handleFieldChange("industry", e.target.value)}
								placeholder="Real Estate"
								className="h-8 text-sm"
							/>
						</div>
					</div>

					{/* Client Type & Goal */}
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-1">
							<Label
								htmlFor={`client-type-${userId}`}
								className="text-muted-foreground text-xs"
							>
								Client Type
							</Label>
							<Select
								value={selectedPersona ?? ""}
								onValueChange={(value) =>
									handlePersonaSelect(value as QuickStartPersonaId)
								}
							>
								<SelectTrigger
									id={`client-type-${userId}`}
									className="h-8 text-sm"
								>
									<SelectValue placeholder="Select persona" />
								</SelectTrigger>
								<SelectContent>
									{personaOptions.map((persona) => (
										<SelectItem key={persona.id} value={persona.id}>
											{persona.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label
								htmlFor={`goal-${userId}`}
								className="text-muted-foreground text-xs"
							>
								Primary Goal
							</Label>
							<Select
								value={selectedGoalId}
								onValueChange={(value) =>
									handleGoalSelect(value as QuickStartGoalId)
								}
								disabled={!selectedPersona || personaGoals.length === 0}
							>
								<SelectTrigger id={`goal-${userId}`} className="h-8 text-sm">
									<SelectValue
										placeholder={
											selectedPersona ? "Select goal" : "Select a persona first"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{personaGoals.map((goal) => (
										<SelectItem key={goal.id} value={goal.id}>
											{goal.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Contact Info */}
					<div className="space-y-1">
						<Label
							htmlFor={`email-${userId}`}
							className="text-muted-foreground text-xs"
						>
							Email
						</Label>
						<Input
							id={`email-${userId}`}
							type="email"
							value={localConfig.email || ""}
							onChange={(e) => handleFieldChange("email", e.target.value)}
							placeholder="contact@example.com"
							className="h-8 text-sm"
						/>
					</div>

					<div className="space-y-1">
						<Label
							htmlFor={`logo-${userId}`}
							className="text-muted-foreground text-xs"
						>
							Company Logo URL
						</Label>
						<Input
							id={`logo-${userId}`}
							value={localConfig.companyLogo || ""}
							onChange={(e) => handleFieldChange("companyLogo", e.target.value)}
							placeholder="https://example.com/logo.png"
							className="h-8 text-sm"
						/>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-1">
							<Label
								htmlFor={`website-${userId}`}
								className="text-muted-foreground text-xs"
							>
								Website
							</Label>
							<Input
								id={`website-${userId}`}
								value={localConfig.website || ""}
								onChange={(e) => handleFieldChange("website", e.target.value)}
								placeholder="https://example.com"
								className="h-8 text-sm"
							/>
						</div>
						<div className="space-y-1">
							<Label
								htmlFor={`phone-${userId}`}
								className="text-muted-foreground text-xs"
							>
								Phone
							</Label>
							<Input
								id={`phone-${userId}`}
								value={localConfig.phoneNumber || ""}
								onChange={(e) =>
									handleFieldChange("phoneNumber", e.target.value)
								}
								placeholder="(555) 123-4567"
								className="h-8 text-sm"
							/>
						</div>
					</div>

					{/* Address */}
					<div className="space-y-1">
						<Label
							htmlFor={`address-${userId}`}
							className="text-muted-foreground text-xs"
						>
							Address
						</Label>
						<Input
							id={`address-${userId}`}
							value={localConfig.address || ""}
							onChange={(e) => handleFieldChange("address", e.target.value)}
							placeholder="123 Main St"
							className="h-8 text-sm"
						/>
					</div>

					<div className="grid gap-3 sm:grid-cols-3">
						<div className="space-y-1">
							<Label
								htmlFor={`city-${userId}`}
								className="text-muted-foreground text-xs"
							>
								City
							</Label>
							<Input
								id={`city-${userId}`}
								value={localConfig.city || ""}
								onChange={(e) => handleFieldChange("city", e.target.value)}
								placeholder="San Francisco"
								className="h-8 text-sm"
							/>
						</div>
						<div className="space-y-1">
							<Label
								htmlFor={`state-${userId}`}
								className="text-muted-foreground text-xs"
							>
								State
							</Label>
							<Input
								id={`state-${userId}`}
								value={localConfig.state || ""}
								onChange={(e) => handleFieldChange("state", e.target.value)}
								placeholder="CA"
								className="h-8 text-sm"
							/>
						</div>
						<div className="space-y-1">
							<Label
								htmlFor={`zip-${userId}`}
								className="text-muted-foreground text-xs"
							>
								ZIP
							</Label>
							<Input
								id={`zip-${userId}`}
								value={localConfig.zipCode || ""}
								onChange={(e) => handleFieldChange("zipCode", e.target.value)}
								placeholder="94105"
								className="h-8 text-sm"
							/>
						</div>
					</div>

					{/* Social Media */}
					<div className="space-y-2">
						<Label className="text-muted-foreground text-xs">
							Social Media Links
						</Label>
						<div className="grid gap-2">
							<Input
								value={localConfig.social?.facebook || ""}
								onChange={(e) => handleSocialChange("facebook", e.target.value)}
								placeholder="Facebook URL"
								className="h-8 text-sm"
							/>
							<Input
								value={localConfig.social?.instagram || ""}
								onChange={(e) =>
									handleSocialChange("instagram", e.target.value)
								}
								placeholder="Instagram URL"
								className="h-8 text-sm"
							/>
							<Input
								value={localConfig.social?.linkedin || ""}
								onChange={(e) => handleSocialChange("linkedin", e.target.value)}
								placeholder="LinkedIn URL"
								className="h-8 text-sm"
							/>
							<Input
								value={localConfig.social?.twitter || ""}
								onChange={(e) => handleSocialChange("twitter", e.target.value)}
								placeholder="Twitter/X URL"
								className="h-8 text-sm"
							/>
							<Input
								value={localConfig.social?.youtube || ""}
								onChange={(e) => handleSocialChange("youtube", e.target.value)}
								placeholder="YouTube URL"
								className="h-8 text-sm"
							/>
							<Input
								value={localConfig.social?.tiktok || ""}
								onChange={(e) => handleSocialChange("tiktok", e.target.value)}
								placeholder="TikTok URL"
								className="h-8 text-sm"
							/>
						</div>
					</div>

					{/* Brand Colors */}
					<div className="space-y-2">
						<Label className="text-muted-foreground text-xs">
							Brand Colors
						</Label>
						<div className="grid gap-2">
							<div className="flex gap-2">
								<Input
									type="color"
									value={localConfig.brandColor || "#3b82f6"}
									onChange={(e) =>
										handleFieldChange("brandColor", e.target.value)
									}
									className="h-8 w-16"
								/>
								<Input
									value={localConfig.brandColor || ""}
									onChange={(e) =>
										handleFieldChange("brandColor", e.target.value)
									}
									placeholder="Primary: #3b82f6"
									className="h-8 flex-1 text-sm"
								/>
							</div>
							<div className="flex gap-2">
								<Input
									type="color"
									value={localConfig.brandColorSecondary || "#1e40af"}
									onChange={(e) =>
										handleFieldChange("brandColorSecondary", e.target.value)
									}
									className="h-8 w-16"
								/>
								<Input
									value={localConfig.brandColorSecondary || ""}
									onChange={(e) =>
										handleFieldChange("brandColorSecondary", e.target.value)
									}
									placeholder="Secondary: #1e40af"
									className="h-8 flex-1 text-sm"
								/>
							</div>
							<div className="flex gap-2">
								<Input
									type="color"
									value={localConfig.brandColorAccent || "#60a5fa"}
									onChange={(e) =>
										handleFieldChange("brandColorAccent", e.target.value)
									}
									className="h-8 w-16"
								/>
								<Input
									value={localConfig.brandColorAccent || ""}
									onChange={(e) =>
										handleFieldChange("brandColorAccent", e.target.value)
									}
									placeholder="Accent: #60a5fa"
									className="h-8 flex-1 text-sm"
								/>
							</div>
						</div>
					</div>

					{/* Notes */}
					<div className="space-y-1">
						<Label
							htmlFor={`notes-${userId}`}
							className="text-muted-foreground text-xs"
						>
							Notes
						</Label>
						<Textarea
							id={`notes-${userId}`}
							value={localConfig.notes || ""}
							onChange={(e) => handleFieldChange("notes", e.target.value)}
							placeholder="Additional notes about this demo client..."
							className="min-h-[60px] resize-none text-sm"
						/>
					</div>
				</div>
			)}
		</div>
	);
}
