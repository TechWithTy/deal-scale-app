"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import { InsertableChips } from "@/components/reusables/ai/InsertableChips";
import { cn } from "@/lib/_utils";
import { ShieldAlert, ShieldCheck, X } from "lucide-react";
import {
	type FieldPath,
	type FieldPathValue,
	useFormContext,
	useWatch,
} from "react-hook-form";
import { useMemo, useState } from "react";

const TOOL_SUGGESTIONS = [
	{
		key: "tool:call",
		label: "tool:call",
		description: "Enable voice and telephony automations that dial prospects.",
	},
	{
		key: "tool:search",
		label: "tool:search",
		description:
			"Permit SERP enrichment and data gathering during generations.",
	},
	{
		key: "tool:write",
		label: "tool:write",
		description: "Allow outbound copywriting helpers to run inside the flow.",
	},
	{
		key: "tool:calendar",
		label: "tool:calendar",
		description:
			"Allow calendar scheduling (requires connected calendar tool).",
	},
];

interface ChipArrayFieldProps {
	name: FieldPath<ProfileFormValues>;
	label: string;
	description?: string;
	inputPlaceholder?: string;
	disabled?: boolean;
	suggestions?: {
		key: string;
		label: string;
		description?: string;
		icon?: React.ReactNode;
	}[];
	emptyHint?: string;
	tooltipTitle?: string;
	tooltipContent?: string;
	variant?: "allow" | "deny";
}

const sanitizeValue = (value: string) => value.trim();

