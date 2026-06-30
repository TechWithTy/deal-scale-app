"use client";

import { PublicApiError, searchProspecting } from "@/lib/api/public-api-client";
import {
	getCashbuyers,
	getLeadLists,
} from "@/lib/api/public-api-core-resources";
import {
	type PublicApiDemoRow,
	normalizePublicApiLead,
	normalizePublicApiLeadLists,
} from "@/lib/leads/public-api-lead-normalizers";
import { useEffect, useState } from "react";

type LeadListApiState = {
	rows: PublicApiDemoRow[] | null;
	status: string | null;
	statusKind: "fallback_mock" | "loading" | "live" | "not_configured";
};

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function asArray(payload: unknown) {
	if (Array.isArray(payload)) return payload;
	const record = asRecord(payload);
	for (const key of ["cashbuyers", "buyers", "items", "results", "data"]) {
		const value = record[key];
		if (Array.isArray(value)) return value;
	}
	return [];
}

function getErrorMessage(error: unknown) {
	return error instanceof PublicApiError
		? `${error.message}${error.requestId ? ` (${error.requestId})` : ""}`
		: "Unable to load public API lead lists.";
}

function toCashbuyerRow(payload: unknown): PublicApiDemoRow | null {
	const leads = asArray(payload).map(normalizePublicApiLead);
	if (!leads.length) return null;
	return {
		emails: leads.filter((lead) => Boolean(lead.email)).length,
		id: "public-api-cashbuyers",
		leads,
		list: "Cash Buyers - Public API",
		phone: leads.filter((lead) => Boolean(lead.phone)).length,
		records: leads.length,
		socials: leads.filter((lead) => Boolean(lead.socials)).length,
		uploadDate: new Date().toISOString(),
	};
}

async function loadCashbuyers(token: string) {
	try {
		return toCashbuyerRow(await getCashbuyers({ limit: 25 }, token));
	} catch {
		const payload = await searchProspecting(
			{ dry_run: true, limit: 25, source: "cashbuyers" },
			token,
		);
		return toCashbuyerRow(payload);
	}
}

export function usePublicApiLeadLists(token?: string) {
	const [state, setState] = useState<LeadListApiState>({
		rows: null,
		status: token
			? "Loading public API lead lists..."
			: "No public API session token yet; showing fallback lead lists.",
		statusKind: token ? "loading" : "not_configured",
	});

	useEffect(() => {
		let isMounted = true;
		async function loadLeadLists() {
			if (!token) {
				setState({
					rows: null,
					status:
						"No public API session token yet; showing fallback lead lists.",
					statusKind: "not_configured",
				});
				return;
			}

			setState({
				rows: null,
				status: "Loading public API lead lists...",
				statusKind: "loading",
			});

			try {
				const [leadListsResult, cashbuyersResult] = await Promise.allSettled([
					getLeadLists({ limit: 25 }, token),
					loadCashbuyers(token),
				]);
				const leadRows =
					leadListsResult.status === "fulfilled"
						? normalizePublicApiLeadLists(leadListsResult.value)
						: [];
				const cashbuyerRow =
					cashbuyersResult.status === "fulfilled"
						? cashbuyersResult.value
						: null;
				const rows = cashbuyerRow ? [...leadRows, cashbuyerRow] : leadRows;

				if (!isMounted) return;
				setState({
					rows: rows.length ? rows : null,
					status: rows.length
						? `Loaded ${rows.length} public API lead list${
								rows.length === 1 ? "" : "s"
							}.`
						: "Public API returned no lead lists; showing fallback data.",
					statusKind: rows.length ? "live" : "fallback_mock",
				});
			} catch (error) {
				if (!isMounted) return;
				setState({
					rows: null,
					status: `${getErrorMessage(error)} Showing fallback data.`,
					statusKind: "fallback_mock",
				});
			}
		}

		loadLeadLists();
		return () => {
			isMounted = false;
		};
	}, [token]);

	return state;
}
