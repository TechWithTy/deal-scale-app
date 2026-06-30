"use client";

import { usePublicApiProfile } from "@/hooks/usePublicApiProfile";
import { type ApiErrorKind } from "@/lib/api/public-api-client";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import React from "react";

const ERROR_TITLES: Record<ApiErrorKind, string> = {
	auth: "Session required",
	forbidden: "Access denied",
	not_found: "Profile not found",
	provider_unavailable: "Profile service unavailable",
	server: "Profile service error",
	unknown: "Profile sync failed",
	validation: "Profile request invalid",
};

function getErrorTitle(kind: ApiErrorKind | null) {
	return kind ? ERROR_TITLES[kind] : ERROR_TITLES.unknown;
}

export function ProfilePublicApiStatus() {
	const RuntimeFragment = React.Fragment;
	const { data: session } = useSession();
	const token = session?.publicApi?.accessToken;
	const profile = usePublicApiProfile(token);

	if (profile.isLoading) {
		return (
			<RuntimeFragment>
				<div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-700 text-sm">
					<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
					<span>Checking profile sync</span>
				</div>
			</RuntimeFragment>
		);
	}

	if (profile.error) {
		return (
			<output className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-950 text-sm">
				<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
				<div className="min-w-0 space-y-1">
					<p className="font-medium">{getErrorTitle(profile.errorKind)}</p>
					<p className="break-words text-red-900">{profile.error}</p>
					{profile.errorStatus && (
						<p className="text-red-800">HTTP {profile.errorStatus}</p>
					)}
					{profile.errorKind === "auth" && (
						<p className="text-red-900">
							Sign in again to establish a public API-backed session.
						</p>
					)}
				</div>
			</output>
		);
	}

	return (
		<div className="flex items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950 text-sm">
			<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
			<span>
				Profile sync ready
				{profile.profileSetup?.profile_setup_status
					? `: ${profile.profileSetup.profile_setup_status}`
					: ""}
			</span>
		</div>
	);
}
