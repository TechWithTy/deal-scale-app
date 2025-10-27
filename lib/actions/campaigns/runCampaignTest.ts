import type {
        QuickStartGoalId,
        QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";

interface RunCampaignTestInput {
        readonly personaId: QuickStartPersonaId | null;
        readonly goalId: QuickStartGoalId | null;
        readonly campaignName: string;
        readonly checklist: Record<string, boolean>;
        readonly notes?: string | null;
}

interface RunCampaignTestResult {
        readonly jobId: string | null;
}

const DEFAULT_ERROR_MESSAGE = "Unable to start campaign test.";

const toJsonSafe = async (response: Response) => {
        try {
                return (await response.json()) as Record<string, unknown>;
        } catch {
                return null;
        }
};

/**
 * Queues a non-destructive automation run so teams can validate the workflow before launch.
 */
export const runCampaignTest = async (
        input: RunCampaignTestInput,
): Promise<RunCampaignTestResult> => {
        let response: Response;
        try {
                response = await fetch("/api/campaigns/test-run", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                                personaId: input.personaId,
                                goalId: input.goalId,
                                campaignName: input.campaignName,
                                checklist: input.checklist,
                                notes: input.notes ?? null,
                        }),
                });
        } catch (error) {
                throw new Error(DEFAULT_ERROR_MESSAGE);
        }

        const payload = await toJsonSafe(response);

        if (!response.ok) {
                const message =
                        typeof payload?.error === "string"
                                ? payload.error
                                : response.statusText || DEFAULT_ERROR_MESSAGE;
                throw new Error(message || DEFAULT_ERROR_MESSAGE);
        }

        const jobId =
                payload && typeof payload.jobId === "string" ? payload.jobId : null;

        return { jobId };
};

