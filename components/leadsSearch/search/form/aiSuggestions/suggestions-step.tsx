"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, TrendingUp, Clock, Shield, Target } from "lucide-react";

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
			<div className="text-center py-12">
				<Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
				<p className="text-muted-foreground">
					Generating personalized suggestions...
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="text-center mb-8">
				<h3 className="text-2xl font-semibold mb-2">
					AI-Powered Investment Suggestions
				</h3>
				<p className="text-muted-foreground">
					Based on your goals and market analysis, here are our personalized
					recommendations
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{suggestions.map((suggestion) => {
					const Icon = getSuggestionIcon(suggestion.title);
					return (
						<Card key={suggestion.id} className="relative overflow-hidden">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-2">
										<div
											className={`p-2 rounded-full ${getConfidenceColor(suggestion.confidence)}`}
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

								<div className="bg-muted/50 p-3 rounded-lg">
									<p className="text-xs font-medium text-muted-foreground mb-1">
										AI Reasoning:
									</p>
									<p className="text-sm">{suggestion.reasoning}</p>
								</div>

								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<div
										className={`w-2 h-2 rounded-full ${getConfidenceColor(suggestion.confidence)}`}
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

			<Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
				<CardContent className="pt-6">
					<div className="flex items-start gap-4">
						<div className="p-3 bg-blue-100 rounded-full">
							<Lightbulb className="h-6 w-6 text-blue-600" />
						</div>
						<div>
							<h4 className="font-semibold text-blue-900 mb-2">
								How We Generated These Suggestions
							</h4>
							<p className="text-sm text-blue-700 leading-relaxed">
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
