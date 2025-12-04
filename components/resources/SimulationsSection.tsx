"use client";

import { simulations } from "@/constants/resourcesData";
import type { Simulation } from "@/types/_dashboard/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { BarChart3, MessageCircle, TrendingUp } from "lucide-react";

export function SimulationsSection() {
	const handleViewInDiscord = (discordLink: string) => {
		window.open(discordLink, "_blank", "noopener,noreferrer");
	};

	const getDifficultyColor = (difficulty: Simulation["difficulty"]) => {
		const colors: Record<NonNullable<Simulation["difficulty"]>, string> = {
			beginner:
				"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
			intermediate:
				"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
			advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
		};

		return difficulty ? colors[difficulty] : "";
	};

	const getTypeIcon = (type: Simulation["type"]) => {
		switch (type) {
			case "roi":
				return <TrendingUp className="h-5 w-5 text-primary" />;
			case "market-analysis":
				return <BarChart3 className="h-5 w-5 text-primary" />;
			case "deal-comparison":
				return <BarChart3 className="h-5 w-5 text-primary" />;
			case "portfolio":
				return <TrendingUp className="h-5 w-5 text-primary" />;
			default:
				return <BarChart3 className="h-5 w-5 text-primary" />;
		}
	};

	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
					<BarChart3 className="h-5 w-5 text-primary" />
				</div>
				<div>
					<h2 className="font-semibold text-2xl">Investment Simulations</h2>
					<p className="text-muted-foreground text-sm">
						Access simulation tools and templates in our Discord community
					</p>
				</div>
			</div>

			{/* Simulations Grid */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{simulations.map((simulation) => (
					<Card
						key={simulation.id}
						className="group transition-all hover:shadow-lg"
					>
						<CardHeader className="p-4">
							<div className="mb-3 flex items-start justify-between">
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
									{getTypeIcon(simulation.type)}
								</div>
								{simulation.difficulty && (
									<Badge
										variant="outline"
										className={getDifficultyColor(simulation.difficulty)}
									>
										{simulation.difficulty}
									</Badge>
								)}
							</div>
							<CardTitle className="line-clamp-2 text-base">
								{simulation.name}
							</CardTitle>
							<CardDescription className="line-clamp-3 text-sm">
								{simulation.description}
							</CardDescription>
						</CardHeader>
						<CardContent className="p-4 pt-0">
							<div className="mb-3">
								<Badge
									variant="outline"
									className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
								>
									{simulation.type.replace("-", " ")}
								</Badge>
							</div>
							<Button
								onClick={() => handleViewInDiscord(simulation.discordLink)}
								className="w-full"
								variant="outline"
								size="sm"
							>
								<MessageCircle className="mr-2 h-4 w-4" />
								View in Discord
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Discord CTA */}
			<Card className="border-primary/20 bg-primary/5">
				<CardContent className="flex flex-col items-center gap-4 p-6 text-center md:flex-row md:text-left">
					<div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
						<MessageCircle className="h-8 w-8 text-primary" />
					</div>
					<div className="flex-1">
						<h3 className="mb-1 font-semibold text-lg">
							Join Our Discord Community
						</h3>
						<p className="text-muted-foreground text-sm">
							Get access to all simulation tools, connect with other investors,
							and get real-time support from our team.
						</p>
					</div>
					<Button
						onClick={() => handleViewInDiscord("https://discord.gg/BNrsYRPtFN")}
						className="flex-shrink-0"
					>
						Join Discord
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
