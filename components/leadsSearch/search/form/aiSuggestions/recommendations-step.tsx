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
import { Checkbox } from "@/components/ui/checkbox";
import {
	MapPin,
	TrendingUp,
	TrendingDown,
	Minus,
	DollarSign,
	Users,
	Building,
} from "lucide-react";

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

interface RecommendationsStepProps {
	recommendations: ZipCodeRecommendation[];
	selectedZipCodes: string[];
	onToggleSelection: (zipCode: string) => void;
}

const formatPrice = (price: number) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price);
};

const getTrendIcon = (trend: "up" | "down" | "stable") => {
	switch (trend) {
		case "up":
			return <TrendingUp className="h-4 w-4 text-green-600" />;
		case "down":
			return <TrendingDown className="h-4 w-4 text-red-600" />;
		default:
			return <Minus className="h-4 w-4 text-gray-600" />;
	}
};

const getTrendColor = (trend: "up" | "down" | "stable") => {
	switch (trend) {
		case "up":
			return "text-green-600 bg-green-50";
		case "down":
			return "text-red-600 bg-red-50";
		default:
			return "text-gray-600 bg-gray-50";
	}
};

const getScoreColor = (score: number) => {
	if (score >= 0.9) return "bg-green-100 text-green-800";
	if (score >= 0.7) return "bg-yellow-100 text-yellow-800";
	return "bg-red-100 text-red-800";
};

export default function RecommendationsStep({
	recommendations,
	selectedZipCodes,
	onToggleSelection,
}: RecommendationsStepProps) {
	if (recommendations.length === 0) {
		return (
			<div className="text-center py-12">
				<MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
				<p className="text-muted-foreground">
					Generating zip code recommendations...
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="text-center mb-8">
				<h3 className="text-2xl font-semibold mb-2">Recommended Zip Codes</h3>
				<p className="text-muted-foreground">
					Based on your goals and market analysis, here are the top zip codes
					for your investment strategy
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{recommendations.map((rec) => (
					<Card
						key={rec.zipCode}
						className={`relative transition-all duration-200 ${
							selectedZipCodes.includes(rec.zipCode)
								? "ring-2 ring-primary shadow-lg"
								: ""
						}`}
					>
						<CardHeader className="pb-4">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-primary/10 rounded-full">
										<MapPin className="h-5 w-5 text-primary" />
									</div>
									<div>
										<CardTitle className="text-xl">{rec.zipCode}</CardTitle>
										<CardDescription className="text-base">
											{rec.city}, {rec.state}
										</CardDescription>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Badge className={getScoreColor(rec.score)}>
										{Math.round(rec.score * 100)}% Match
									</Badge>
									<Checkbox
										checked={selectedZipCodes.includes(rec.zipCode)}
										onCheckedChange={() => onToggleSelection(rec.zipCode)}
									/>
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-4">
							{/* Market Trend */}
							<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
								<div className="flex items-center gap-2">
									{getTrendIcon(rec.marketTrend)}
									<span className="font-medium">Market Trend</span>
								</div>
								<Badge className={getTrendColor(rec.marketTrend)}>
									{rec.marketTrend.charAt(0).toUpperCase() +
										rec.marketTrend.slice(1)}
								</Badge>
							</div>

							{/* Summary */}
							<div>
								<p className="text-sm font-medium text-muted-foreground mb-1">
									Summary
								</p>
								<p className="text-sm leading-relaxed">{rec.summary}</p>
							</div>

							{/* Key Metrics */}
							<div className="grid grid-cols-2 gap-4">
								<div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
									<DollarSign className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs text-muted-foreground">Avg Price</p>
										<p className="font-semibold">
											{formatPrice(rec.averagePrice)}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
									<Building className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-xs text-muted-foreground">Match Score</p>
										<p className="font-semibold">
											{Math.round(rec.score * 100)}%
										</p>
									</div>
								</div>
							</div>

							{/* Reasons */}
							<div>
								<p className="text-sm font-medium text-muted-foreground mb-2">
									Why this location?
								</p>
								<div className="flex flex-wrap gap-1">
									{rec.reasons.map((reason, index) => (
										<Badge key={index} variant="outline" className="text-xs">
											{reason}
										</Badge>
									))}
								</div>
							</div>

							{selectedZipCodes.includes(rec.zipCode) && (
								<div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
									<p className="text-sm text-primary font-medium">
										✓ Selected for application
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{selectedZipCodes.length > 0 && (
				<Card className="bg-primary/5 border-primary/20">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<h4 className="font-semibold text-primary mb-1">
									{selectedZipCodes.length} location
									{selectedZipCodes.length !== 1 ? "s" : ""} selected
								</h4>
								<p className="text-sm text-muted-foreground">
									These locations will be applied to your search filters and
									saved to your preferences.
								</p>
							</div>
							<div className="flex gap-2">
								{selectedZipCodes.map((zip) => (
									<Badge
										key={zip}
										className="bg-primary text-primary-foreground"
									>
										{zip}
									</Badge>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
