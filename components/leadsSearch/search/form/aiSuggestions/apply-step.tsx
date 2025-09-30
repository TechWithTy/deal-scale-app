"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Save, Filter, Bell } from "lucide-react";

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
			<div className="text-center mb-8">
				<div className="flex justify-center mb-4">
					<div className="p-3 bg-green-100 rounded-full">
						<CheckCircle className="h-8 w-8 text-green-600" />
					</div>
				</div>
				<h3 className="text-2xl font-semibold mb-2">
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
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{selectedRecommendations.map((rec) => (
							<div
								key={rec.zipCode}
								className="p-4 border rounded-lg bg-muted/20"
							>
								<div className="flex items-center gap-2 mb-2">
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
								<p className="text-xs text-muted-foreground mt-1">
									Avg: ${rec.averagePrice.toLocaleString()}
								</p>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Action Options */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
						<p className="text-xs text-muted-foreground mt-2">
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
						<p className="text-xs text-muted-foreground mt-2">
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
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center p-4 bg-white rounded-lg border">
							<p className="text-2xl font-bold text-primary">
								${totalMarketValue.toLocaleString()}
							</p>
							<p className="text-sm text-muted-foreground">
								Total Market Value
							</p>
						</div>
						<div className="text-center p-4 bg-white rounded-lg border">
							<p className="text-2xl font-bold text-green-600">
								{averageScore}%
							</p>
							<p className="text-sm text-muted-foreground">
								Average Match Score
							</p>
						</div>
						<div className="text-center p-4 bg-white rounded-lg border">
							<p className="text-2xl font-bold text-blue-600">
								{totalSelected}
							</p>
							<p className="text-sm text-muted-foreground">Areas Selected</p>
						</div>
					</div>

					<div className="bg-white p-4 rounded-lg border">
						<h4 className="font-medium mb-2">Market Trend Analysis</h4>
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
			<Card className="bg-green-50 border-green-200">
				<CardContent className="pt-6">
					<div className="text-center">
						<CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
						<h3 className="text-xl font-semibold text-green-800 mb-2">
							Setup Complete!
						</h3>
						<p className="text-green-700 mb-4">
							Your personalized zip code recommendations are ready. Click below
							to start finding properties that match your investment goals.
						</p>
						<div className="flex gap-3 justify-center">
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
