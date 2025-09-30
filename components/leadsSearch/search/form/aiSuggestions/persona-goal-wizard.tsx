"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

import PersonaGoalStep from "./persona-goal-step";
import SuggestionsStep from "./suggestions-step";
import RecommendationsStep from "./recommendations-step";
import ApplyStep from "./apply-step";
import {
	deriveSuggestion,
	type Goal,
	type Persona,
} from "../locationSuggestions";

export interface PersonaGoal {
	propertyType: string;
	budget: string;
	timeline: string;
	investmentStrategy: string;
	riskTolerance: string;
	goals: string[];
}

export interface WizardSuggestion {
	id: string;
	title: string;
	description: string;
	confidence: number;
	reasoning: string;
}

export interface ZipCodeRecommendation {
	zipCode: string;
	city: string;
	state: string;
	score: number;
	summary: string;
	reasons: string[];
	averagePrice: number;
	marketTrend: "up" | "down" | "stable";
}

export interface PersonaGoalWizardResult {
	zipCodes: string[];
	radius: number;
	personaGoal: PersonaGoal;
	persona: Persona;
	goal: Goal;
	message: string;
	suggestions: WizardSuggestion[];
	recommendations: ZipCodeRecommendation[];
}

interface PersonaGoalWizardProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onComplete: (result: PersonaGoalWizardResult) => void;
	initialPersonaGoal?: Partial<PersonaGoal>;
	defaultPersona?: Persona;
	defaultGoal?: Goal;
}

const INITIAL_GOAL_STATE: PersonaGoal = {
	propertyType: "",
	budget: "",
	timeline: "",
	investmentStrategy: "",
	riskTolerance: "",
	goals: [],
};

const STEP_METADATA = [
	{
		title: "Personalize",
		description: "Tell us about your investment profile",
	},
	{
		title: "AI Insights",
		description: "Review strategy guidance tailored to you",
	},
	{
		title: "Locations",
		description: "Select the zip codes that fit best",
	},
	{
		title: "Apply",
		description: "Send selected areas to your search",
	},
] as const;

const GOAL_FOCUS: Record<Goal, string> = {
	cashflow: "maximize steady rental income",
	flip: "capture short-term equity gains",
	appreciation: "build long-term asset appreciation",
	seller_leads: "surface motivated sellers",
	referrals: "grow a high-quality referral pipeline",
};

const GOAL_RECOMMENDATIONS: Record<
	Goal,
	Array<Omit<ZipCodeRecommendation, "summary" | "reasons" | "score">>
> = {
	cashflow: [
		{
			zipCode: "78201",
			city: "San Antonio",
			state: "TX",
			averagePrice: 245000,
			marketTrend: "up",
		},
		{
			zipCode: "38109",
			city: "Memphis",
			state: "TN",
			averagePrice: 198000,
			marketTrend: "stable",
		},
		{
			zipCode: "35208",
			city: "Birmingham",
			state: "AL",
			averagePrice: 205000,
			marketTrend: "up",
		},
	],
	flip: [
		{
			zipCode: "19146",
			city: "Philadelphia",
			state: "PA",
			averagePrice: 335000,
			marketTrend: "up",
		},
		{
			zipCode: "32209",
			city: "Jacksonville",
			state: "FL",
			averagePrice: 240000,
			marketTrend: "stable",
		},
		{
			zipCode: "30318",
			city: "Atlanta",
			state: "GA",
			averagePrice: 365000,
			marketTrend: "up",
		},
	],
	appreciation: [
		{
			zipCode: "30309",
			city: "Atlanta",
			state: "GA",
			averagePrice: 465000,
			marketTrend: "up",
		},
		{
			zipCode: "98052",
			city: "Redmond",
			state: "WA",
			averagePrice: 725000,
			marketTrend: "up",
		},
		{
			zipCode: "94107",
			city: "San Francisco",
			state: "CA",
			averagePrice: 915000,
			marketTrend: "stable",
		},
	],
	seller_leads: [
		{
			zipCode: "85032",
			city: "Phoenix",
			state: "AZ",
			averagePrice: 415000,
			marketTrend: "stable",
		},
		{
			zipCode: "60629",
			city: "Chicago",
			state: "IL",
			averagePrice: 310000,
			marketTrend: "down",
		},
		{
			zipCode: "75216",
			city: "Dallas",
			state: "TX",
			averagePrice: 285000,
			marketTrend: "stable",
		},
	],
	referrals: [
		{
			zipCode: "33139",
			city: "Miami Beach",
			state: "FL",
			averagePrice: 640000,
			marketTrend: "up",
		},
		{
			zipCode: "20147",
			city: "Ashburn",
			state: "VA",
			averagePrice: 585000,
			marketTrend: "stable",
		},
		{
			zipCode: "11226",
			city: "Brooklyn",
			state: "NY",
			averagePrice: 680000,
			marketTrend: "up",
		},
	],
};

