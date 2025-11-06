/**
 * ApiKeysSection: API Keys management for developers
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Copy, Eye, EyeOff, Trash2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ApiKey {
	id: string;
	name: string;
	key: string;
	created: string;
	lastUsed: string | null;
	permissions: string[];
	status: "active" | "revoked";
}

const ApiKeysSection: React.FC = () => {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [newKeyName, setNewKeyName] = useState("");
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

	// Mock API keys data
	const [apiKeys, setApiKeys] = useState<ApiKey[]>([
		{
			id: "1",
			name: "Production API",
			key: "ds_live_1234567890abcdefghijklmnopqrstuvwxyz",
			created: "2025-01-15",
			lastUsed: "2025-11-06",
			permissions: ["leads:read", "leads:write", "campaigns:read"],
			status: "active",
		},
		{
			id: "2",
			name: "Development Key",
			key: "ds_test_abcdefghijklmnopqrstuvwxyz1234567890",
			created: "2025-01-10",
			lastUsed: null,
			permissions: ["leads:read"],
			status: "active",
		},
	]);

	const availablePermissions = [
		{ id: "leads:read", label: "Read Leads", description: "View lead data" },
		{
			id: "leads:write",
			label: "Write Leads",
			description: "Create and update leads",
		},
		{
			id: "campaigns:read",
			label: "Read Campaigns",
			description: "View campaign data",
		},
		{
			id: "campaigns:write",
			label: "Write Campaigns",
			description: "Create and update campaigns",
		},
		{
			id: "skiptracing:read",
			label: "Read Skip Traces",
			description: "View skip trace results",
		},
		{
			id: "webhooks:read",
			label: "Read Webhooks",
			description: "View webhook configurations",
		},
	];

	const handleCreateKey = () => {
		if (!newKeyName.trim()) {
			toast.error("Please enter a key name");
			return;
		}

		if (selectedPermissions.length === 0) {
			toast.error("Please select at least one permission");
			return;
		}

		const newKey: ApiKey = {
			id: Date.now().toString(),
			name: newKeyName,
			key: `ds_live_${Math.random().toString(36).substring(2, 42)}`,
			created: new Date().toISOString().split("T")[0],
			lastUsed: null,
			permissions: selectedPermissions,
			status: "active",
		};

		setApiKeys([...apiKeys, newKey]);
		setShowCreateForm(false);
		setNewKeyName("");
		setSelectedPermissions([]);
		toast.success("API key created successfully");
	};

	const toggleKeyVisibility = (keyId: string) => {
		const newVisible = new Set(visibleKeys);
		if (newVisible.has(keyId)) {
			newVisible.delete(keyId);
		} else {
			newVisible.add(keyId);
		}
		setVisibleKeys(newVisible);
	};

	const copyApiKey = (key: string) => {
		navigator.clipboard.writeText(key);
		toast.success("API key copied to clipboard");
	};

	const revokeKey = (keyId: string) => {
		setApiKeys(
			apiKeys.map((k) =>
				k.id === keyId ? { ...k, status: "revoked" as const } : k,
			),
		);
		toast.success("API key revoked");
	};

	const regenerateKey = (keyId: string) => {
		setApiKeys(
			apiKeys.map((k) =>
				k.id === keyId
					? {
							...k,
							key: `ds_live_${Math.random().toString(36).substring(2, 42)}`,
						}
					: k,
			),
		);
		toast.success("API key regenerated");
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
						API Keys
					</h3>
					<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
						Manage API keys for programmatic access to your account
					</p>
				</div>
				{!showCreateForm && (
					<Button onClick={() => setShowCreateForm(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Create New Key
					</Button>
				)}
			</div>

			{/* Create Form */}
			{showCreateForm && (
				<div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
					<h4 className="font-semibold text-gray-900 dark:text-white">
						Create New API Key
					</h4>

					{/* Key Name */}
					<div className="space-y-2">
						<label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
							Key Name
						</label>
						<Input
							placeholder="e.g., Production API, Mobile App"
							value={newKeyName}
							onChange={(e) => setNewKeyName(e.target.value)}
						/>
					</div>

					{/* Permissions */}
					<div className="space-y-2">
						<label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
							Permissions
						</label>
						<div className="grid gap-2">
							{availablePermissions.map((perm) => (
								<label
									key={perm.id}
									className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-white dark:border-gray-600 dark:hover:bg-gray-700"
								>
									<input
										type="checkbox"
										className="mt-1"
										checked={selectedPermissions.includes(perm.id)}
										onChange={(e) => {
											if (e.target.checked) {
												setSelectedPermissions([
													...selectedPermissions,
													perm.id,
												]);
											} else {
												setSelectedPermissions(
													selectedPermissions.filter((p) => p !== perm.id),
												);
											}
										}}
									/>
									<div className="flex-1">
										<p className="font-medium text-gray-900 text-sm dark:text-white">
											{perm.label}
										</p>
										<p className="text-gray-600 text-xs dark:text-gray-400">
											{perm.description}
										</p>
									</div>
								</label>
							))}
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => {
								setShowCreateForm(false);
								setNewKeyName("");
								setSelectedPermissions([]);
							}}
						>
							Cancel
						</Button>
						<Button onClick={handleCreateKey}>Create API Key</Button>
					</div>
				</div>
			)}

			{/* API Keys List */}
			<div className="space-y-3">
				{apiKeys.map((apiKey) => (
					<div
						key={apiKey.id}
						className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
					>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<Key className="h-4 w-4 text-gray-400" />
									<h4 className="font-semibold text-gray-900 dark:text-white">
										{apiKey.name}
									</h4>
									<Badge
										variant={
											apiKey.status === "active" ? "default" : "secondary"
										}
									>
										{apiKey.status}
									</Badge>
								</div>

								{/* API Key */}
								<div className="mt-3 flex items-center gap-2">
									<code className="flex-1 rounded bg-gray-100 px-3 py-2 font-mono text-sm dark:bg-gray-700">
										{visibleKeys.has(apiKey.id)
											? apiKey.key
											: `${apiKey.key.substring(0, 20)}${"•".repeat(20)}`}
									</code>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => toggleKeyVisibility(apiKey.id)}
									>
										{visibleKeys.has(apiKey.id) ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => copyApiKey(apiKey.key)}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>

								{/* Metadata */}
								<div className="mt-3 flex flex-wrap gap-4 text-gray-600 text-sm dark:text-gray-400">
									<span>Created: {apiKey.created}</span>
									<span>Last Used: {apiKey.lastUsed || "Never"}</span>
								</div>

								{/* Permissions */}
								<div className="mt-3 flex flex-wrap gap-2">
									{apiKey.permissions.map((perm) => (
										<Badge key={perm} variant="outline" className="text-xs">
											{perm}
										</Badge>
									))}
								</div>
							</div>

							{/* Actions */}
							<div className="flex gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => regenerateKey(apiKey.id)}
									disabled={apiKey.status === "revoked"}
								>
									<RefreshCw className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => revokeKey(apiKey.id)}
									disabled={apiKey.status === "revoked"}
								>
									<Trash2 className="h-4 w-4 text-red-500" />
								</Button>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Documentation Link */}
			<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
				<p className="text-blue-900 text-sm dark:text-blue-100">
					<strong>Need help?</strong> Check out our{" "}
					<a href="/docs/api" className="underline">
						API documentation
					</a>{" "}
					for integration guides and examples.
				</p>
			</div>
		</div>
	);
};

export default ApiKeysSection;
