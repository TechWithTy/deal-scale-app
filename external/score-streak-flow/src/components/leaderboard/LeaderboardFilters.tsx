import { Button } from "@root/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@root/components/ui/select";
import { Calendar, Users, Building2, User } from "lucide-react";
import { QuickCreditActions } from "./QuickCreditActions";

export type TimePeriod = "today" | "week" | "month" | "alltime";
export type LeaderboardType = "individual" | "team" | "regional";

interface LeaderboardFiltersProps {
	timePeriod: TimePeriod;
	onTimePeriodChange: (period: TimePeriod) => void;
	leaderboardType: LeaderboardType;
	onLeaderboardTypeChange: (type: LeaderboardType) => void;
	currentUserRank?: number;
	currentUserId?: string;
	currentUserName?: string;
}

const timePeriodLabels: Record<TimePeriod, string> = {
	today: "Today",
	week: "This Week",
	month: "This Month",
	alltime: "All Time",
};

const leaderboardTypeLabels: Record<LeaderboardType, { label: string; icon: any }> = {
	individual: { label: "Individual", icon: User },
	team: { label: "Team/Office", icon: Users },
	regional: { label: "Regional", icon: Building2 },
};

export function LeaderboardFilters({
	timePeriod,
	onTimePeriodChange,
	leaderboardType,
	onLeaderboardTypeChange,
	currentUserRank,
	currentUserId,
	currentUserName,
}: LeaderboardFiltersProps) {
	const isTop10 = currentUserRank ? currentUserRank <= 10 : false;

	return (
		<div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 sm:gap-3 sm:p-3">
			{/* Time Period Filter */}
			<div className="flex items-center gap-2">
				<Calendar className="h-4 w-4 text-muted-foreground" />
				<Select value={timePeriod} onValueChange={onTimePeriodChange}>
					<SelectTrigger className="w-[90px] whitespace-nowrap sm:w-[140px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(timePeriodLabels).map(([value, label]) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Leaderboard Type Tabs */}
			<div className="flex gap-1 rounded-md border p-1">
				{Object.entries(leaderboardTypeLabels).map(([type, { label, icon: Icon }]) => (
					<Button
						key={type}
						variant={leaderboardType === type ? "default" : "ghost"}
						size="sm"
						onClick={() => onLeaderboardTypeChange(type as LeaderboardType)}
						className="gap-1 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
						title={label}
					>
						<Icon className="h-3.5 w-3.5" />
						<span className="hidden sm:inline">{label}</span>
					</Button>
				))}
			</div>

			{/* Quick Credit Actions */}
			<QuickCreditActions
				isTop10={isTop10}
				currentUserRank={currentUserRank}
				currentUserId={currentUserId}
				currentUserName={currentUserName}
			/>
		</div>
	);
}

