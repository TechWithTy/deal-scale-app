"use client";

import { getCampaignStatus } from "@/lib/api/public-api-dashboard";
import { getPublicApiCampaignId } from "@/lib/api/public-api-campaign-launch";
import { useEffect, useState } from "react";

type StatusState = {
	error: string | null;
	isLoading: boolean;
	publicCampaignId: string | null;
	status: string | null;
	source: "error" | "idle" | "live" | "missing_token";
};

const INITIAL_STATE: StatusState = {
	error: null,
	isLoading: false,
	publicCampaignId: null,
	source: "idle",
	status: null,
};

function getStatusFromPayload(payload: unknown) {
	if (!payload || typeof payload !== "object") return null;
	const record = payload as Record<string, unknown>;
	const status = record.status ?? record.campaign_status;
	return typeof status === "string" ? status : null;
}

function getMessage(error: unknown) {
	return error instanceof Error ? error.message : "Unable to load campaign status";
}

export function usePublicApiCampaignStatus(
	localCampaignId?: string | null,
	token?: string,
) {
	const [state, setState] = useState<StatusState>(INITIAL_STATE);

	useEffect(() => {
		let isMounted = true;
		let timeoutId: ReturnType<typeof setTimeout> | undefined;

		async function loadStatus() {
			if (!localCampaignId) {
				setState(INITIAL_STATE);
				return;
			}
			if (!token) {
				setState({
					error: null,
					isLoading: false,
					publicCampaignId: null,
					source: "missing_token",
					status: null,
				});
				return;
			}

			const publicCampaignId = getPublicApiCampaignId(localCampaignId);
			setState((current) => ({
				...current,
				error: null,
				isLoading: true,
				publicCampaignId,
			}));

			try {
				const payload = await getCampaignStatus(publicCampaignId, token);
				if (isMounted) {
					setState({
						error: null,
						isLoading: false,
						publicCampaignId,
						source: "live",
						status: getStatusFromPayload(payload),
					});
				}
			} catch (error) {
				if (isMounted) {
					setState({
						error: getMessage(error),
						isLoading: false,
						publicCampaignId,
						source: "error",
						status: null,
					});
				}
			}

			if (isMounted) {
				timeoutId = setTimeout(loadStatus, 30_000);
			}
		}

		loadStatus();
		return () => {
			isMounted = false;
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [localCampaignId, token]);

	return state;
}
