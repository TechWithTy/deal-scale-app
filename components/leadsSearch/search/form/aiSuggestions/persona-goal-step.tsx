"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface PersonaGoal {
	propertyType: string;
	budget: string;
	timeline: string;
	investmentStrategy: string;
	riskTolerance: string;
	goals: string[];
}

interface PersonaGoalStepProps {
	data: Partial<PersonaGoal>;
	onChange: (data: Partial<PersonaGoal>) => void;
}

const propertyTypes = [
	"Single Family Home",
	"Condo/Townhouse",
	"Multi-Family (2-4 units)",
	"Apartment Building (5+ units)",
	"Commercial Property",
	"Land/Vacant Lot",
];

const budgetRanges = [
	"Under $200K",
	"$200K - $500K",
	"$500K - $1M",
	"$1M - $2M",
	"$2M - $5M",
	"Over $5M",
];

const timelines = [
	"ASAP (within 30 days)",
	"1-3 months",
	"3-6 months",
	"6-12 months",
	"12+ months",
];

const investmentStrategies = [
	"Buy & Hold (Long-term rental)",
	"Fix & Flip",
	"Short-term rental (Airbnb)",
	"REIT/Real Estate Fund",
	"Development/New Construction",
	"Mixed-use property",
];

const riskTolerances = [
	"Conservative (Low risk, stable returns)",
	"Moderate (Balanced risk-return)",
	"Aggressive (Higher risk, higher potential returns)",
];

const goalOptions = [
	"Generate passive income",
	"Build long-term wealth",
	"House hacking (live in property)",
	"Tax advantages",
	"Portfolio diversification",
	"Quick profits (flipping)",
	"Retirement planning",
	"Legacy building",
];

export default function PersonaGoalStep({
	data,
	onChange,
}: PersonaGoalStepProps) {
	const handleInputChange = (field: keyof PersonaGoal, value: string) => {
		onChange({ ...data, [field]: value });
	};

	const handleGoalToggle = (goal: string) => {
		const currentGoals = data.goals || [];
		const updatedGoals = currentGoals.includes(goal)
			? currentGoals.filter((g) => g !== goal)
			: [...currentGoals, goal];

		onChange({ ...data, goals: updatedGoals });
	};

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Property Type */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Property Type</CardTitle>
						<CardDescription>
							What type of property interests you?
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Select
							value={data.propertyType || ""}
							onValueChange={(value) =>
								handleInputChange("propertyType", value)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select property type" />
							</SelectTrigger>
							<SelectContent>
								{propertyTypes.map((type) => (
									<SelectItem key={type} value={type}>
										{type}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				{/* Budget Range */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Budget Range</CardTitle>
						<CardDescription>
							How much are you looking to invest?
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Select
							value={data.budget || ""}
							onValueChange={(value) => handleInputChange("budget", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select budget range" />
							</SelectTrigger>
							<SelectContent>
								{budgetRanges.map((range) => (
									<SelectItem key={range} value={range}>
										{range}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				{/* Timeline */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Timeline</CardTitle>
						<CardDescription>
							When do you want to make your investment?
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Select
							value={data.timeline || ""}
							onValueChange={(value) => handleInputChange("timeline", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select timeline" />
							</SelectTrigger>
							<SelectContent>
								{timelines.map((timeline) => (
									<SelectItem key={timeline} value={timeline}>
										{timeline}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				{/* Investment Strategy */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Investment Strategy</CardTitle>
						<CardDescription>
							How do you plan to approach real estate investing?
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Select
							value={data.investmentStrategy || ""}
							onValueChange={(value) =>
								handleInputChange("investmentStrategy", value)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select strategy" />
							</SelectTrigger>
							<SelectContent>
								{investmentStrategies.map((strategy) => (
									<SelectItem key={strategy} value={strategy}>
										{strategy}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>
			</div>

			{/* Risk Tolerance */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Risk Tolerance</CardTitle>
					<CardDescription>
						How comfortable are you with investment risk?
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Select
						value={data.riskTolerance || ""}
						onValueChange={(value) => handleInputChange("riskTolerance", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select risk tolerance" />
						</SelectTrigger>
						<SelectContent>
							{riskTolerances.map((tolerance) => (
								<SelectItem key={tolerance} value={tolerance}>
									{tolerance}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			{/* Investment Goals */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Investment Goals</CardTitle>
					<CardDescription>
						What are your primary objectives? (Select all that apply)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
						{goalOptions.map((goal) => (
							<div key={goal} className="flex items-center space-x-2">
								<Checkbox
									id={goal}
									checked={data.goals?.includes(goal) || false}
									onCheckedChange={() => handleGoalToggle(goal)}
								/>
								<Label
									htmlFor={goal}
									className="cursor-pointer font-normal text-sm"
								>
									{goal}
								</Label>
							</div>
						))}
					</div>
					{data.goals && data.goals.length > 0 && (
						<div className="mt-4">
							<p className="mb-2 text-muted-foreground text-sm">
								Selected goals:
							</p>
							<div className="flex flex-wrap gap-2">
								{data.goals.map((goal) => (
									<Badge key={goal} variant="secondary">
										{goal}
									</Badge>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