const RISK_CONFIDENCE: Record<string, number> = {
	"Conservative (Low risk, stable returns)": 0.88,
	"Moderate (Balanced risk-return)": 0.78,
	"Aggressive (Higher risk, higher potential returns)": 0.7,
};

const TIMELINE_RADIUS: Array<{ keyword: string; radius: number }> = [
	{ keyword: "ASAP", radius: 15 },
	{ keyword: "1-3", radius: 20 },
	{ keyword: "3-6", radius: 30 },
	{ keyword: "6-12", radius: 40 },
];

const deriveGoalFromPersonaGoal = (
	personaGoal: PersonaGoal,
	fallback: Goal,
): Goal => {
	const selectedGoals =
		personaGoal.goals?.map((goal) => goal.toLowerCase()) ?? [];

	if (
		selectedGoals.some(
			(goal) =>
				goal.includes("passive income") || goal.includes("house hacking"),
		)
	) {
		return "cashflow";
	}
	if (
		selectedGoals.some(
			(goal) => goal.includes("quick profits") || goal.includes("flip"),
		)
	) {
		return "flip";
	}
	if (
		selectedGoals.some(
			(goal) =>
				goal.includes("wealth") ||
				goal.includes("legacy") ||
				goal.includes("diversification"),
		)
	) {
		return "appreciation";
	}
	if (selectedGoals.some((goal) => goal.includes("tax"))) {
		return "referrals";
	}
	if (selectedGoals.some((goal) => goal.includes("referral"))) {
		return "referrals";
	}

	return fallback;
};

const derivePersonaFromStrategy = (
	investmentStrategy: string,
	fallback: Persona,
): Persona => {
	if (investmentStrategy.includes("Flip")) return "wholesaler";
	if (investmentStrategy.includes("Mixed")) return "agent";
	if (investmentStrategy.includes("Development")) return "agent";
	return fallback;
};

const buildSuggestions = (
	personaGoal: PersonaGoal,
	goalKey: Goal,
): WizardSuggestion[] => {
	const baseConfidence = RISK_CONFIDENCE[personaGoal.riskTolerance] ?? 0.75;
	const focus = GOAL_FOCUS[goalKey];
	const budget = personaGoal.budget || "your budget";
	const propertyType = personaGoal.propertyType || "target properties";
	const strategy = personaGoal.investmentStrategy || "your preferred strategy";
	const timeline = personaGoal.timeline || "your target timeline";

	return [
		{
			id: "strategy",
			title: `${strategy} roadmap`,
			description: `Balance your ${strategy.toLowerCase()} approach with ${propertyType.toLowerCase()} in markets priced around ${budget}.`,
			confidence: Math.min(0.95, baseConfidence + 0.1),
			reasoning: `Historical comps show that investors pursuing ${strategy.toLowerCase()} can ${focus} when purchase prices stay within ${budget}.`,
		},
		{
			id: "timeline",
			title: `${timeline} deployment plan`,
			description: `Sequence acquisitions so due diligence, rehab, and listing align with a ${timeline.toLowerCase()} horizon.`,
			confidence: Math.min(0.92, baseConfidence + 0.05),
			reasoning: `Markets with strong vendor pipelines keep projects on a ${timeline.toLowerCase()} timeline, supporting reliable turn-key execution.`,
		},
		{
			id: "risk",
			title: "Risk-adjusted guardrails",
			description: `Favor submarkets with rental absorption and comp velocity that match your ${personaGoal.riskTolerance.toLowerCase() || "risk profile"}.`,
			confidence: baseConfidence,
			reasoning: `Portfolio simulations indicate ${personaGoal.riskTolerance.toLowerCase() || "balanced"} investors maintain upside while limiting downside by staying inside high-demand corridors.`,
		},
	];
};

