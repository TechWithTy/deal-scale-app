/**
 * WebhookSecuritySection: Webhooks security settings and link to main webhooks modal
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/lib/stores/dashboard";
import {
	Activity,
	ArrowRight,
	CheckCircle2,
	Key,
	Mail,
	Package,
	PhoneCall,
	Rss,
	Shield,
	Webhook,
	XCircle,
} from "lucide-react";
import { toast } from "sonner";

const WebhookSecuritySection: React.FC = () => {
	const { openWebhookModal, closeSecurityModal } = useModalStore();

	const webhookCategories = [
		{
			id: "leads",
			name: "Leads",
			icon: <Mail className="h-5 w-5" />,
			description:
				"Webhook events for lead creation, updates, and status changes",
			activeWebhooks: 3,
		},
		{
			id: "campaigns",
			name: "Campaigns",
			icon: <Activity className="h-5 w-5" />,
			description: "Campaign lifecycle events and performance metrics",
			activeWebhooks: 2,
		},
		{
			id: "skiptracing",
			name: "Skip Tracing",
			icon: <PhoneCall className="h-5 w-5" />,
			description: "Skip trace results and data enrichment notifications",
			activeWebhooks: 1,
		},
	];

	const webhookStages = [
		{
			id: "incoming",
			name: "Incoming Webhooks",
			description: "Receive data from external services",
			icon: <Package className="h-5 w-5" />,
		},
		{
			id: "outgoing",
			name: "Outgoing Webhooks",
			description: "Send data to external services when events occur",
			icon: <ArrowRight className="h-5 w-5" />,
		},
		{
			id: "feeds",
			name: "RSS Feeds",
			description: "RSS feed subscriptions and real-time updates",
			icon: <Rss className="h-5 w-5" />,
		},
	];

	const handleOpenWebhookModal = (
		stage: "incoming" | "outgoing" | "feeds",
		category?: "leads" | "campaigns" | "skiptracing",
	) => {
		closeSecurityModal();
		openWebhookModal(stage, category || "leads");
	};

	const securityFeatures = [
		{
			enabled: true,
			name: "HMAC Signature Verification",
			description: "Verify webhook authenticity",
		},
		{
			enabled: true,
			name: "IP Whitelist",
			description: "Restrict webhooks to trusted IPs",
		},
		{
			enabled: false,
			name: "Rate Limiting",
			description: "Prevent abuse with rate limits",
		},
		{
			enabled: true,
			name: "SSL/TLS Required",
			description: "Enforce HTTPS for all webhooks",
		},
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
					Webhook Security
				</h3>
				<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
					Manage security settings for incoming and outgoing webhooks
				</p>
			</div>

			{/* Quick Access Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				{webhookStages.map((stage) => (
					<div
						key={stage.id}
						className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700"
						onClick={() =>
							handleOpenWebhookModal(
								stage.id as "incoming" | "outgoing" | "feeds",
							)
						}
					>
						<div className="flex items-start justify-between">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
								{stage.icon}
							</div>
							<ArrowRight className="h-5 w-5 text-gray-400" />
						</div>
						<h4 className="mt-3 font-semibold text-gray-900 dark:text-white">
							{stage.name}
						</h4>
						<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
							{stage.description}
						</p>
					</div>
				))}
			</div>

			{/* Webhook Categories */}
			<div>
				<h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
					Webhook Categories
				</h4>
				<div className="space-y-3">
					{webhookCategories.map((category) => (
						<div
							key={category.id}
							className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
									{category.icon}
								</div>
								<div>
									<h5 className="font-semibold text-gray-900 dark:text-white">
										{category.name}
									</h5>
									<p className="text-gray-600 text-sm dark:text-gray-400">
										{category.description}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Badge variant="outline">
									{category.activeWebhooks} active
								</Badge>
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										handleOpenWebhookModal(
											"incoming",
											category.id as "leads" | "campaigns" | "skiptracing",
										)
									}
								>
									Configure
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Security Features */}
			<div>
				<h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
					Security Features
				</h4>
				<div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
					{securityFeatures.map((feature, index) => (
						<div
							key={index}
							className="flex items-start justify-between rounded-lg bg-white p-3 dark:bg-gray-900"
						>
							<div className="flex items-start gap-3">
								{feature.enabled ? (
									<CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
								) : (
									<XCircle className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-600" />
								)}
								<div>
									<p className="font-medium text-gray-900 text-sm dark:text-white">
										{feature.name}
									</p>
									<p className="text-gray-600 text-xs dark:text-gray-400">
										{feature.description}
									</p>
								</div>
							</div>
							<Badge variant={feature.enabled ? "default" : "secondary"}>
								{feature.enabled ? "Enabled" : "Disabled"}
							</Badge>
						</div>
					))}
				</div>
			</div>

			{/* Webhook Signing Key */}
			<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
						<Key className="h-5 w-5 text-green-600 dark:text-green-400" />
					</div>
					<div className="flex-1">
						<h4 className="font-semibold text-gray-900 dark:text-white">
							Webhook Signing Secret
						</h4>
						<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
							Use this secret to verify webhook signatures and ensure
							authenticity
						</p>
						<code className="mt-3 block rounded bg-gray-100 px-3 py-2 font-mono text-sm dark:bg-gray-700">
							whsec_{"*".repeat(40)}
						</code>
						<div className="mt-3 flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => toast.success("Signing secret regenerated")}
							>
								Regenerate
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => toast.success("Secret copied to clipboard")}
							>
								Copy
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Manage All Webhooks */}
			<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
				<div className="flex items-start justify-between">
					<div className="flex gap-3">
						<Shield className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
						<div>
							<p className="font-medium text-blue-900 text-sm dark:text-blue-100">
								Configure Webhooks
							</p>
							<p className="mt-1 text-blue-800 text-sm dark:text-blue-200">
								Set up incoming webhooks, outgoing webhooks, and RSS feeds for
								your leads, campaigns, and skip traces
							</p>
						</div>
					</div>
					<Button
						className="flex-shrink-0"
						onClick={() => handleOpenWebhookModal("incoming", "leads")}
					>
						Open Webhooks
						<Webhook className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default WebhookSecuritySection;
