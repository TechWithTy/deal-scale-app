/**
 * DataPrivacySection: Data export, privacy settings, and account deletion
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	AlertTriangle,
	Clock,
	Database,
	Download,
	Eye,
	EyeOff,
	FileText,
	Shield,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DataPrivacySection: React.FC = () => {
	const [showDeleteForm, setShowDeleteForm] = useState(false);
	const [deleteConfirmation, setDeleteConfirmation] = useState("");
	const [privacySettings, setPrivacySettings] = useState({
		shareAnalytics: true,
		marketingEmails: false,
		productUpdates: true,
		profileVisibility: "private" as "public" | "private" | "team",
	});

	const dataCategories = [
		{
			id: "profile",
			name: "Profile Data",
			size: "2.4 MB",
			description: "Personal information and account details",
		},
		{
			id: "leads",
			name: "Leads",
			size: "156 MB",
			description: "All lead records and associated data",
		},
		{
			id: "campaigns",
			name: "Campaigns",
			size: "45 MB",
			description: "Campaign history and analytics",
		},
		{
			id: "skiptraces",
			name: "Skip Traces",
			size: "78 MB",
			description: "Skip trace results and enrichment data",
		},
		{
			id: "activity",
			name: "Activity Logs",
			size: "12 MB",
			description: "Account activity and security logs",
		},
	];

	const handleExportData = (category: string) => {
		toast.success(
			`Exporting ${category}... You'll receive an email when ready`,
		);
	};

	const handleExportAllData = () => {
		toast.success(
			"Preparing complete data export... This may take a few minutes",
		);
	};

	const handleDeleteAccount = () => {
		if (deleteConfirmation !== "DELETE") {
			toast.error('Please type "DELETE" to confirm');
			return;
		}

		// TODO: Implement actual account deletion
		toast.success(
			"Account deletion request submitted. You'll receive an email confirmation.",
		);
		setShowDeleteForm(false);
		setDeleteConfirmation("");
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
					Data & Privacy
				</h3>
				<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
					Manage your data, privacy settings, and account lifecycle
				</p>
			</div>

			{/* Privacy Settings */}
			<div className="space-y-4">
				<h4 className="font-semibold text-gray-900 dark:text-white">
					Privacy Settings
				</h4>

				<div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
					{/* Analytics Sharing */}
					<label className="flex items-start justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
						<div className="flex-1">
							<p className="font-medium text-gray-900 text-sm dark:text-white">
								Share Usage Analytics
							</p>
							<p className="mt-1 text-gray-600 text-xs dark:text-gray-400">
								Help us improve by sharing anonymous usage data
							</p>
						</div>
						<input
							type="checkbox"
							className="mt-1"
							checked={privacySettings.shareAnalytics}
							onChange={(e) =>
								setPrivacySettings({
									...privacySettings,
									shareAnalytics: e.target.checked,
								})
							}
						/>
					</label>

					{/* Marketing Emails */}
					<label className="flex items-start justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
						<div className="flex-1">
							<p className="font-medium text-gray-900 text-sm dark:text-white">
								Marketing Emails
							</p>
							<p className="mt-1 text-gray-600 text-xs dark:text-gray-400">
								Receive promotional offers and updates
							</p>
						</div>
						<input
							type="checkbox"
							className="mt-1"
							checked={privacySettings.marketingEmails}
							onChange={(e) =>
								setPrivacySettings({
									...privacySettings,
									marketingEmails: e.target.checked,
								})
							}
						/>
					</label>

					{/* Product Updates */}
					<label className="flex items-start justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
						<div className="flex-1">
							<p className="font-medium text-gray-900 text-sm dark:text-white">
								Product Updates
							</p>
							<p className="mt-1 text-gray-600 text-xs dark:text-gray-400">
								Stay informed about new features and improvements
							</p>
						</div>
						<input
							type="checkbox"
							className="mt-1"
							checked={privacySettings.productUpdates}
							onChange={(e) =>
								setPrivacySettings({
									...privacySettings,
									productUpdates: e.target.checked,
								})
							}
						/>
					</label>

					{/* Profile Visibility */}
					<div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
						<p className="font-medium text-gray-900 text-sm dark:text-white">
							Profile Visibility
						</p>
						<p className="mt-1 text-gray-600 text-xs dark:text-gray-400">
							Control who can see your profile information
						</p>
						<select
							className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
							value={privacySettings.profileVisibility}
							onChange={(e) =>
								setPrivacySettings({
									...privacySettings,
									profileVisibility: e.target.value as
										| "public"
										| "private"
										| "team",
								})
							}
						>
							<option value="public">Public - Anyone can view</option>
							<option value="team">Team - Only team members</option>
							<option value="private">Private - Only you</option>
						</select>
					</div>
				</div>

				<Button
					variant="outline"
					onClick={() => toast.success("Privacy settings saved")}
				>
					Save Privacy Settings
				</Button>
			</div>

			{/* Data Export */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h4 className="font-semibold text-gray-900 dark:text-white">
						Export Your Data
					</h4>
					<Button onClick={handleExportAllData}>
						<Download className="mr-2 h-4 w-4" />
						Export All
					</Button>
				</div>

				<p className="text-gray-600 text-sm dark:text-gray-400">
					Download a copy of your data for backup or transfer to another service
				</p>

				<div className="space-y-2">
					{dataCategories.map((category) => (
						<div
							key={category.id}
							className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
						>
							<div className="flex items-center gap-3">
								<Database className="h-5 w-5 text-gray-400" />
								<div>
									<p className="font-medium text-gray-900 text-sm dark:text-white">
										{category.name}
									</p>
									<p className="text-gray-600 text-xs dark:text-gray-400">
										{category.description} • {category.size}
									</p>
								</div>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleExportData(category.name)}
							>
								<Download className="mr-2 h-3 w-3" />
								Export
							</Button>
						</div>
					))}
				</div>

				<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
					<div className="flex gap-3">
						<Clock className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
						<div>
							<p className="font-medium text-blue-900 text-sm dark:text-blue-100">
								Export Processing Time
							</p>
							<p className="mt-1 text-blue-800 text-sm dark:text-blue-200">
								Large exports may take up to 24 hours. You'll receive an email
								with a download link when ready.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Account Deletion */}
			<div className="space-y-4 border-red-200 border-t pt-6 dark:border-red-900">
				<div className="flex items-start gap-3">
					<AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
					<div>
						<h4 className="font-semibold text-red-900 dark:text-red-400">
							Delete Account
						</h4>
						<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
							Permanently delete your account and all associated data. This
							action cannot be undone.
						</p>
					</div>
				</div>

				{!showDeleteForm ? (
					<Button variant="destructive" onClick={() => setShowDeleteForm(true)}>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete My Account
					</Button>
				) : (
					<div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
						<div className="space-y-2">
							<p className="font-medium text-red-900 text-sm dark:text-red-100">
								Are you absolutely sure?
							</p>
							<ul className="list-inside list-disc space-y-1 text-red-800 text-sm dark:text-red-200">
								<li>
									All your leads, campaigns, and skip traces will be permanently
									deleted
								</li>
								<li>Your subscription will be cancelled immediately</li>
								<li>This action is irreversible and cannot be undone</li>
								<li>You will not be able to recover any data after deletion</li>
							</ul>
						</div>

						<div className="space-y-2">
							<label className="block font-medium text-red-900 text-sm dark:text-red-100">
								Type <strong>DELETE</strong> to confirm:
							</label>
							<Input
								type="text"
								value={deleteConfirmation}
								onChange={(e) => setDeleteConfirmation(e.target.value)}
								placeholder="Type DELETE to confirm"
								className="border-red-300 dark:border-red-700"
							/>
						</div>

						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setShowDeleteForm(false);
									setDeleteConfirmation("");
								}}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleDeleteAccount}
								disabled={deleteConfirmation !== "DELETE"}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Permanently Delete Account
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default DataPrivacySection;
