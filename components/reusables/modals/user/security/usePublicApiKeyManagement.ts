"use client";

import {
	createApiKey,
	getApiKeyScopes,
	listApiKeys,
	revokeApiKey,
	type PublicApiKeyListItem,
	type PublicApiScope,
} from "@/lib/api/public-api-api-keys";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export interface ApiKeyView {
	created: string;
	hasFullKey: boolean;
	id: string;
	key: string;
	lastUsed: string | null;
	name: string;
	permissions: string[];
	status: "active" | "revoked";
}

function normalizeApiKey(item: PublicApiKeyListItem): ApiKeyView | null {
	const id = item.id ?? item.key_id;
	if (!id) return null;
	return {
		created: item.created_at?.slice(0, 10) ?? "Unknown",
		hasFullKey: false,
		id,
		key: item.key_prefix ? `${item.key_prefix}...` : "Prefix unavailable",
		lastUsed: item.last_used_at?.slice(0, 10) ?? null,
		name: item.name ?? "API Key",
		permissions: item.scopes ?? [],
		status: item.is_active === false ? "revoked" : "active",
	};
}

function toPermissionLabel(scope: string) {
	return scope
		.split(":")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export function usePublicApiKeyManagement() {
	const { data: session } = useSession();
	const token = session?.publicApi?.accessToken;
	const [apiKeys, setApiKeys] = useState<ApiKeyView[]>([]);
	const [availableScopes, setAvailableScopes] = useState<PublicApiScope[]>([]);
	const [defaultScopes, setDefaultScopes] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isMutating, setIsMutating] = useState(false);
	const [newKeyName, setNewKeyName] = useState("");
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

	const availablePermissions = useMemo(
		() =>
			availableScopes.map((scope) => ({
				description: scope.description ?? "No description available",
				id: scope.scope,
				label: toPermissionLabel(scope.scope),
			})),
		[availableScopes],
	);

	useEffect(() => {
		let isMounted = true;
		async function loadApiKeys() {
			if (!token) {
				setApiKeys([]);
				setAvailableScopes([]);
				setDefaultScopes([]);
				setStatusMessage("Sign in to manage public API keys.");
				return;
			}
			setIsLoading(true);
			setStatusMessage("Loading public API keys...");
			try {
				const [scopesPayload, keysPayload] = await Promise.all([
					getApiKeyScopes(token),
					listApiKeys(token),
				]);
				if (!isMounted) return;
				setAvailableScopes(scopesPayload.scopes ?? []);
				setDefaultScopes(scopesPayload.user_default_scopes ?? []);
				setApiKeys(
					keysPayload
						.map(normalizeApiKey)
						.filter((key): key is ApiKeyView => Boolean(key)),
				);
				setStatusMessage(null);
			} catch (error) {
				if (!isMounted) return;
				setApiKeys([]);
				setAvailableScopes([]);
				setDefaultScopes([]);
				setStatusMessage(
					error instanceof Error
						? `Unable to load API keys: ${error.message}`
						: "Unable to load API keys.",
				);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		}
		loadApiKeys();
		return () => {
			isMounted = false;
		};
	}, [token]);

	useEffect(() => {
		if (!showCreateForm || selectedPermissions.length > 0) return;
		setSelectedPermissions(defaultScopes);
	}, [defaultScopes, selectedPermissions.length, showCreateForm]);

	const resetCreateForm = () => {
		setShowCreateForm(false);
		setNewKeyName("");
		setSelectedPermissions([]);
	};

	const createKey = async () => {
		if (!newKeyName.trim()) return toast.error("Please enter a key name");
		if (!token) return toast.error("Sign in before creating an API key");
		if (selectedPermissions.length === 0) {
			return toast.error("Please select at least one permission");
		}
		setIsMutating(true);
		try {
			const created = await createApiKey(
				{ name: newKeyName.trim(), scopes: selectedPermissions },
				token,
			);
			const keyId = created.key_id ?? crypto.randomUUID();
			setApiKeys((current) => [
				{
					created: new Date().toISOString().split("T")[0] ?? "Unknown",
					hasFullKey: Boolean(created.api_key),
					id: keyId,
					key: created.api_key ?? "Save this key now",
					lastUsed: null,
					name: created.name ?? newKeyName.trim(),
					permissions: created.scopes ?? selectedPermissions,
					status: "active",
				},
				...current,
			]);
			setVisibleKeys((current) => new Set([...current, keyId]));
			resetCreateForm();
			toast.success(created.warning ?? "API key created successfully");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create API key",
			);
		} finally {
			setIsMutating(false);
		}
	};

	const toggleKeyVisibility = (keyId: string) => {
		setVisibleKeys((current) => {
			const next = new Set(current);
			if (next.has(keyId)) next.delete(keyId);
			else next.add(keyId);
			return next;
		});
	};

	const copyApiKey = (apiKey: ApiKeyView) => {
		if (!apiKey.hasFullKey) {
			toast.error("Full API keys are only shown immediately after creation");
			return;
		}
		navigator.clipboard.writeText(apiKey.key);
		toast.success("API key copied to clipboard");
	};

	const revokeKey = async (keyId: string) => {
		if (!token) return toast.error("Sign in before revoking an API key");
		setIsMutating(true);
		try {
			await revokeApiKey(keyId, token);
			setApiKeys((current) =>
				current.map((key) =>
					key.id === keyId ? { ...key, status: "revoked" } : key,
				),
			);
			toast.success("API key revoked");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to revoke API key",
			);
		} finally {
			setIsMutating(false);
		}
	};

	return {
		apiKeys,
		availablePermissions,
		copyApiKey,
		createKey,
		isLoading,
		isMutating,
		newKeyName,
		resetCreateForm,
		revokeKey,
		selectedPermissions,
		setNewKeyName,
		setSelectedPermissions,
		setShowCreateForm,
		showCreateForm,
		statusMessage,
		toggleKeyVisibility,
		token,
		visibleKeys,
	};
}
