"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Lightbulb, Shield, Target, TrendingUp } from "lucide-react";

interface Suggestion {
	id: string;
	title: string;
	description: string;
	confidence: number;
	reasoning: string;
}

interface SuggestionsStepProps {
	suggestions: Suggestion[];
}

const getConfidenceColor = (confidence: number) => {
	if (confidence >= 0.9) return "bg-green-500";
	if (confidence >= 0.7) return "bg-yellow-500";
	return "bg-red-500";
};

const getConfidenceLabel = (confidence: number) => {
	if (confidence >= 0.9) return "High Confidence";
	if (confidence >= 0.7) return "Medium Confidence";
	return "Low Confidence";
};

const getSuggestionIcon = (title: string) => {
	if (title.toLowerCase().includes("cash flow")) return TrendingUp;
	if (title.toLowerCase().includes("timing")) return Clock;
	if (title.toLowerCase().includes("diversify")) return Target;
	return Lightbulb;
};

export default function SuggestionsStep({ suggestions }: SuggestionsStepProps) {
	if (suggestions.length === 0) {
		return (
			<div className="py-12 text-center">
				<Lightbulb className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
				<p className="text-muted-foreground">
					Generating personalized suggestions...
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="mb-8 text-center">
				<h3 className="mb-2 font-semibold text-2xl">
					AI-Powered Investment Suggestions
				</h3>
				<p className="text-muted-foreground">
					Based on your goals and market analysis, here are our personalized
					recommendations
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{suggestions.map((suggestion) => {
					const Icon = getSuggestionIcon(suggestion.title);
					return (
						<Card key={suggestion.id} className="relative overflow-hidden">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-2">
										<div
											className={`rounded-full p-2 ${getConfidenceColor(suggestion.confidence)}`}
										>
											<Icon className="h-4 w-4 text-white" />
										</div>
										<div>
											<CardTitle className="text-lg">
												{suggestion.title}
											</CardTitle>
										</div>
									</div>
									<Badge variant="outline" className="text-xs">
										{getConfidenceLabel(suggestion.confidence)}
									</Badge>
								</div>
								<Progress
									value={suggestion.confidence * 100}
									className="mt-2"
								/>
							</CardHeader>

							<CardContent className="space-y-4">
								<CardDescription className="text-sm leading-relaxed">
									{suggestion.description}
								</CardDescription>

								<div className="rounded-lg bg-muted/50 p-3">
									<p className="mb-1 font-medium text-muted-foreground text-xs">
										AI Reasoning:
									</p>
									<p className="text-sm">{suggestion.reasoning}</p>
								</div>

								<div className="flex items-center gap-2 text-muted-foreground text-xs">
									<div
										className={`h-2 w-2 rounded-full ${getConfidenceColor(suggestion.confidence)}`}
									/>
									<span>
										{Math.round(suggestion.confidence * 100)}% match with your
										goals
									</span>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
				<CardContent className="pt-6">
					<div className="flex items-start gap-4">
						<div className="rounded-full bg-blue-100 p-3">
							<Lightbulb className="h-6 w-6 text-blue-600" />
						</div>
						<div>
							<h4 className="mb-2 font-semibold text-blue-900">
								How We Generated These Suggestions
							</h4>
							<p className="text-blue-700 text-sm leading-relaxed">
								Our AI analyzes your investment goals, risk tolerance, timeline,
								and budget against current market data, historical trends, and
								economic indicators. Each suggestion includes a confidence score
								based on how well it aligns with successful investment patterns
								in similar scenarios.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
