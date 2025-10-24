"use client";

import { Rocket } from "lucide-react";
import { shallow } from "zustand/shallow";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	type LaunchChecklist,
	useQuickStartWizardDataStore,
} from "@/lib/stores/quickstartWizardData";

const CHECKLIST_CONFIG: Array<{
	readonly key: keyof LaunchChecklist;
	readonly title: string;
	readonly description: string;
}> = [
	{
		key: "sandboxValidated",
		title: "Sandbox test completed",
		description: "Sample leads ran end-to-end with expected channel outputs.",
	},
	{
		key: "complianceReviewComplete",
		title: "Compliance review",
		description: "Scripts, caller IDs, and schedules reviewed by compliance.",
	},
	{
		key: "notificationsEnabled",
		title: "Alerts configured",
		description: "Ops team notified of launch events and error states.",
	},
	{
		key: "goLiveApproved",
		title: "Go-live approved",
		description: "Business owner signed off on launch date and targeting.",
	},
];

const TestAndLaunchStep = () => {
	const { launchChecklist, toggleLaunchChecklist, reviewNotes } =
		useQuickStartWizardDataStore(
			(state) => ({
				launchChecklist: state.launchChecklist,
				toggleLaunchChecklist: state.toggleLaunchChecklist,
				reviewNotes: state.reviewNotes,
			}),
			shallow,
		);

	const markAllComplete = () => {
		CHECKLIST_CONFIG.forEach(({ key }) => {
			if (!launchChecklist[key]) {
				toggleLaunchChecklist(key);
			}
		});
	};

	return (
		<div data-testid="test-and-launch-step" className="space-y-6">
			<Card>
				<CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<CardTitle className="text-xl">Launch Checklist</CardTitle>
						<CardDescription>
							Ensure the operational and compliance guardrails are satisfied
							before go-live.
						</CardDescription>
					</div>
					<Rocket className="hidden h-10 w-10 text-primary sm:block" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-3">
						{CHECKLIST_CONFIG.map(({ key, title, description }) => (
							<div
								key={key}
								className="flex items-start justify-between rounded-lg border p-4"
							>
								<div className="pr-4">
									<p className="font-medium text-sm">{title}</p>
									<p className="text-muted-foreground text-xs leading-relaxed">
										{description}
									</p>
								</div>
								<Switch
									checked={launchChecklist[key]}
									onCheckedChange={() => toggleLaunchChecklist(key)}
								/>
							</div>
						))}
					</div>
					<Button type="button" variant="secondary" onClick={markAllComplete}>
						Mark all complete
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Launch Notes</CardTitle>
					<CardDescription>
						Snapshot of outstanding tasks or approvals captured in the review
						step.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Textarea
						value={reviewNotes}
						readOnly
						placeholder="Review step notes will display here for quick reference."
						className="min-h-[120px] bg-muted/30"
					/>
				</CardContent>
			</Card>
		</div>
	);
};

export default TestAndLaunchStep;
