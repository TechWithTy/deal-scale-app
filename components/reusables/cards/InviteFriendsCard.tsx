"use client";

/**
 * InviteFriendsCard Component
 *
 * A reusable card component for inviting friends with custom referral URLs
 * and social sharing functionality.
 *
 * @see InviteFriendsCard.feature for Gherkin/Cucumber test scenarios
 */

import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
	Copy,
	Check,
	Mail,
	MessageSquare,
	Facebook,
	Twitter,
	Linkedin,
	Share2,
	Users,
	Gift,
	TrendingUp,
	Edit2,
} from "lucide-react";

/**
 * Share platform types
 */
export type SharePlatform =
	| "email"
	| "sms"
	| "facebook"
	| "twitter"
	| "linkedin"
	| "whatsapp"
	| "copy";

/**
 * Referral statistics interface
 */
export interface ReferralStats {
	totalInvitesSent: number;
	pendingSignups: number;
	successfulReferrals: number;
	rewardsEarned: number;
}

/**
 * InviteFriendsCard Props
 */
export interface InviteFriendsCardProps {
	/** User's unique referral URL */
	referralUrl: string;
	/** User's display name */
	userName?: string;
	/** Type of reward (credits, points, etc.) */
	rewardType?: string;
	/** Amount of reward per successful referral */
	rewardAmount?: number;
	/** Custom invite message template */
	customMessage?: string;
	/** Whether to show referral statistics */
	showStats?: boolean;
	/** Compact mode for smaller displays */
	compactMode?: boolean;
	/** Referral statistics data */
	stats?: ReferralStats;
	/** Callback when share action is triggered */
	onShare?: (platform: SharePlatform) => void;
	/** Callback when message is customized */
	onMessageChange?: (message: string) => void;
	/** Loading state */
	loading?: boolean;
}

/**
 * Default invite message template
 */
const DEFAULT_MESSAGE = `Hey! I've been using DealScale for my real estate business and thought you might find it valuable too. Join me using my referral link below and we both get rewarded! 🎉`;

/**
 * InviteFriendsCard Component
 */
