"use client";

/**
 * Intent Signal Card Component
 *
 * Displays an individual intent signal with icon, description,
 * timestamp, score, and expandable metadata.
 */

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSignalWeight } from "@/lib/scoring/intentScoring";
import type { IntentSignal } from "@/types/_dashboard/intentSignals";
import {
	Calculator,
	Calendar,
	DollarSign,
	Eye,
	FileText,
	Globe,
	Linkedin,
	Mail,
	MousePointerClick,
	Phone,
	Search,
	TrendingUp,
	Users,
	Video,
} from "lucide-react";

interface IntentSignalCardProps {
	/** The intent signal to display */
	signal: IntentSignal;
	/** Show metadata details (default: false) */
	showMetadata?: boolean;
}

/**
 * Get icon component for signal category
 */
function getSignalIcon(category: IntentSignal["category"]) {
	const iconClass = "h-4 w-4";

	switch (category) {
		case "email_open":
		case "email_click":
		case "email_reply":
			return <Mail className={iconClass} />;
		case "sms_reply":
			return <Mail className={iconClass} />;
		case "call_answered":
		case "call_connected":
			return <Phone className={iconClass} />;
		case "website_visit":
		case "multiple_page_visits":
			return <Globe className={iconClass} />;
		case "pricing_viewed":
			return <DollarSign className={iconClass} />;
		case "demo_request":
			return <Calendar className={iconClass} />;
		case "property_viewed":
		case "property_search":
			return <Search className={iconClass} />;
		case "document_downloaded":
		case "contract_viewed":
			return <FileText className={iconClass} />;
		case "form_submitted":
			return <MousePointerClick className={iconClass} />;
		case "video_watched":
			return <Video className={iconClass} />;
		case "calculator_used":
			return <Calculator className={iconClass} />;
		case "linkedin_visit":
		case "linkedin_profile_view":
			return <Linkedin className={iconClass} />;
		case "company_growth":
		case "funding_event":
			return <TrendingUp className={iconClass} />;
		case "job_change":
			return <Users className={iconClass} />;
		default:
			return <Eye className={iconClass} />;
	}
}

/**
 * Get human-readable description for signal
 */
function getSignalDescription(signal: IntentSignal): string {
	const metadata = signal.metadata || {};

	switch (signal.category) {
		case "email_open":
			return metadata.emailSubject
				? `Opened email: "${metadata.emailSubject}"`
				: "Opened an email";
		case "email_click":
			return metadata.emailSubject
				? `Clicked link in: "${metadata.emailSubject}"`
				: "Clicked a link in email";
		case "email_reply":
			return "Replied to email";
		case "sms_reply":
			return "Replied to SMS";
		case "call_answered":
			return `Answered phone call${metadata.callDuration ? ` (${Math.floor(Number(metadata.callDuration) / 60)}m ${Number(metadata.callDuration) % 60}s)` : ""}`;
		case "call_connected":
			return `Connected on phone call${metadata.callDuration ? ` (${Math.floor(Number(metadata.callDuration) / 60)}m)` : ""}`;
		case "voicemail_listened":
			return "Listened to voicemail";
		case "website_visit":
			return metadata.pageTitle
				? `Visited: ${metadata.pageTitle}`
				: "Visited website";
		case "pricing_viewed":
			return "Viewed pricing page";
		case "demo_request":
			return "Requested a demo";
		case "property_viewed":
			return metadata.propertyAddress
				? `Viewed property: ${metadata.propertyAddress}`
				: "Viewed a property";
		case "property_search":
			return metadata.searchQuery
				? `Searched: "${metadata.searchQuery}"`
				: "Searched for properties";
		case "document_downloaded":
			return metadata.documentName
				? `Downloaded: ${metadata.documentName}`
				: "Downloaded a document";
		case "form_submitted":
			return metadata.formType
				? `Submitted ${metadata.formType}`
				: "Submitted a form";
		case "contract_viewed":
			return "Viewed contract";
		case "multiple_page_visits":
			return metadata.pageCount
				? `Visited ${metadata.pageCount} pages`
				: "Visited multiple pages";
		case "video_watched":
			return metadata.videoTitle
				? `Watched: ${metadata.videoTitle}`
				: "Watched a video";
		case "calculator_used":
			return metadata.calculatorType
				? `Used ${metadata.calculatorType}`
				: "Used a calculator";
		case "linkedin_visit":
			return "Visited on LinkedIn";
		case "linkedin_profile_view":
			return "Viewed LinkedIn profile";
		case "company_growth":
			return metadata.growthIndicator
				? `Company growth: ${metadata.growthIndicator}`
				: "Company growth detected";
		case "job_change":
			return metadata.newRole ? `New role: ${metadata.newRole}` : "Changed job";
		case "funding_event":
			return metadata.fundingAmount
				? `Funding: ${metadata.fundingAmount}`
				: "Funding event";
		case "social_follow":
			return `Followed on ${metadata.platform || "social media"}`;
		case "social_mention":
			return "Mentioned on social media";
		default:
			return "Activity recorded";
	}
}

/**
 * Format relative time for display
 */
function formatRelativeTime(timestamp: string): string {
	const now = new Date();
	const signalDate = new Date(timestamp);
	const diffMs = now.getTime() - signalDate.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMinutes < 60) {
		return `${diffMinutes}m ago`;
	}
	if (diffHours < 24) {
		return `${diffHours}h ago`;
	}
	if (diffDays < 7) {
		return `${diffDays}d ago`;
	}
	return signalDate.toLocaleDateString();
}

/**
 * Get badge color based on signal type
 */
function getTypeBadgeVariant(
	type: IntentSignal["type"],
): "default" | "secondary" | "outline" {
	switch (type) {
		case "behavioral":
			return "default";
		case "engagement":
			return "secondary";
		case "external":
			return "outline";
	}
}

export function IntentSignalCard({
	signal,
	showMetadata = false,
}: IntentSignalCardProps) {
	const weight = getSignalWeight(signal.category);
	const description = getSignalDescription(signal);
	const relativeTime = formatRelativeTime(signal.timestamp);
	const typeBadgeVariant = getTypeBadgeVariant(signal.type);

	return (
		<Card className="p-4 transition-shadow hover:shadow-md">
			<div className="flex items-start gap-3">
				{/* Icon */}
				<div className="rounded-lg bg-muted p-2">
					{getSignalIcon(signal.category)}
				</div>

				{/* Content */}
				<div className="flex-1 space-y-2">
					<div className="flex items-start justify-between gap-2">
						<div className="flex-1">
							<p className="font-medium text-sm">{description}</p>
							<p className="text-muted-foreground text-xs">{relativeTime}</p>
						</div>
						<Badge variant="outline" className="shrink-0 text-xs">
							+{weight} pts
						</Badge>
					</div>

					<div className="flex items-center gap-2">
						<Badge variant={typeBadgeVariant} className="text-xs capitalize">
							{signal.type}
						</Badge>
					</div>

					{/* Metadata (optional) */}
					{showMetadata &&
						signal.metadata &&
						Object.keys(signal.metadata).length > 0 && (
							<div className="mt-2 rounded-md bg-muted/50 p-2 text-xs">
								{signal.metadata.pageUrl && (
									<div className="truncate text-muted-foreground">
										<span className="font-medium">URL:</span>{" "}
										{String(signal.metadata.pageUrl)}
									</div>
								)}
								{signal.metadata.source && (
									<div className="text-muted-foreground">
										<span className="font-medium">Source:</span>{" "}
										{String(signal.metadata.source)}
									</div>
								)}
							</div>
						)}
				</div>
			</div>
		</Card>
	);
}
