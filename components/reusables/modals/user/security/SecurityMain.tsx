"use client";
/**
 * SecurityMain: Comprehensive Security Management Modal
 * Full-featured security UI for managing all security aspects
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModalStore } from "@/lib/stores/dashboard";
import { X } from "lucide-react";
import PasswordSection from "./PasswordSection";
import TwoFactorSection from "./TwoFactorSection";
import ApiKeysSection from "./ApiKeysSection";
import SessionsSection from "./SessionsSection";
import ActivityLogSection from "./ActivityLogSection";
import WebhookSecuritySection from "./WebhookSecuritySection";
import DataPrivacySection from "./DataPrivacySection";

const SecurityMain: React.FC = () => {
	const { isSecurityModalOpen, closeSecurityModal } = useModalStore();
	const [activeTab, setActiveTab] = useState<string>("password");

	if (!isSecurityModalOpen) return null;

	return (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
			onClick={closeSecurityModal}
			onKeyDown={(e) => {
				if (e.key === "Escape") closeSecurityModal();
			}}
		>
			<div
				className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="border-gray-200 border-b p-6 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="font-semibold text-2xl text-gray-900 dark:text-white">
								Security Settings
							</h2>
							<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
								Manage your account security, authentication, and access
								controls
							</p>
						</div>
						<button
							onClick={closeSecurityModal}
							type="button"
							className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
							aria-label="Close modal"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div
					className="overflow-y-auto p-6"
					style={{ maxHeight: "calc(90vh - 100px)" }}
				>
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						{/* Tab Navigation */}
						<TabsList className="mb-6 grid w-full grid-cols-4 lg:grid-cols-7">
							<TabsTrigger value="password">Password</TabsTrigger>
							<TabsTrigger value="2fa">2FA</TabsTrigger>
							<TabsTrigger value="api-keys">API Keys</TabsTrigger>
							<TabsTrigger value="sessions">Sessions</TabsTrigger>
							<TabsTrigger value="activity">Activity</TabsTrigger>
							<TabsTrigger value="webhooks">Webhooks</TabsTrigger>
							<TabsTrigger value="privacy">Privacy</TabsTrigger>
						</TabsList>

						{/* Password Tab */}
						<TabsContent value="password">
							<PasswordSection />
						</TabsContent>

						{/* 2FA Tab */}
						<TabsContent value="2fa">
							<TwoFactorSection />
						</TabsContent>

						{/* API Keys Tab */}
						<TabsContent value="api-keys">
							<ApiKeysSection />
						</TabsContent>

						{/* Sessions Tab */}
						<TabsContent value="sessions">
							<SessionsSection />
						</TabsContent>

						{/* Activity Log Tab */}
						<TabsContent value="activity">
							<ActivityLogSection />
						</TabsContent>

						{/* Webhooks Security Tab */}
						<TabsContent value="webhooks">
							<WebhookSecuritySection />
						</TabsContent>

						{/* Data & Privacy Tab */}
						<TabsContent value="privacy">
							<DataPrivacySection />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
};

export default SecurityMain;
