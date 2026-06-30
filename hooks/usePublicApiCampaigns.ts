"use client";

import { getCampaigns } from "@/lib/api/public-api-core-resources";
import type { CallCampaign } from "@/types/_dashboard/campaign";
import { useEffect, useState } from "react";

type CampaignState = {
	campaigns: CallCampaign[] | null;
	status: string | null;
	source: "error" | "fallback_mock" | "live" | "loading" | "missing_token";
};

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function asArray(payload: unknown) {
	if (Array.isArray(payload)) return payload;
	const record = asRecord(payload);
	for (const key of ["campaigns", "items", "results", "data"]) {
		const value = record[key];
		if (Array.isArray(value)) return value;
	}
	return [];
}

function text(value: unknown, fallback = "") {
	return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function number(value: unknown, fallback = 0) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCampaign(item: unknown, index: number): CallCampaign {
	const record = asRecord(item);
	const stats = asRecord(record.stats ?? record.metrics);
	const status = text(record.status, "pending") as CallCampaign["status"];
	return {
		callInformation: [],
		callerNumber: "",
		callType: "outbound",
		calls: number(stats.calls),
		dead: number(stats.dead),
		dnc: number(stats.dnc),
		duration: number(stats.duration),
		endedReason: [],
		hungUp: number(stats.hung_up ?? stats.hungUp),
		id: text(
			record.campaign_id ?? record.id,
			`public-api-campaign-${index + 1}`,
		),
		inactiveNumbers: number(stats.inactive_numbers ?? stats.inactiveNumbers),
		inQueue: number(stats.in_queue ?? stats.inQueue),
		leads: number(record.lead_count ?? stats.leads ?? record.target_count),
		name: text(record.name, `Public API Campaign ${index + 1}`),
		receiverNumber: "",
		startDate: text(
			record.started_at ?? record.created_at,
			new Date().toISOString(),
		),
		status,
		voicemail: number(stats.voicemail),
		wrongNumber: number(stats.wrong_number ?? stats.wrongNumber),
	};
}

export function usePublicApiCampaigns(token?: string) {
	const [state, setState] = useState<CampaignState>({
		campaigns: null,
		source: token ? "loading" : "missing_token",
		status: token
			? "Loading public API campaigns..."
			: "No public API session token yet; showing fallback campaigns.",
	});

	useEffect(() => {
		let isMounted = true;
		async function loadCampaigns() {
			if (!token) {
				setState({
					campaigns: null,
					source: "missing_token",
					status:
						"No public API session token yet; showing fallback campaigns.",
				});
				return;
			}
			setState({
				campaigns: null,
				source: "loading",
				status: "Loading public API campaigns...",
			});
			try {
				const items = asArray(await getCampaigns({ limit: 50 }, token));
				if (!isMounted) return;
				setState({
					campaigns: items.length ? items.map(normalizeCampaign) : null,
					source: items.length ? "live" : "fallback_mock",
					status: items.length
						? `Loaded ${items.length} campaigns from the public API.`
						: "Public API returned no campaigns; showing fallback campaigns.",
				});
			} catch (error) {
				if (!isMounted) return;
				setState({
					campaigns: null,
					source: "error",
					status: `${error instanceof Error ? error.message : "Unable to load campaigns."} Showing fallback campaigns.`,
				});
			}
		}
		loadCampaigns();
		return () => {
			isMounted = false;
		};
	}, [token]);

	return state;
}
