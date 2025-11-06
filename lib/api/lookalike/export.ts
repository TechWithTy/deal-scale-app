import type {
	AdPlatform,
	ExportJob,
	LookalikeCandidate,
} from "@/types/lookalike";

/**
 * Mock function to export lookalike audience to Meta (Facebook) Custom Audiences
 * In production, this would use Meta Marketing API
 */
export async function exportToMeta(
	audienceId: string,
	audienceName: string,
	candidates: LookalikeCandidate[],
): Promise<ExportJob> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const job: ExportJob = {
		id: `export_meta_${Date.now()}`,
		audienceId,
		platform: "meta",
		status: "completed",
		platformAudienceId: `meta_aud_${Math.random().toString(36).substr(2, 9)}`,
		startedAt: new Date().toISOString(),
		completedAt: new Date(Date.now() + 2000).toISOString(),
		exportedCount: candidates.length,
	};

	console.log(
		`[Mock] Exported ${candidates.length} leads to Meta as audience: ${job.platformAudienceId}`,
	);

	return job;
}

/**
 * Mock function to export lookalike audience to Google Customer Match
 * In production, this would use Google Ads API
 */
export async function exportToGoogle(
	audienceId: string,
	audienceName: string,
	candidates: LookalikeCandidate[],
): Promise<ExportJob> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1800));

	const job: ExportJob = {
		id: `export_google_${Date.now()}`,
		audienceId,
		platform: "google",
		status: "completed",
		platformAudienceId: `google_aud_${Math.random().toString(36).substr(2, 9)}`,
		startedAt: new Date().toISOString(),
		completedAt: new Date(Date.now() + 1800).toISOString(),
		exportedCount: candidates.length,
	};

	console.log(
		`[Mock] Exported ${candidates.length} leads to Google as audience: ${job.platformAudienceId}`,
	);

	return job;
}

/**
 * Mock function to export lookalike audience to LinkedIn Matched Audiences
 * In production, this would use LinkedIn Marketing API
 */
export async function exportToLinkedIn(
	audienceId: string,
	audienceName: string,
	candidates: LookalikeCandidate[],
): Promise<ExportJob> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 2200));

	const job: ExportJob = {
		id: `export_linkedin_${Date.now()}`,
		audienceId,
		platform: "linkedin",
		status: "completed",
		platformAudienceId: `linkedin_aud_${Math.random().toString(36).substr(2, 9)}`,
		startedAt: new Date().toISOString(),
		completedAt: new Date(Date.now() + 2200).toISOString(),
		exportedCount: candidates.length,
	};

	console.log(
		`[Mock] Exported ${candidates.length} leads to LinkedIn as audience: ${job.platformAudienceId}`,
	);

	return job;
}

/**
 * Export to multiple platforms in parallel
 */
export async function exportToMultiplePlatforms(
	audienceId: string,
	audienceName: string,
	candidates: LookalikeCandidate[],
	platforms: AdPlatform[],
): Promise<ExportJob[]> {
	const exportPromises = platforms.map((platform) => {
		switch (platform) {
			case "meta":
				return exportToMeta(audienceId, audienceName, candidates);
			case "google":
				return exportToGoogle(audienceId, audienceName, candidates);
			case "linkedin":
				return exportToLinkedIn(audienceId, audienceName, candidates);
		}
	});

	return Promise.all(exportPromises);
}
