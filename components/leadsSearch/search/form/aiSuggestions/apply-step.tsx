"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Bell, CheckCircle, Filter, MapPin, Save } from "lucide-react";

interface ZipCodeRecommendation {
	zipCode: string;
	city: string;
	state: string;
	score: number;
	summary: string;
	reasons: string[];
	averagePrice: number;
	marketTrend: "up" | "down" | "stable";
}

interface ApplyStepProps {
	selectedZipCodes: string[];
	recommendations: ZipCodeRecommendation[];
	onApply?: () => void;
	onSavePreferences?: () => void;
	applyDisabled?: boolean;
	saveDisabled?: boolean;
}

export default function ApplyStep({
	selectedZipCodes,
	recommendations,
	onApply,
	onSavePreferences,
	applyDisabled,
	saveDisabled,
}: ApplyStepProps) {
	const selectedRecommendations = recommendations.filter((rec) =>
		selectedZipCodes.includes(rec.zipCode),
	);

	const totalSelected = selectedRecommendations.length;
	const totalMarketValue = selectedRecommendations.reduce(
		(sum, rec) => sum + rec.averagePrice,
		0,
	);
	const totalScore = selectedRecommendations.reduce(
		(sum, rec) => sum + rec.score,
		0,
	);
	const averageScore =
		totalSelected === 0 ? 0 : Math.round((totalScore / totalSelected) * 100);

	return (
		<div className="space-y-6">
			<div className="mb-8 text-center">
				<div className="mb-4 flex justify-center">
					<div className="rounded-full bg-green-100 p-3">
						<CheckCircle className="h-8 w-8 text-green-600" />
					</div>
				</div>
				<h3 className="mb-2 font-semibold text-2xl">
					Ready to Apply Your Selections
				</h3>
				<p className="text-muted-foreground">
					Review your selected zip codes and apply them to start finding
					properties that match your goals
				</p>
			</div>

			{/* Selected Recommendations Summary */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						Selected Locations ({selectedZipCodes.length})
					</CardTitle>
					<CardDescription>
						These zip codes will be applied to your property search filters
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{selectedRecommendations.map((rec) => (
							<div
								key={rec.zipCode}
								className="rounded-lg border bg-muted/20 p-4"
							>
								<div className="mb-2 flex items-center gap-2">
									<Badge className="bg-primary text-primary-foreground">
										{rec.zipCode}
									</Badge>
									<Badge variant="outline">
										{Math.round(rec.score * 100)}% Match
									</Badge>
								</div>
								<p className="font-medium text-sm">
									{rec.city}, {rec.state}
								</p>
								<p className="mt-1 text-muted-foreground text-xs">
									Avg: ${rec.averagePrice.toLocaleString()}
								</p>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Action Options */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-primary">
							<Filter className="h-5 w-5" />
							Apply to Search Filters
						</CardTitle>
						<CardDescription>
							Immediately apply these zip codes to your property search results
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={onApply}
							className="w-full"
							disabled={
								applyDisabled || !onApply || selectedZipCodes.length === 0
							}
						>
							Apply Filters Now
						</Button>
						<p className="mt-2 text-muted-foreground text-xs">
							This will update your current search to only show properties in
							selected zip codes
						</p>
					</CardContent>
				</Card>

				<Card className="border-blue-200 bg-blue-50/50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-blue-700">
							<Save className="h-5 w-5" />
							Save for Later
						</CardTitle>
						<CardDescription>
							Save these preferences for future searches and get notifications
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={onSavePreferences}
							variant="outline"
							className="w-full"
							disabled={
								saveDisabled ||
								!onSavePreferences ||
								selectedZipCodes.length === 0
							}
						>
							Save Preferences
						</Button>
						<p className="mt-2 text-muted-foreground text-xs">
							Get notified when new properties matching your criteria become
							available
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Market Insights Summary */}
			<Card className="bg-gradient-to-br from-slate-50 to-slate-100">
				<CardHeader>
					<CardTitle className="text-lg">Investment Summary</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div className="rounded-lg border bg-white p-4 text-center">
							<p className="font-bold text-2xl text-primary">
								${totalMarketValue.toLocaleString()}
							</p>
							<p className="text-muted-foreground text-sm">
								Total Market Value
							</p>
						</div>
						<div className="rounded-lg border bg-white p-4 text-center">
							<p className="font-bold text-2xl text-green-600">
								{averageScore}%
							</p>
							<p className="text-muted-foreground text-sm">
								Average Match Score
							</p>
						</div>
						<div className="rounded-lg border bg-white p-4 text-center">
							<p className="font-bold text-2xl text-blue-600">
								{totalSelected}
							</p>
							<p className="text-muted-foreground text-sm">Areas Selected</p>
						</div>
					</div>

					<div className="rounded-lg border bg-white p-4">
						<h4 className="mb-2 font-medium">Market Trend Analysis</h4>
						<div className="flex gap-2">
							{selectedRecommendations.map((rec) => (
								<Badge key={rec.zipCode} variant="outline" className="text-xs">
									{rec.zipCode}: {rec.marketTrend}
								</Badge>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Final CTA */}
			<Card className="border-green-200 bg-green-50">
				<CardContent className="pt-6">
					<div className="text-center">
						<CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
						<h3 className="mb-2 font-semibold text-green-800 text-xl">
							Setup Complete!
						</h3>
						<p className="mb-4 text-green-700">
							Your personalized zip code recommendations are ready. Click below
							to start finding properties that match your investment goals.
						</p>
						<div className="flex justify-center gap-3">
							<Button
								onClick={onApply}
								disabled={
									applyDisabled || !onApply || selectedZipCodes.length === 0
								}
							>
								Start Property Search
							</Button>
							<Button
								variant="outline"
								onClick={onSavePreferences}
								disabled={
									saveDisabled ||
									!onSavePreferences ||
									selectedZipCodes.length === 0
								}
							>
								Save & Notify Me
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
