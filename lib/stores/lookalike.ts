import { create } from "zustand";
import type {
	LookalikeAudience,
	LookalikeCandidate,
	LookalikeConfig,
	ExportJob,
	AudiencePerformanceSummary,
} from "@/types/lookalike";

interface LookalikeState {
	// Audiences
	audiences: LookalikeAudience[];
	currentAudience: LookalikeAudience | null;

	// Candidates
	currentCandidates: LookalikeCandidate[];

	// Export jobs
	exportJobs: ExportJob[];

	// Performance
	performanceData: AudiencePerformanceSummary[];

	// Actions
	createAudience: (
		config: LookalikeConfig,
		candidates: LookalikeCandidate[],
	) => LookalikeAudience;
	saveAudience: (audience: LookalikeAudience) => void;
	deleteAudience: (audienceId: string) => void;
	setCurrentAudience: (audience: LookalikeAudience | null) => void;
	setCurrentCandidates: (candidates: LookalikeCandidate[]) => void;

	// Export actions
	addExportJob: (job: ExportJob) => void;
	updateExportJob: (jobId: string, updates: Partial<ExportJob>) => void;

	// Performance actions
	updatePerformance: (metrics: AudiencePerformanceSummary) => void;
	getAudiencePerformance: (
		audienceId: string,
	) => AudiencePerformanceSummary | undefined;

	// Utility
	reset: () => void;
}

const initialState = {
	audiences: [],
	currentAudience: null,
	currentCandidates: [],
	exportJobs: [],
	performanceData: [],
};

export const useLookalikeStore = create<LookalikeState>((set, get) => ({
	...initialState,

	createAudience: (config, candidates) => {
		console.log(
			"[LookalikeStore] Creating audience with",
			candidates.length,
			"candidates",
		);

		const newAudience: LookalikeAudience = {
			id: `lookalike_${Date.now()}`,
			tenantId: "current-tenant", // TODO: Replace with actual tenant ID
			name: `Lookalike - ${config.seedListName}`,
			createdAt: new Date().toISOString(),
			seedListId: config.seedListId,
			seedListName: config.seedListName,
			config,
			candidateCount: candidates.length,
			status: "draft",
		};

		set((state) => {
			console.log(
				"[LookalikeStore] Setting currentAudience and currentCandidates",
			);
			return {
				currentAudience: newAudience,
				currentCandidates: [...candidates], // Clone array to ensure fresh reference
			};
		});

		// Verify state was updated
		const state = get();
		console.log(
			"[LookalikeStore] After update - currentCandidates:",
			state.currentCandidates.length,
		);

		return newAudience;
	},

	saveAudience: (audience) => {
		console.log("[LookalikeStore] Saving audience to history");
		set((state) => ({
			audiences: [...state.audiences, audience],
			// DON'T clear current state - let the modal manage that
			// When user closes the modal, it will clear candidates
		}));
	},

	deleteAudience: (audienceId) => {
		set((state) => ({
			audiences: state.audiences.filter((a) => a.id !== audienceId),
			performanceData: state.performanceData.filter(
				(p) => p.audienceId !== audienceId,
			),
			exportJobs: state.exportJobs.filter((j) => j.audienceId !== audienceId),
		}));
	},

	setCurrentAudience: (audience) => {
		set({ currentAudience: audience });
	},

	setCurrentCandidates: (candidates) => {
		set({ currentCandidates: candidates });
	},

	addExportJob: (job) => {
		set((state) => ({
			exportJobs: [...state.exportJobs, job],
		}));
	},

	updateExportJob: (jobId, updates) => {
		set((state) => ({
			exportJobs: state.exportJobs.map((job) =>
				job.id === jobId ? { ...job, ...updates } : job,
			),
		}));
	},

	updatePerformance: (metrics) => {
		set((state) => {
			const existing = state.performanceData.findIndex(
				(p) => p.audienceId === metrics.audienceId,
			);

			if (existing >= 0) {
				const updated = [...state.performanceData];
				updated[existing] = metrics;
				return { performanceData: updated };
			}

			return {
				performanceData: [...state.performanceData, metrics],
			};
		});
	},

	getAudiencePerformance: (audienceId) => {
		return get().performanceData.find((p) => p.audienceId === audienceId);
	},

	reset: () => {
		set(initialState);
	},
}));
