/**
 * Plan Features List Component
 * Displays locked/unlocked features with links and tooltips
 */

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PlanFeature } from "@/lib/mock/plans";
import { ArrowRight, CheckCircle2, Info, Lock } from "lucide-react";
import Link from "next/link";

interface PlanFeaturesListProps {
	features: PlanFeature[];
	planId: string;
}

export function PlanFeaturesList({ features, planId }: PlanFeaturesListProps) {
	if (!features || features.length === 0) return null;

	return (
		<div className="mb-6">
			<div className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
				FEATURES
			</div>
			<TooltipProvider>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{features.map((feature, index) => {
						const FeatureContent = (
							<>
								<div className="flex flex-1 items-center gap-2.5">
									{feature.unlocked ? (
										<CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
									) : (
										<Lock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
									)}
									<span
										className={`text-sm ${
											feature.unlocked
												? "font-medium text-foreground"
												: "text-muted-foreground line-through"
										}`}
									>
										{feature.name}
									</span>
									{feature.link && feature.unlocked && (
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														window.open(
															feature.link,
															"_blank",
															"noopener,noreferrer",
														);
													}}
													className="flex-shrink-0 text-muted-foreground transition-colors hover:text-primary"
													aria-label="Learn more about this feature"
												>
													<Info className="h-3.5 w-3.5" />
												</button>
											</TooltipTrigger>
											<TooltipContent side="top">
												<p>Learn more about this feature on DealScale</p>
											</TooltipContent>
										</Tooltip>
									)}
								</div>
								{feature.link && feature.unlocked && (
									<ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
								)}
							</>
						);

						const containerClassName = `flex items-center justify-between gap-2 rounded-md p-2 transition-colors ${
							feature.unlocked
								? "bg-green-50 dark:bg-green-950/20"
								: "bg-muted/50"
						} ${feature.link && feature.unlocked ? "hover:bg-green-100 dark:hover:bg-green-950/30 cursor-pointer" : ""}`;

						if (feature.link && feature.unlocked) {
							return (
								<Link
									key={`${planId}-plan-feature-${index}`}
									href={feature.link}
									target="_blank"
									rel="noopener noreferrer"
									className={containerClassName}
								>
									{FeatureContent}
								</Link>
							);
						}

						return (
							<div
								key={`${planId}-plan-feature-${index}`}
								className={containerClassName}
							>
								{FeatureContent}
							</div>
						);
					})}
				</div>
			</TooltipProvider>
		</div>
	);
}