export const InviteFriendsCard: React.FC<InviteFriendsCardProps> = ({
	referralUrl,
	userName = "there",
	rewardType = "credits",
	rewardAmount = 50,
	customMessage,
	showStats = true,
	compactMode = false,
	stats = {
		totalInvitesSent: 0,
		pendingSignups: 0,
		successfulReferrals: 0,
		rewardsEarned: 0,
	},
	onShare,
	onMessageChange,
	loading = false,
}) => {
	const { toast } = useToast();
	const [copied, setCopied] = useState(false);
	const [isEditingMessage, setIsEditingMessage] = useState(false);
	const [message, setMessage] = useState(customMessage || DEFAULT_MESSAGE);

	/**
	 * Copy referral link to clipboard
	 * @see InviteFriendsCard.feature - Scenario: Copy referral link to clipboard
	 */
	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(referralUrl);
			setCopied(true);
			toast({
				title: "Link copied!",
				description: "Your referral link has been copied to clipboard.",
			});

			// Reset copied state after 2 seconds
			setTimeout(() => setCopied(false), 2000);

			// Track the share action
			onShare?.("copy");
		} catch (error) {
			// Fallback for browsers that don't support clipboard API
			toast({
				title: "Copy failed",
				description: "Please copy the link manually.",
				variant: "destructive",
			});
		}
	};

	/**
	 * Share via Email
	 * @see InviteFriendsCard.feature - Scenario: Share referral link via email
	 */
	const handleShareEmail = () => {
		const subject = encodeURIComponent("Join me on DealScale!");
		const body = encodeURIComponent(
			`Hi ${userName},\n\n${message}\n\n${referralUrl}\n\nLooking forward to seeing you there!\n\nBest regards`,
		);
		const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

		window.open(mailtoLink, "_blank");
		onShare?.("email");

		toast({
			title: "Email opened",
			description: "Your email client should open with the invite message.",
		});
	};

	/**
	 * Share via SMS
	 * @see InviteFriendsCard.feature - Scenario: Share referral link via SMS
	 */
	const handleShareSMS = () => {
		const smsBody = encodeURIComponent(
			`Hey! Check out DealScale: ${referralUrl} - ${message}`,
		);
		const smsLink = `sms:?body=${smsBody}`;

		window.open(smsLink, "_blank");
		onShare?.("sms");

		toast({
			title: "SMS opened",
			description: "Your messaging app should open with the invite message.",
		});
	};

	/**
	 * Share via Social Media
	 * @see InviteFriendsCard.feature - Scenario Outline: Share referral link via social platforms
	 */
	const handleShareSocial = (
		platform: "facebook" | "twitter" | "linkedin" | "whatsapp",
	) => {
		let shareUrl = "";

		switch (platform) {
			case "facebook":
				shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
					referralUrl,
				)}`;
				break;
			case "twitter":
				shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
					message,
				)}&url=${encodeURIComponent(referralUrl)}`;
				break;
			case "linkedin":
				shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
					referralUrl,
				)}`;
				break;
			case "whatsapp":
				shareUrl = `https://wa.me/?text=${encodeURIComponent(
					`${message} ${referralUrl}`,
				)}`;
				break;
		}

		window.open(shareUrl, "_blank", "width=600,height=600");
		onShare?.(platform);

		toast({
			title: `Sharing on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
			description: "A new window should open to share your referral link.",
		});
	};

	/**
	 * Handle message customization
	 * @see InviteFriendsCard.feature - Scenario: Customize invite message
	 */
	const handleSaveCustomMessage = () => {
		setIsEditingMessage(false);
		onMessageChange?.(message);

		toast({
			title: "Message updated",
			description: "Your custom message will be used for all shares.",
		});
	};

	const shareButtons = [
		{
			icon: Mail,
			label: "Email",
			color: "text-blue-600",
			bg: "hover:bg-blue-50",
			onClick: handleShareEmail,
		},
		{
			icon: MessageSquare,
			label: "SMS",
			color: "text-green-600",
			bg: "hover:bg-green-50",
			onClick: handleShareSMS,
		},
		{
			icon: Facebook,
			label: "Facebook",
			color: "text-blue-700",
			bg: "hover:bg-blue-50",
			onClick: () => handleShareSocial("facebook"),
		},
		{
			icon: Twitter,
			label: "Twitter",
			color: "text-sky-500",
			bg: "hover:bg-sky-50",
			onClick: () => handleShareSocial("twitter"),
		},
		{
			icon: Linkedin,
			label: "LinkedIn",
			color: "text-blue-600",
			bg: "hover:bg-blue-50",
			onClick: () => handleShareSocial("linkedin"),
		},
		{
			icon: Share2,
			label: "WhatsApp",
			color: "text-green-600",
			bg: "hover:bg-green-50",
			onClick: () => handleShareSocial("whatsapp"),
		},
	];

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5 text-primary" />
							Invite Friends
						</CardTitle>
						<CardDescription>
							Share DealScale and earn {rewardAmount} {rewardType} per
							successful referral
						</CardDescription>
					</div>
					<Badge variant="secondary" className="gap-1">
						<Gift className="h-3 w-3" />
						{rewardAmount} {rewardType}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Referral Link Section */}
				<div className="space-y-2">
					<label className="font-medium text-sm">Your Referral Link</label>
					<div className="flex gap-2">
						<Input
							value={referralUrl}
							readOnly
							className="flex-1 font-mono text-sm"
							disabled={loading}
						/>
						<Button
							type="button"
							variant={copied ? "default" : "outline"}
							size="icon"
							onClick={handleCopyLink}
							disabled={loading}
							aria-label="Copy referral link"
						>
							{copied ? (
								<Check className="h-4 w-4" />
							) : (
								<Copy className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>

				{/* Custom Message Section */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<label className="font-medium text-sm">Invite Message</label>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								if (isEditingMessage) {
									handleSaveCustomMessage();
								} else {
									setIsEditingMessage(true);
								}
							}}
							disabled={loading}
						>
							<Edit2 className="mr-1 h-3 w-3" />
							{isEditingMessage ? "Save" : "Customize"}
						</Button>
					</div>
					{isEditingMessage ? (
						<Textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							className="min-h-[100px] text-sm"
							placeholder="Enter your custom invite message..."
							disabled={loading}
						/>
					) : (
						<p className="rounded-md bg-muted p-3 text-muted-foreground text-sm leading-relaxed">
							{message}
						</p>
					)}
				</div>

				{/* Share Options */}
				<div className="space-y-3">
					<label className="font-medium text-sm">Share Via</label>
					<div
						className={`grid ${
							compactMode ? "grid-cols-3" : "grid-cols-2 md:grid-cols-3"
						} gap-2`}
					>
						{shareButtons.map((button) => (
							<Button
								key={button.label}
								type="button"
								variant="outline"
								className={`h-auto flex-col gap-2 py-3 ${button.bg}`}
								onClick={button.onClick}
								disabled={loading}
								aria-label={`Share via ${button.label}`}
							>
								<button.icon className={`h-5 w-5 ${button.color}`} />
								<span className="text-xs">{button.label}</span>
							</Button>
						))}
					</div>
				</div>

				{/* Referral Statistics */}
				{showStats && (
					<div className="space-y-3 rounded-lg border bg-muted/30 p-4">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-4 w-4 text-primary" />
							<h4 className="font-semibold text-sm">Your Referral Stats</h4>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-muted-foreground text-xs">Total Invites</p>
								<p className="font-bold text-2xl">{stats.totalInvitesSent}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Pending</p>
								<p className="font-bold text-2xl text-orange-600">
									{stats.pendingSignups}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Successful</p>
								<p className="font-bold text-2xl text-green-600">
									{stats.successfulReferrals}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Rewards Earned</p>
								<p className="font-bold text-2xl text-primary">
									{stats.rewardsEarned}
								</p>
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default InviteFriendsCard;
