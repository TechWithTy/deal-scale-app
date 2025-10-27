"use client";

import { useCallback, useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import {
        type LaunchChecklist,
        useQuickStartWizardDataStore,
} from "@/lib/stores/quickstartWizardData";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { runCampaignTest } from "@/lib/actions/campaigns/runCampaignTest";

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
        const { toast } = useToast();
        const [isTesting, setIsTesting] = useState(false);
        const [errorMessage, setErrorMessage] = useState<string | null>(null);

        const {
                launchChecklist,
                toggleLaunchChecklist,
                reviewNotes,
                personaId,
                goalId,
        } =
                useQuickStartWizardDataStore(
                        (state) => ({
                                launchChecklist: state.launchChecklist,
                                toggleLaunchChecklist: state.toggleLaunchChecklist,
                                reviewNotes: state.reviewNotes,
                                personaId: state.personaId,
                                goalId: state.goalId,
                        }),
                        shallow,
                );
        const { campaignName } = useCampaignCreationStore(
                (state) => ({ campaignName: state.campaignName }),
                shallow,
        );

        const markAllComplete = () => {
                CHECKLIST_CONFIG.forEach(({ key }) => {
                        if (!launchChecklist[key]) {
                                toggleLaunchChecklist(key);
                        }
                });
        };

        const handleTestCampaign = useCallback(async () => {
                if (isTesting) {
                        return;
                }

                setIsTesting(true);
                setErrorMessage(null);

                const normalizedChecklist = CHECKLIST_CONFIG.reduce<Partial<LaunchChecklist>>(
                        (acc, { key }) => {
                                acc[key] = Boolean(launchChecklist?.[key]);
                                return acc;
                        },
                        {},
                ) as LaunchChecklist;

                try {
                        await runCampaignTest({
                                personaId: personaId ?? null,
                                goalId: goalId ?? null,
                                campaignName: campaignName || "Untitled campaign",
                                checklist: normalizedChecklist,
                                notes: reviewNotes ?? null,
                        });
                        toast({
                                title: "Test campaign started",
                                description:
                                        "We’re running a safe dry run of your automation. You’ll be notified once it completes.",
                        });
                } catch (error) {
                        const message =
                                error instanceof Error
                                        ? error.message
                                        : "Unable to start campaign test.";
                        setErrorMessage(message);
                        toast({
                                title: "Unable to start test",
                                description: message,
                                variant: "destructive",
                        });
                } finally {
                        setIsTesting(false);
                }
        }, [
                campaignName,
                goalId,
                isTesting,
                launchChecklist,
                personaId,
                reviewNotes,
                toast,
        ]);

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
                                        <div className="flex flex-col gap-2 sm:flex-row">
                                                <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={markAllComplete}
                                                >
                                                        Mark all complete
                                                </Button>
                                                <Button
                                                        type="button"
                                                        onClick={handleTestCampaign}
                                                        disabled={isTesting}
                                                        aria-busy={isTesting}
                                                >
                                                        {isTesting ? "Testing…" : "Test campaign"}
                                                </Button>
                                        </div>
                                        {errorMessage ? (
                                                <p className="text-destructive text-xs" aria-live="polite">
                                                        {errorMessage}
                                                </p>
                                        ) : null}
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
