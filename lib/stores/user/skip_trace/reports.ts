import { create } from "zustand";
import { withAnalytics } from "../../_middleware/analytics";
import type { Header } from "@/types/skip-trace";
import type { InputField } from "@/types/skip-trace/enrichment";
import { useSkipTraceStore } from "./skipTraceStore";

interface ProgressSummary {
	step: number;
	stepPercent: number; // 0 - 100
	leadCount: number;
	submitting: boolean;
}

interface HeadersSummary {
	parsedCount: number;
	selectedCount: number;
	selectedHeaders: Header[];
}

interface EnrichmentSummary {
	selectedCount: number;
	options: string[];
	userInputKeys: InputField[];
}

interface SkipTraceReportsState {
	progress: () => ProgressSummary;
	headers: () => HeadersSummary;
	enrichment: () => EnrichmentSummary;
}

export const useSkipTraceReportsStore = create<SkipTraceReportsState>(
	withAnalytics<SkipTraceReportsState>("skip_trace_reports", () => ({
		progress: () => {
			const s = useSkipTraceStore.getState();
			const totalSteps = 4; // Upload -> Map -> Enrichment -> Review/Submit
			const clamped = Math.max(0, Math.min(s.step, totalSteps));
			const stepPercent = Math.round((clamped / totalSteps) * 100);
			return {
				step: s.step,
				stepPercent,
				leadCount: s.leadCount,
				submitting: s.submitting,
			};
		},

		headers: () => {
			const s = useSkipTraceStore.getState();
			const parsedCount = s.parsedHeaders?.length ?? 0;
			const selected = s.selectedHeaders ?? [];
			return {
				parsedCount,
				selectedCount: selected.length,
				selectedHeaders: selected,
			};
		},

		enrichment: () => {
			const s = useSkipTraceStore.getState();
			const options = s.selectedEnrichmentOptions ?? [];
			const userInput = s.userInput ?? ({} as Record<InputField, string>);
			return {
				selectedCount: options.length,
				options,
				userInputKeys: Object.keys(userInput) as InputField[],
			};
		},
	})),
);
