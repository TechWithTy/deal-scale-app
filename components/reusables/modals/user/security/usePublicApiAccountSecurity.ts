"use client";

import {
	type PublicApiDataExportType,
	type PublicApiSecurityActivity,
	type PublicApiSession,
	getSecurityActivity,
	listAccountSessions,
	requestAccountDeletion,
	requestDataExport,
	revokeAccountSession,
	revokeOtherAccountSessions,
} from "@/lib/api/public-api-account-security";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	type ActivityLogView,
	type SessionView,
	normalizeActivity,
	normalizeSession,
	unwrapList,
} from "./accountSecurityNormalizers";

export type {
	ActivityLogView,
	SessionView,
} from "./accountSecurityNormalizers";

export function usePublicApiSessions() {
	const { data: session } = useSession();
	const token = session?.publicApi?.accessToken;
	const sessionId = session?.publicApi?.sessionId;
	const [sessions, setSessions] = useState<SessionView[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isMutating, setIsMutating] = useState(false);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		async function loadSessions() {
			if (!token) {
				setSessions([]);
				setStatusMessage("Sign in to manage active sessions.");
				return;
			}
			setIsLoading(true);
			try {
				const payload = await listAccountSessions(token, sessionId);
				if (!isMounted) return;
				const next = unwrapList<PublicApiSession>(payload)
					.map(normalizeSession)
					.filter((item): item is SessionView => Boolean(item));
				setSessions(next);
				setStatusMessage(next.length ? null : "No active sessions returned.");
			} catch (error) {
				if (!isMounted) return;
				setSessions([]);
				setStatusMessage(
					error instanceof Error ? error.message : "Unable to load sessions.",
				);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		}
		loadSessions();
		return () => {
			isMounted = false;
		};
	}, [sessionId, token]);

	const revokeSession = useCallback(
		async (sessionId: string) => {
			if (!token) return toast.error("Sign in before revoking sessions");
			setIsMutating(true);
			try {
				await revokeAccountSession(sessionId, token);
				setSessions((current) =>
					current.filter((item) => item.id !== sessionId),
				);
				toast.success("Session revoked successfully");
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to revoke session",
				);
			} finally {
				setIsMutating(false);
			}
		},
		[token],
	);

	const revokeAllOtherSessions = useCallback(async () => {
		if (!token) return toast.error("Sign in before revoking sessions");
		const otherSessionIds = sessions
			.filter((item) => !item.isCurrent)
			.map((item) => item.id);
		if (!sessions.some((item) => item.isCurrent)) {
			return toast.error("Sign in again before revoking all other sessions");
		}
		setIsMutating(true);
		try {
			await revokeOtherAccountSessions(otherSessionIds, token);
			setSessions((current) => current.filter((item) => item.isCurrent));
			toast.success("All other sessions have been revoked");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to revoke sessions",
			);
		} finally {
			setIsMutating(false);
		}
	}, [sessions, token]);

	return {
		isLoading,
		isMutating,
		revokeAllOtherSessions,
		revokeSession,
		sessions,
		statusMessage,
	};
}

export function usePublicApiSecurityActivity() {
	const { data: session } = useSession();
	const token = session?.publicApi?.accessToken;
	const [logs, setLogs] = useState<ActivityLogView[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		async function loadActivity() {
			if (!token) {
				setLogs([]);
				setStatusMessage("Sign in to view security activity.");
				return;
			}
			setIsLoading(true);
			try {
				const payload = await getSecurityActivity(token);
				if (!isMounted) return;
				const next = unwrapList<PublicApiSecurityActivity>(payload)
					.map(normalizeActivity)
					.filter((item): item is ActivityLogView => Boolean(item));
				setLogs(next);
				setStatusMessage(next.length ? null : "No security activity returned.");
			} catch (error) {
				if (!isMounted) return;
				setLogs([]);
				setStatusMessage(
					error instanceof Error
						? error.message
						: "Unable to load security activity.",
				);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		}
		loadActivity();
		return () => {
			isMounted = false;
		};
	}, [token]);

	return { isLoading, logs, statusMessage };
}

export function usePublicApiPrivacyActions() {
	const { data: session } = useSession();
	const token = session?.publicApi?.accessToken;
	const [isMutating, setIsMutating] = useState(false);

	return useMemo(
		() => ({
			isMutating,
			requestAccountDeletion: async () => {
				if (!token)
					return toast.error("Sign in before requesting account deletion");
				setIsMutating(true);
				try {
					const response = await requestAccountDeletion(
						{ confirmation: "DELETE" },
						token,
					);
					toast.success(response.message);
				} catch (error) {
					toast.error(
						error instanceof Error
							? error.message
							: "Failed to submit account deletion request",
					);
					throw error;
				} finally {
					setIsMutating(false);
				}
			},
			requestDataExport: async (exportType: PublicApiDataExportType) => {
				if (!token)
					return toast.error("Sign in before requesting data exports");
				setIsMutating(true);
				try {
					const response = await requestDataExport(
						{ export_type: exportType, format: "json" },
						token,
					);
					toast.success(response.message);
				} catch (error) {
					toast.error(
						error instanceof Error
							? error.message
							: "Failed to request data export",
					);
				} finally {
					setIsMutating(false);
				}
			},
			token,
		}),
		[isMutating, token],
	);
}