const buildRecommendations = (
	personaGoal: PersonaGoal,
	goalKey: Goal,
): ZipCodeRecommendation[] => {
	const recs = GOAL_RECOMMENDATIONS[goalKey] ?? GOAL_RECOMMENDATIONS.cashflow;
	const baseConfidence = RISK_CONFIDENCE[personaGoal.riskTolerance] ?? 0.75;
	const propertyType = personaGoal.propertyType || "target properties";
	const budget = personaGoal.budget || "your budget range";
	const focus = GOAL_FOCUS[goalKey];
	const timeline = personaGoal.timeline || "your timeline";

	return recs.map((template, index) => {
		const score = Math.min(0.97, baseConfidence + index * 0.07);
		return {
			...template,
			score,
			summary: `${template.city} ${template.state} offers ${propertyType.toLowerCase()} inventory aligned with ${budget} while letting you ${focus}.`,
			reasons: [
				`Active buyer demand for ${propertyType.toLowerCase()} within ${budget}.`,
				`Local absorption timelines match your ${timeline.toLowerCase()} plan.`,
				`Investor exit data indicates you can ${focus}.`,
			],
		} satisfies ZipCodeRecommendation;
	});
};

const calculateRadius = (personaGoal: PersonaGoal): number => {
	const timeline = personaGoal.timeline || "";
	const baseRadius =
		TIMELINE_RADIUS.find(({ keyword }) => timeline.includes(keyword))?.radius ??
		35;

	if (personaGoal.riskTolerance.includes("Conservative"))
		return Math.max(10, baseRadius - 10);
	if (personaGoal.riskTolerance.includes("Aggressive")) return baseRadius + 10;
	return baseRadius;
};

const isPersonaGoalComplete = (personaGoal: PersonaGoal) =>
	Boolean(
		personaGoal.propertyType &&
			personaGoal.budget &&
			personaGoal.timeline &&
			personaGoal.investmentStrategy &&
			personaGoal.riskTolerance &&
			personaGoal.goals.length > 0,
	);