function ChipArrayField({
	name,
	label,
	description,
	inputPlaceholder = "Add value and press Enter",
	disabled = false,
	suggestions,
	emptyHint,
	tooltipTitle,
	tooltipContent,
	variant = "allow",
}: ChipArrayFieldProps) {
	const {
		control,
		setValue,
		trigger,
		formState: { errors },
	} = useFormContext<ProfileFormValues>();
	const values = useWatch({ control, name }) as FieldPathValue<
		ProfileFormValues,
		typeof name
	>;
	const [inputValue, setInputValue] = useState("");

	const errorMessage = useMemo(() => {
		const [rootKey, childKey] = name.split(".") as [string, string];
		const rootError = (errors as Record<string, unknown> | undefined)?.[
			rootKey
		];
		if (!rootError || typeof rootError !== "object") return undefined;
		const messageSource = (rootError as Record<string, unknown>)[
			childKey
		] as unknown;
		if (!messageSource) return undefined;
		if (typeof messageSource === "string") return messageSource;
		if (
			typeof messageSource === "object" &&
			messageSource !== null &&
			"message" in messageSource
		) {
			return (messageSource as { message?: string }).message;
		}
		return undefined;
	}, [errors, name]);

	const currentValues = Array.isArray(values) ? values : [];

	const addChip = (rawValue: string) => {
		if (!rawValue) return;
		const tokens = rawValue
			.split(",")
			.map((token) => sanitizeValue(token))
			.filter(Boolean);
		if (tokens.length === 0) return;

		const nextValues = [...currentValues];
		for (const token of tokens) {
			if (!nextValues.includes(token)) {
				nextValues.push(token);
			}
		}
		setValue(
			name,
			nextValues as FieldPathValue<ProfileFormValues, typeof name>,
			{
				shouldDirty: true,
				shouldTouch: true,
			},
		);
		void trigger(name);
		setInputValue("");
	};

	const removeChip = (valueToRemove: string) => {
		const filtered = currentValues.filter((item) => item !== valueToRemove);
		setValue(name, filtered as FieldPathValue<ProfileFormValues, typeof name>, {
			shouldDirty: true,
			shouldTouch: true,
		});
		void trigger(name);
	};

	return (
		<div className="space-y-2">
			<div className="flex items-start justify-between gap-2">
				<div>
					<FormLabel className="font-medium text-sm">{label}</FormLabel>
					{description && (
						<p className="text-muted-foreground text-xs">{description}</p>
					)}
				</div>
				{tooltipContent && (
					<TooltipProvider delayDuration={150}>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									aria-label={tooltipTitle || `${label} info`}
									className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
								>
									?
								</button>
							</TooltipTrigger>
							<TooltipContent className="max-w-sm text-xs leading-relaxed">
								{tooltipContent}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Input
					value={inputValue}
					disabled={disabled}
					onChange={(event) => setInputValue(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							addChip(inputValue);
						}
						if (
							event.key === "Backspace" &&
							inputValue === "" &&
							currentValues.length > 0
						) {
							event.preventDefault();
							removeChip(currentValues[currentValues.length - 1]);
						}
					}}
					placeholder={inputPlaceholder}
					className="text-sm"
				/>
				<Button
					type="button"
					variant="secondary"
					size="sm"
					disabled={disabled || inputValue.trim().length === 0}
					onClick={() => addChip(inputValue)}
				>
					Add
				</Button>
			</div>

			{suggestions && suggestions.length > 0 && (
				<div className="mt-2">
					<InsertableChips
						chips={suggestions}
						onChipClick={(key) => addChip(key)}
						label="Suggested MCP tools"
						helpText="Click to add tools into the allow list"
						searchPlaceholder="Filter tools..."
						className="space-y-2"
					/>
				</div>
			)}

			<div className="mt-2">
				{currentValues.length === 0 ? (
					<p className="rounded-md border border-muted-foreground/40 border-dashed bg-muted/30 p-3 text-muted-foreground text-xs">
						{emptyHint ?? "No entries yet."}
					</p>
				) : (
					<div className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-2">
						{currentValues.map((value) => (
							<Badge
								key={value}
								variant="secondary"
								className={cn(
									"flex items-center gap-1 rounded-full border px-3 py-1 font-medium text-xs",
									variant === "deny"
										? "border-destructive/30 bg-destructive/10 text-destructive"
										: "border-primary/20 bg-primary/10 text-primary",
									disabled && "opacity-60",
								)}
							>
								{value}
								{!disabled && (
									<button
										type="button"
										className={cn(
											"ml-1 h-4 w-4 rounded-full border text-xs transition-colors",
											variant === "deny"
												? "border-destructive/30 bg-destructive/20 text-destructive/80 hover:text-destructive"
												: "border-primary/20 bg-primary/10 text-primary/80 hover:text-destructive",
										)}
										onClick={() => removeChip(value)}
										aria-label={`Remove ${value}`}
									>
										<X className="mx-auto h-3 w-3" />
									</button>
								)}
							</Badge>
						))}
					</div>
				)}
			</div>

			{errorMessage && (
				<p className="text-destructive text-xs leading-relaxed">
					{errorMessage}
				</p>
			)}
		</div>
	);
}

interface McpAllowListSectionProps {
	loading: boolean;
}

export function McpAllowListSection({ loading }: McpAllowListSectionProps) {
	const { control } = useFormContext<ProfileFormValues>();
	const allowList = useWatch({
		control,
		name: "mcpAllowList",
	}) as ProfileFormValues["mcpAllowList"];
	const denyList = useWatch({
		control,
		name: "mcpDenyList",
	}) as ProfileFormValues["mcpDenyList"];

	const hasAnyEntries =
		allowList?.tools?.length ||
		allowList?.words?.length ||
		allowList?.phrases?.length ||
		allowList?.regexes?.length ||
		denyList?.tools?.length ||
		denyList?.words?.length ||
		denyList?.phrases?.length ||
		denyList?.regexes?.length;

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle>MCP Guardrails</CardTitle>
				<CardDescription>
					Govern which tools, keywords, and patterns our agents can (or cannot)
					invoke via Model Context Protocol (MCP). Keep the allow list tightly
					scoped and use the deny list to hard-block risky output.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<Accordion type="multiple" defaultValue={[]}>
					<AccordionItem value="allow">
						<AccordionTrigger className="text-left">
							<span className="flex items-center gap-2 font-medium text-sm">
								<ShieldCheck className="h-4 w-4 text-primary" />
								Allow List (Safe Surface)
							</span>
						</AccordionTrigger>
						<AccordionContent className="space-y-4 pt-2">
							<ChipArrayField
								name={"mcpAllowList.tools"}
								label="Allowed MCP Tools"
								description="Permit specific MCP tools during generations."
								inputPlaceholder="Add tool identifier (e.g. tool:calendar)"
								disabled={loading}
								suggestions={TOOL_SUGGESTIONS}
								emptyHint="No tools yet. Add entries such as tool:call, tool:search, or custom adapters."
								tooltipTitle="MCP Tools"
								tooltipContent="Only the tools listed here are available to automations. Keep this list short and audited—anything omitted will be blocked during runtime."
							/>
							<ChipArrayField
								name={"mcpAllowList.words"}
								label="Allowed Words"
								description="Approve individual words MCP responses may include."
								inputPlaceholder="Add word"
								disabled={loading}
								emptyHint="No whitelisted words yet. Add critical vocabulary (e.g. compliance terms or brand-specific names)."
								tooltipTitle="Words Constraint"
								tooltipContent="Great for high-sensitivity deployments. Allow niche jargon, regulated phrases, or things the default filters would otherwise trim."
							/>
							<ChipArrayField
								name={"mcpAllowList.phrases"}
								label="Allowed Phrases"
								description="Approve multi-word sequences for MCP content."
								inputPlaceholder='Add phrase (e.g. "Schedule a consult")'
								disabled={loading}
								emptyHint="No whitelisted phrases yet. Add sentences or call-to-actions that must pass guardrails."
								tooltipTitle="Phrase Allow List"
								tooltipContent="Useful when compliance teams require explicit messaging. The AI can only include the phrases you approve here."
							/>
							<ChipArrayField
								name={"mcpAllowList.regexes"}
								label="Allowed Regex Patterns"
								description="Let MCP output match advanced patterns (e.g. ticket IDs)."
								inputPlaceholder="Add regex (e.g. ^LEAD-[0-9]+$)"
								disabled={loading}
								emptyHint="No regex patterns yet. Add safe expressions to let MCP output matched values like invoice IDs or secure tokens."
								tooltipTitle="Regex Controls"
								tooltipContent="Provide regular expressions to control dynamic patterns – great for ticket or account IDs. Validate expressions before deploying."
							/>
						</AccordionContent>
					</AccordionItem>
					<div className="my-4 h-px w-full bg-border/60" />
					<AccordionItem value="deny">
						<AccordionTrigger className="text-left">
							<span className="flex items-center gap-2 font-medium text-sm">
								<ShieldAlert className="h-4 w-4 text-destructive" />
								Deny List (Hard Blocks)
							</span>
						</AccordionTrigger>
						<AccordionContent className="space-y-4 pt-2">
							<ChipArrayField
								name={"mcpDenyList.tools"}
								label="Blocked MCP Tools"
								description="Prevent automations from calling specific tools."
								inputPlaceholder="Add tool identifier (e.g. tool:delete)"
								disabled={loading}
								suggestions={TOOL_SUGGESTIONS}
								emptyHint="No blocked tools yet. Add any tool handles you want to keep off-limits."
								tooltipTitle="Tool Deny List"
								tooltipContent="Tools listed here are always blocked—even if another workflow tries to invoke them. Helpful for experimental or high-risk actions."
								variant="deny"
							/>
							<ChipArrayField
								name={"mcpDenyList.words"}
								label="Blocked Words"
								description="Strip unwanted keywords from MCP output."
								inputPlaceholder="Add word"
								disabled={loading}
								emptyHint="No blocked words yet. Add terms or slurs you want scrubbed."
								tooltipTitle="Word Deny List"
								tooltipContent="Use this to guarantee sensitive keywords never leave the platform. The allow list still takes precedence for approved usage."
								variant="deny"
							/>
							<ChipArrayField
								name={"mcpDenyList.phrases"}
								label="Blocked Phrases"
								description="Prevent specific phrases from appearing in output."
								inputPlaceholder='Add phrase (e.g. "Guaranteed returns")'
								disabled={loading}
								emptyHint="No blocked phrases yet. Add risky claims, compliance no-gos, or banned slogans."
								tooltipTitle="Phrase Deny List"
								tooltipContent="Great for compliance. Anything added here is removed before content reaches customers."
								variant="deny"
							/>
							<ChipArrayField
								name={"mcpDenyList.regexes"}
								label="Blocked Regex Patterns"
								description="Reject matching patterns outright (e.g. credit card numbers)."
								inputPlaceholder="Add regex (e.g. ^\\d{16}$)"
								disabled={loading}
								emptyHint="No blocked regexes yet. Add regular expressions to strip IDs, card numbers, or other risky content."
								tooltipTitle="Regex Deny List"
								tooltipContent="Advanced guardrail: any response matching these expressions will be sanitized or rejected."
								variant="deny"
							/>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
				{!hasAnyEntries && (
					<p className="text-muted-foreground text-xs leading-relaxed">
						💡 Tip: Start by whitelisting the exact tools and phrases your QA or
						legal teams already approved, then layer deny list rules for risky
						or prohibited content. You can iterate as you observe MCP traffic.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
