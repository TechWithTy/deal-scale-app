import type React from "react";
import { motion } from "framer-motion";
import { Badge } from "@root/components/ui/badge";
import { cn } from "@root/lib/_utils";
import { formatScore } from "./utils";

interface ScoreBlockProps {
	score: number;
	hasRankChanged: boolean | undefined;
	rankImproved: boolean | undefined;
	isCurrentUser?: boolean;
	rankDelta?: number;
	city?: string;
	dealsCount?: number;
}

/**
 * Average home prices by city (based on 2024-2025 market data).
 * 
 * PRODUCTION CONSIDERATIONS:
 * - Fetch from API: GET /api/real-estate/city-averages
 * - Cache in Redis with 24-hour TTL
 * - Update quarterly based on MLS data
 * - Handle edge cases:
 *   - New cities not in database → use regional or national average
 *   - City name variations → normalize (e.g., "San Fran" → "San Francisco")
 *   - International cities → currency conversion
 *   - Null/missing city → use default safely
 * 
 * SOURCE: National Association of Realtors (NAR) 2024 Q4 Data
 */
const cityAverageDealAmounts: Record<string, number> = {
	"Miami": 485000,      // South Florida luxury market
	"Seattle": 825000,    // Pacific Northwest tech hub premium
	"Austin": 575000,     // Texas growth market
	"Phoenix": 465000,    // Southwest affordable market
	"Denver": 625000,     // Mountain West premium
	"Atlanta": 385000,    // Southeast affordable market
	"default": 475000,    // National median home price
};

export const ScoreBlock: React.FC<ScoreBlockProps> = ({
	score,
	hasRankChanged,
	rankImproved,
	isCurrentUser = false,
	rankDelta,
	city,
	dealsCount = 0,
}) => {
	/**
	 * Calculate estimated commission: (avg_deal_amount * 3%) * number_of_deals
	 * 
	 * EDGE CASES HANDLED:
	 * 1. No city provided → use default average
	 * 2. Zero deals → show $0 (always display)
	 * 3. City not in lookup → use default average
	 * 4. City name with extra spaces → trim before lookup
	 * 5. Negative deals (data corruption) → Math.max ensures minimum 0
	 * 
	 * PRODUCTION TODO:
	 * - Add user-specific commission rate (not all agents get 3%)
	 * - Factor in team splits
	 * - Consider deal value variance (not all deals = avg)
	 * - Add confidence interval display
	 */
	const calculateCommission = () => {
		// Extract city name and normalize
		const cityName = city?.split(",")[0]?.trim() || "default";
		const avgDealAmount = cityAverageDealAmounts[cityName] || cityAverageDealAmounts.default;
		
		// Ensure non-negative values
		const validDealsCount = Math.max(0, dealsCount);
		const commission = (avgDealAmount * 0.03) * validDealsCount;
		
		return commission;
	};

	const estimatedCommission = calculateCommission();

	return (
		<div className="flex w-full shrink-0 flex-row flex-wrap items-center justify-center gap-2 md:w-auto md:flex-col md:items-end md:justify-start md:gap-1 lg:w-full lg:flex-row lg:justify-center">
			{/* Score and rank delta together */}
			<div className="flex items-center gap-2">
				<motion.div
					key={score}
					initial={{ scale: 1 }}
					animate={{ scale: hasRankChanged ? [1, 1.1, 1] : 1 }}
					transition={{ duration: 0.6 }}
				className={cn(
					"font-bold text-sm transition-colors duration-smooth sm:text-base md:text-lg lg:text-xl",
					isCurrentUser ? "text-primary" : "text-foreground",
				)}
				>
					{formatScore(score)}
				</motion.div>

				{hasRankChanged && typeof rankDelta === "number" && (
					<Badge
						variant={rankImproved ? "default" : "destructive"}
						className="text-xs"
					>
						{rankImproved ? "↗" : "↘"} {Math.abs(rankDelta)}
					</Badge>
				)}
			</div>

			{/* Commission estimate - horizontal on mobile, vertical on desktop, horizontal on lg */}
			<div className="rounded-md bg-emerald-50 px-2 py-1 text-left dark:bg-emerald-950/30 md:text-right lg:px-3 lg:py-1.5 lg:text-center">
				<div className="font-semibold text-[11px] text-emerald-700 dark:text-emerald-400 sm:text-xs lg:text-sm">
					${estimatedCommission.toLocaleString("en-US", {
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					})}
				</div>
				<div className="text-[9px] text-emerald-600/70 dark:text-emerald-500/70 lg:text-[10px]">
					Est. Profit
				</div>
			</div>
		</div>
	);
};
