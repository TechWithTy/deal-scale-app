import { Button } from "@root/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@root/components/ui/select";
import { Calendar, Users, Building2, User } from "lucide-react";

export type TimePeriod = "today" | "week" | "month" | "alltime";
export type LeaderboardType = "individual" | "team" | "regional";

interface LeaderboardFiltersProps {
	timePeriod: TimePeriod;
	onTimePeriodChange: (period: TimePeriod) => void;
	leaderboardType: LeaderboardType;
	onLeaderboardTypeChange: (type: LeaderboardType) => void;
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
}: LeaderboardFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
			{/* Time Period Filter */}
			<div className="flex items-center gap-2">
				<Calendar className="h-4 w-4 text-muted-foreground" />
				<Select value={timePeriod} onValueChange={onTimePeriodChange}>
					<SelectTrigger className="w-[140px]">
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
						className="gap-2"
					>
						<Icon className="h-3.5 w-3.5" />
						{label}
					</Button>
				))}
			</div>
		</div>
	);
}

