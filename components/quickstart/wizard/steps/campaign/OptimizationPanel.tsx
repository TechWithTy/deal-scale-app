"use client";

import { shallow } from "zustand/shallow";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

const OptimizationPanel = () => {
	const {
		abTestingEnabled,
		setAbTestingEnabled,
		numberPoolingEnabled,
		setNumberPoolingEnabled,
		leadCount,
	} = useCampaignCreationStore(
		(state) => ({
			abTestingEnabled: state.abTestingEnabled,
			setAbTestingEnabled: state.setAbTestingEnabled,
			numberPoolingEnabled: state.numberPoolingEnabled,
			setNumberPoolingEnabled: state.setNumberPoolingEnabled,
			leadCount: state.leadCount,
		}),
		shallow,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">Optimization Toggles</CardTitle>
				<CardDescription>
					Control advanced routing behavior and testing strategies for the
					launch.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4 md:grid-cols-2">
				<div className="flex items-center justify-between rounded-lg border p-4">
					<div>
						<p className="font-medium text-sm">Enable list A/B testing</p>
						<p className="text-muted-foreground text-xs">
							Split leads between two lists to compare performance.
						</p>
					</div>
					<Switch
						checked={abTestingEnabled}
						onCheckedChange={(checked) => setAbTestingEnabled(checked)}
					/>
				</div>
				<div className="flex items-center justify-between rounded-lg border p-4">
					<div>
						<p className="font-medium text-sm">Enable number pooling</p>
						<p className="text-muted-foreground text-xs">
							Rotate caller IDs to manage compliance and deliverability.
						</p>
					</div>
					<Switch
						checked={numberPoolingEnabled}
						onCheckedChange={(checked) => setNumberPoolingEnabled(checked)}
					/>
				</div>
				<div className="rounded-lg border p-4 text-sm md:col-span-2">
					<p className="font-medium">Current lead count</p>
					<p className="text-muted-foreground text-xs">
						{leadCount > 0
							? `${leadCount.toLocaleString()} leads ready for routing`
							: "Lead count will populate after intake"}
					</p>
				</div>
			</CardContent>
		</Card>
	);
};

export default OptimizationPanel;