export default function PersonaGoalWizard({
	open,
	onOpenChange,
	onComplete,
	initialPersonaGoal,
	defaultPersona = "investor",
	defaultGoal = "cashflow",
}: PersonaGoalWizardProps) {
	const mergedInitialGoal: PersonaGoal = useMemo(
		() => ({
			...INITIAL_GOAL_STATE,
			...initialPersonaGoal,
			goals: initialPersonaGoal?.goals ?? [],
		}),
		[initialPersonaGoal],
	);

	const [stepIndex, setStepIndex] = useState(0);
	const [personaGoal, setPersonaGoal] =
		useState<PersonaGoal>(mergedInitialGoal);
	const [suggestions, setSuggestions] = useState<WizardSuggestion[]>([]);
	const [recommendations, setRecommendations] = useState<
		ZipCodeRecommendation[]
	>([]);
	const [selectedZipCodes, setSelectedZipCodes] = useState<string[]>([]);

	useEffect(() => {
		if (open) {
			setStepIndex(0);
			setPersonaGoal(mergedInitialGoal);
			setSuggestions([]);
			setRecommendations([]);
			setSelectedZipCodes([]);
		}
	}, [mergedInitialGoal, open]);

	const derivedGoal = useMemo(
		() => deriveGoalFromPersonaGoal(personaGoal, defaultGoal),
		[defaultGoal, personaGoal],
	);

	const derivedPersona = useMemo(
		() =>
			derivePersonaFromStrategy(personaGoal.investmentStrategy, defaultPersona),
		[defaultPersona, personaGoal.investmentStrategy],
	);

	const canContinue = useMemo(() => {
		if (stepIndex === 0) return isPersonaGoalComplete(personaGoal);
		if (stepIndex === 2) return selectedZipCodes.length > 0;
		return true;
	}, [personaGoal, selectedZipCodes.length, stepIndex]);

	const handleNext = () => {
		if (stepIndex === 0) {
			const nextSuggestions = buildSuggestions(personaGoal, derivedGoal);
			const nextRecommendations = buildRecommendations(
				personaGoal,
				derivedGoal,
			);
			setSuggestions(nextSuggestions);
			setRecommendations(nextRecommendations);
			setSelectedZipCodes(
				nextRecommendations.length ? [nextRecommendations[0].zipCode] : [],
			);
		}
		setStepIndex((prev) => Math.min(prev + 1, STEP_METADATA.length - 1));
	};

	const handleBack = () => {
		setStepIndex((prev) => Math.max(prev - 1, 0));
	};

	const progressValue = ((stepIndex + 1) / STEP_METADATA.length) * 100;

	const handleApply = () => {
		const radius = calculateRadius(personaGoal);
		const suggestion = deriveSuggestion(derivedPersona, derivedGoal);

		onComplete({
			zipCodes: selectedZipCodes,
			radius,
			personaGoal,
			persona: derivedPersona,
			goal: derivedGoal,
			message: suggestion.message,
			suggestions,
			recommendations,
		});
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>AI Location Wizard</DialogTitle>
					<DialogDescription>
						Follow the guided steps so we can tailor real estate locations to
						your investing goals.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-2 space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium">
								{STEP_METADATA[stepIndex].title}
							</p>
							<p className="text-muted-foreground text-sm">
								{STEP_METADATA[stepIndex].description}
							</p>
						</div>
						<Badge variant="secondary">
							Step {stepIndex + 1} of {STEP_METADATA.length}
						</Badge>
					</div>
					<Progress value={progressValue} />
				</div>

				<div className="mt-6 max-h-[60vh] overflow-y-auto pr-2">
					{stepIndex === 0 && (
						<PersonaGoalStep
							data={personaGoal}
							onChange={(updated) =>
								setPersonaGoal((prev) => ({ ...prev, ...updated }))
							}
						/>
					)}
					{stepIndex === 1 && <SuggestionsStep suggestions={suggestions} />}
					{stepIndex === 2 && (
						<RecommendationsStep
							recommendations={recommendations}
							selectedZipCodes={selectedZipCodes}
							onToggleSelection={(zip) => {
								setSelectedZipCodes((prev) =>
									prev.includes(zip)
										? prev.filter((value) => value !== zip)
										: [...prev, zip],
								);
							}}
						/>
					)}
					{stepIndex === 3 && (
						<ApplyStep
							recommendations={recommendations}
							selectedZipCodes={selectedZipCodes}
							onApply={handleApply}
							onSavePreferences={handleApply}
						/>
					)}
				</div>

				<div className="mt-6 flex items-center justify-between">
					<Button
						variant="ghost"
						onClick={handleBack}
						disabled={stepIndex === 0}
					>
						Back
					</Button>
					{stepIndex < STEP_METADATA.length - 1 ? (
						<Button onClick={handleNext} disabled={!canContinue}>
							Continue
						</Button>
					) : (
						<Button
							onClick={handleApply}
							disabled={!canContinue || selectedZipCodes.length === 0}
						>
							Apply to Search
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
