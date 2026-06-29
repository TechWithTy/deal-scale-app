"use client";

import { usePublicApiProfile } from "@/hooks/usePublicApiProfile";
import {
	type ApiErrorKind,
	getPublicApiSupportLabel,
	loginPublicApi,
} from "@/lib/api/public-api-client";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import React, { useState } from "react";

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
	const [token, setToken] = useState<string | undefined>();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [authError, setAuthError] = useState<string | null>(null);
	const [isSigningIn, setIsSigningIn] = useState(false);
	const profile = usePublicApiProfile(token);

	async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setAuthError(null);
		setIsSigningIn(true);

		try {
			const response = await loginPublicApi(email.trim(), password);
			setToken(response.access_token);
			setPassword("");
		} catch (error) {
			setAuthError(getPublicApiSupportLabel(error));
		} finally {
			setIsSigningIn(false);
		}
	}

	function handleDisconnect() {
		setToken(undefined);
		setPassword("");
	}

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
						<form
							className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
							onSubmit={handleSignIn}
						>
							<input
								aria-label="Public API email"
								className="h-9 rounded-md border border-red-200 bg-white px-3 text-slate-950"
								onChange={(event) => setEmail(event.target.value)}
								placeholder="Email"
								type="email"
								value={email}
							/>
							<input
								aria-label="Public API password"
								className="h-9 rounded-md border border-red-200 bg-white px-3 text-slate-950"
								onChange={(event) => setPassword(event.target.value)}
								placeholder="Password"
								type="password"
								value={password}
							/>
							<button
								className="h-9 rounded-md bg-red-700 px-3 font-medium text-white disabled:opacity-60"
								disabled={isSigningIn || !email.trim() || !password}
								type="submit"
							>
								{isSigningIn ? "Connecting..." : "Connect API"}
							</button>
							{authError && (
								<p className="break-words text-red-900 sm:col-span-3">
									{authError}
								</p>
							)}
						</form>
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
			{token && (
				<button
					className="ml-auto rounded-md border border-emerald-300 px-2 py-1 font-medium text-emerald-950"
					onClick={handleDisconnect}
					type="button"
				>
					Disconnect API
				</button>
			)}
		</div>
	);
}
