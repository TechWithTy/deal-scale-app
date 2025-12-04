"use client";

import { customGPTs } from "@/constants/resourcesData";
import type { CustomGPT } from "@/types/_dashboard/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Bot, ExternalLink, Sparkles } from "lucide-react";

export function CustomGPTsSection() {
	const handleOpenTool = (url: string) => {
		window.open(url, "_blank", "noopener,noreferrer");
	};

	const getCategoryColor = (category: CustomGPT["category"]) => {
		const colors: Record<CustomGPT["category"], string> = {
			"real-estate":
				"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
			"deal-analysis":
				"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
			marketing:
				"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
			automation:
				"bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
		};

		return colors[category] || "";
	};

	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
					<Bot className="h-5 w-5 text-primary" />
				</div>
				<div>
					<h2 className="font-semibold text-2xl">Custom GPTs & AI Tools</h2>
					<p className="text-muted-foreground text-sm">
						Powerful AI assistants to accelerate your real estate business
					</p>
				</div>
			</div>

			{/* GPTs Grid */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{customGPTs.map((gpt) => (
					<Card key={gpt.id} className="group transition-all hover:shadow-lg">
						<CardHeader className="p-4">
							<div className="mb-3 flex items-start justify-between">
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-2xl">
									{gpt.icon}
								</div>
								{gpt.isPremium && (
									<Badge
										variant="outline"
										className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
									>
										<Sparkles className="mr-1 h-3 w-3" />
										Premium
									</Badge>
								)}
							</div>
							<CardTitle className="line-clamp-1 text-base">
								{gpt.name}
							</CardTitle>
							<CardDescription className="line-clamp-2 text-sm">
								{gpt.description}
							</CardDescription>
						</CardHeader>
						<CardContent className="p-4 pt-0">
							<div className="mb-3">
								<Badge
									variant="outline"
									className={getCategoryColor(gpt.category)}
								>
									{gpt.category.replace("-", " ")}
								</Badge>
							</div>
							<Button
								onClick={() => handleOpenTool(gpt.url)}
								className="w-full"
								variant="outline"
								size="sm"
							>
								<ExternalLink className="mr-2 h-4 w-4" />
								Open Tool
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
