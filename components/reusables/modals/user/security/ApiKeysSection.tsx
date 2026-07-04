"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Eye, EyeOff, Key, Plus, Trash2 } from "lucide-react";
import {
	type ApiKeyView,
	usePublicApiKeyManagement,
} from "./usePublicApiKeyManagement";

function getMaskedKey(apiKey: ApiKeyView, isVisible: boolean) {
	if (isVisible) return apiKey.key;
	return apiKey.hasFullKey
		? `${apiKey.key.substring(0, 20)}********************`
		: apiKey.key;
}

const ApiKeysSection: React.FC = () => {
	const {
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
	} = usePublicApiKeyManagement();

	return (
		<div className="space-y-6">
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
					<Button
						onClick={() => setShowCreateForm(true)}
						disabled={!token || isLoading}
					>
						<Plus className="mr-2 h-4 w-4" />
						Create New Key
					</Button>
				)}
			</div>

			{showCreateForm && (
				<div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
					<h4 className="font-semibold text-gray-900 dark:text-white">
						Create New API Key
					</h4>
					<div className="space-y-2">
						<label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
							Key Name
						</label>
						<Input
							placeholder="e.g., Production API, Mobile App"
							value={newKeyName}
							onChange={(event) => setNewKeyName(event.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
							Permissions
						</label>
						<div className="grid gap-2">
							{availablePermissions.map((permission) => (
								<label
									key={permission.id}
									className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-white dark:border-gray-600 dark:hover:bg-gray-700"
								>
									<input
										type="checkbox"
										className="mt-1"
										checked={selectedPermissions.includes(permission.id)}
										onChange={(event) => {
											setSelectedPermissions((current) =>
												event.target.checked
													? [...current, permission.id]
													: current.filter((scope) => scope !== permission.id),
											);
										}}
									/>
									<span className="flex-1">
										<span className="block font-medium text-gray-900 text-sm dark:text-white">
											{permission.label}
										</span>
										<span className="text-gray-600 text-xs dark:text-gray-400">
											{permission.description}
										</span>
									</span>
								</label>
							))}
						</div>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={resetCreateForm}>
							Cancel
						</Button>
						<Button onClick={createKey} disabled={isMutating}>
							{isMutating ? "Creating..." : "Create API Key"}
						</Button>
					</div>
				</div>
			)}

			{statusMessage && (
				<div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-700 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
					{statusMessage}
				</div>
			)}

			<div className="space-y-3">
				{apiKeys.map((apiKey) => (
					<div
						key={apiKey.id}
						className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
					>
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0 flex-1">
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
								<div className="mt-3 flex items-center gap-2">
									<code className="flex-1 overflow-hidden rounded bg-gray-100 px-3 py-2 font-mono text-sm dark:bg-gray-700">
										{getMaskedKey(apiKey, visibleKeys.has(apiKey.id))}
									</code>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => toggleKeyVisibility(apiKey.id)}
										disabled={!apiKey.hasFullKey}
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
										onClick={() => copyApiKey(apiKey)}
										disabled={!apiKey.hasFullKey}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
								<div className="mt-3 flex flex-wrap gap-4 text-gray-600 text-sm dark:text-gray-400">
									<span>Created: {apiKey.created}</span>
									<span>Last Used: {apiKey.lastUsed || "Never"}</span>
								</div>
								<div className="mt-3 flex flex-wrap gap-2">
									{apiKey.permissions.map((permission) => (
										<Badge
											key={permission}
											variant="outline"
											className="text-xs"
										>
											{permission}
										</Badge>
									))}
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => revokeKey(apiKey.id)}
								disabled={apiKey.status === "revoked" || isMutating}
							>
								<Trash2 className="h-4 w-4 text-red-500" />
							</Button>
						</div>
					</div>
				))}
			</div>

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
