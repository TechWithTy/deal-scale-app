"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserStore } from "@/lib/stores/userStore";
import { Info, Users } from "lucide-react";
import { useMemo } from "react";

interface CreditBucket {
	allotted: number;
	used: number;
}

interface CreditsState {
	ai: CreditBucket;
	leads: CreditBucket;
	skipTraces: CreditBucket;
}

function bucketRemaining(b: CreditBucket) {
	return Math.max(0, (b?.allotted ?? 0) - (b?.used ?? 0));
}

export default function TeamCreditsBanner() {
	const credits = useUserStore((s) => s.credits) as CreditsState;

	const summary = useMemo(() => {
		const ai = credits?.ai ? bucketRemaining(credits.ai) : 0;
		const leads = credits?.leads ? bucketRemaining(credits.leads) : 0;
		const skip = credits?.skipTraces ? bucketRemaining(credits.skipTraces) : 0;
		return { ai, leads, skip };
	}, [credits]);

	return (
		<Card className="mb-4 border bg-muted/30 p-3">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<Users className="h-4 w-4" />
					<div className="font-medium">Team Credits</div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Info className="h-4 w-4 text-muted-foreground" />
							</TooltipTrigger>
							<TooltipContent>
								<p>These balances are shared across your organization.</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				<div className="flex flex-wrap items-center gap-2 text-sm">
					<Badge variant="secondary">AI: {summary.ai}</Badge>
					<Badge variant="secondary">Leads: {summary.leads}</Badge>
					<Badge variant="secondary">Skip Traces: {summary.skip}</Badge>
				</div>
			</div>

			<div className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
				<Badge variant="outline">Team Management</Badge>
				<Badge variant="outline">Sprint 11</Badge>
				<Badge variant="outline">Medium</Badge>
				<Badge variant="outline">To Do</Badge>
				<Badge variant="outline">Scenario: View Shared Credits</Badge>
			</div>
		</Card>
	);
}
