"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityLineGraphContainer } from "@/external/activity-graph/components";
import type {
	ActivityDataPoint,
	ChartConfigLocal,
} from "@/external/activity-graph/types";

interface CampaignActivityStepProps {
	onBack?: () => void;
	onNext?: () => void;
}

// Mock data for demonstration - replace with real campaign data
const mockCampaignData: ActivityDataPoint[] = [
	{
		timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
		calls: 15,
		texts: 25,
		emails: 8,
		social: 12,
	},
	{
		timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
		calls: 22,
		texts: 31,
		emails: 12,
		social: 18,
	},
	{
		timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
		calls: 18,
		texts: 28,
		emails: 15,
		social: 22,
	},
	{
		timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
		calls: 25,
		texts: 35,
		emails: 18,
		social: 28,
	},
	{
		timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
		calls: 32,
		texts: 42,
		emails: 22,
		social: 35,
	},
	{
		timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
		calls: 28,
		texts: 38,
		emails: 25,
		social: 32,
	},
	{
		timestamp: new Date().toISOString(),
		calls: 35,
		texts: 45,
		emails: 28,
		social: 38,
	},
];

const campaignActivityConfig: ChartConfigLocal = {
	calls: {
		label: "Calls Made",
		color: "hsl(var(--chart-1))",
	},
	texts: {
		label: "Texts Sent",
		color: "hsl(var(--chart-2))",
	},
	emails: {
		label: "Emails Sent",
		color: "hsl(var(--chart-3))",
	},
	social: {
		label: "Social Engagements",
		color: "hsl(var(--chart-4))",
	},
};

export default function CampaignActivityStep({
	onBack,
	onNext,
}: CampaignActivityStepProps) {
	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-foreground">
					Campaign Activity
				</h2>
				<p className="text-muted-foreground">
					View real-time activity and performance metrics for your campaign
				</p>
			</div>

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="performance">Performance</TabsTrigger>
					<TabsTrigger value="leads">Lead Activity</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="bg-card p-4 rounded-lg border">
							<div className="text-2xl font-bold text-primary">156</div>
							<div className="text-sm text-muted-foreground">Total Calls</div>
						</div>
						<div className="bg-card p-4 rounded-lg border">
							<div className="text-2xl font-bold text-primary">214</div>
							<div className="text-sm text-muted-foreground">Texts Sent</div>
						</div>
						<div className="bg-card p-4 rounded-lg border">
							<div className="text-2xl font-bold text-primary">128</div>
							<div className="text-sm text-muted-foreground">Emails Sent</div>
						</div>
						<div className="bg-card p-4 rounded-lg border">
							<div className="text-2xl font-bold text-primary">185</div>
							<div className="text-sm text-muted-foreground">
								Social Engagements
							</div>
						</div>
					</div>

					<div className="bg-card p-6 rounded-lg border">
						<h3 className="text-lg font-semibold mb-4">Activity Trends</h3>
						<ActivityLineGraphContainer
							data={mockCampaignData}
							config={campaignActivityConfig}
							defaultLines={["calls", "texts", "emails", "social"]}
							defaultRange="7d"
							title=""
							description=""
						/>
					</div>
				</TabsContent>

				<TabsContent value="performance" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-card p-4 rounded-lg border">
							<h4 className="font-medium mb-2">Conversion Rate</h4>
							<div className="text-3xl font-bold text-green-600">12.5%</div>
							<div className="text-sm text-muted-foreground">
								+2.1% from last week
							</div>
						</div>
						<div className="bg-card p-4 rounded-lg border">
							<h4 className="font-medium mb-2">Response Rate</h4>
							<div className="text-3xl font-bold text-blue-600">34.2%</div>
							<div className="text-sm text-muted-foreground">
								+5.3% from last week
							</div>
						</div>
					</div>

					<div className="bg-card p-6 rounded-lg border">
						<h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-sm">Call Success Rate</span>
								<span className="font-medium">78%</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm">Text Response Rate</span>
								<span className="font-medium">42%</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm">Email Open Rate</span>
								<span className="font-medium">23%</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm">Social Engagement Rate</span>
								<span className="font-medium">15%</span>
							</div>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="leads" className="space-y-4">
					<div className="bg-card p-4 rounded-lg border">
						<h4 className="font-medium mb-4">Recent Lead Activity</h4>
						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 bg-muted/50 rounded">
								<div>
									<div className="font-medium">John Smith</div>
									<div className="text-sm text-muted-foreground">
										Responded to text
									</div>
								</div>
								<div className="text-sm text-muted-foreground">2 hours ago</div>
							</div>
							<div className="flex items-center justify-between p-3 bg-muted/50 rounded">
								<div>
									<div className="font-medium">Sarah Johnson</div>
									<div className="text-sm text-muted-foreground">
										Called back
									</div>
								</div>
								<div className="text-sm text-muted-foreground">4 hours ago</div>
							</div>
							<div className="flex items-center justify-between p-3 bg-muted/50 rounded">
								<div>
									<div className="font-medium">Mike Davis</div>
									<div className="text-sm text-muted-foreground">
										Email opened
									</div>
								</div>
								<div className="text-sm text-muted-foreground">6 hours ago</div>
							</div>
						</div>
					</div>
				</TabsContent>
			</Tabs>

			{/* Navigation */}
			<div className="flex justify-between pt-4">
				{onBack && (
					<button
						type="button"
						onClick={onBack}
						className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
					>
						Back
					</button>
				)}
				{onNext && (
					<button
						type="button"
						onClick={onNext}
						className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
					>
						Continue
					</button>
				)}
			</div>
		</div>
	);
}
