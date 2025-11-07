/**
 * InviteFriendsCard Usage Examples
 *
 * This file demonstrates various ways to use the InviteFriendsCard component
 * in different scenarios and configurations.
 */

import { InviteFriendsCard } from "./InviteFriendsCard";
import type { ReferralStats, SharePlatform } from "./InviteFriendsCard";

/**
 * Example 1: Basic Usage
 * Minimal configuration with just a referral URL
 */
export function BasicInviteExample() {
	return <InviteFriendsCard referralUrl="https://dealscale.app/ref/ABC123" />;
}

/**
 * Example 2: Full Configuration
 * All props with custom values and callbacks
 */
export function FullConfigExample() {
	const handleShare = (platform: SharePlatform) => {
		console.log(`User shared via ${platform}`);

		// Track analytics
		// analytics.track('referral_shared', {
		//   platform,
		//   userId: currentUser.id,
		//   timestamp: new Date().toISOString(),
		// });

		// Update database
		// await updateReferralStats(currentUser.id, platform);
	};

	const handleMessageChange = (newMessage: string) => {
		console.log("Custom message updated:", newMessage);

		// Save to user preferences
		// await saveUserPreference('referral_message', newMessage);
	};

	const stats: ReferralStats = {
		totalInvitesSent: 15,
		pendingSignups: 3,
		successfulReferrals: 8,
		rewardsEarned: 400,
	};

	return (
		<InviteFriendsCard
			referralUrl="https://dealscale.app/ref/JOHN2024"
			userName="John Doe"
			rewardType="credits"
			rewardAmount={50}
			customMessage="Join me on DealScale and revolutionize your real estate business!"
			showStats={true}
			compactMode={false}
			stats={stats}
			onShare={handleShare}
			onMessageChange={handleMessageChange}
			loading={false}
		/>
	);
}

/**
 * Example 3: Compact Mode
 * Smaller layout for sidebars or modals
 */
export function CompactInviteExample() {
	return (
		<InviteFriendsCard
			referralUrl="https://dealscale.app/ref/COMPACT"
			userName="Jane Smith"
			compactMode={true}
			showStats={false}
		/>
	);
}

/**
 * Example 4: With Loading State
 * Show loading state while fetching referral URL
 */
export function LoadingInviteExample() {
	return (
		<InviteFriendsCard
			referralUrl="Generating your referral link..."
			loading={true}
		/>
	);
}

/**
 * Example 5: In Profile Dashboard
 * Integrated with user session data
 */
export function DashboardInviteExample() {
	// Simulated user session data
	const currentUser = {
		id: "user_123",
		name: "Alex Johnson",
		referralCode: "ALEX2024",
		referralStats: {
			totalInvitesSent: 42,
			pendingSignups: 7,
			successfulReferrals: 28,
			rewardsEarned: 1400,
		},
	};

	const referralUrl = `https://dealscale.app/ref/${currentUser.referralCode}`;

	return (
		<div className="container mx-auto p-6">
			<h1 className="mb-6 font-bold text-2xl">Refer & Earn</h1>
			<InviteFriendsCard
				referralUrl={referralUrl}
				userName={currentUser.name}
				rewardType="credits"
				rewardAmount={50}
				showStats={true}
				stats={currentUser.referralStats}
				onShare={(platform) => {
					// Analytics tracking
					console.log(`${currentUser.name} shared via ${platform}`);
				}}
			/>
		</div>
	);
}

/**
 * Example 6: Modal Integration
 * Inside a modal or dialog
 */
export function ModalInviteExample() {
	return (
		<div className="max-w-lg">
			<InviteFriendsCard
				referralUrl="https://dealscale.app/ref/MODAL123"
				userName="Sarah Wilson"
				compactMode={true}
				showStats={false}
				rewardAmount={100}
				rewardType="bonus credits"
			/>
		</div>
	);
}

/**
 * Example 7: Multi-Tier Rewards
 * Different reward amounts based on tier
 */
export function TieredRewardExample() {
	const userTier = "premium"; // bronze, silver, gold, premium

	const rewardConfig = {
		bronze: { amount: 25, type: "credits" },
		silver: { amount: 50, type: "credits" },
		gold: { amount: 100, type: "credits" },
		premium: { amount: 200, type: "premium credits" },
	};

	const reward = rewardConfig[userTier as keyof typeof rewardConfig];

	return (
		<InviteFriendsCard
			referralUrl="https://dealscale.app/ref/PREMIUM"
			userName="Premium User"
			rewardType={reward.type}
			rewardAmount={reward.amount}
			customMessage="As a premium member, I get extra rewards for each referral. Join me and let's grow together!"
		/>
	);
}

/**
 * Example 8: Integration with State Management (Zustand)
 */
export function StateManagementExample() {
	// Example using Zustand store
	// const { referralUrl, stats, updateStats } = useReferralStore();

	const mockReferralUrl = "https://dealscale.app/ref/STATE123";
	const mockStats: ReferralStats = {
		totalInvitesSent: 5,
		pendingSignups: 2,
		successfulReferrals: 3,
		rewardsEarned: 150,
	};

	const handleShare = (platform: SharePlatform) => {
		// Update Zustand store
		// updateStats({ totalInvitesSent: stats.totalInvitesSent + 1 });

		console.log(`Shared via ${platform}, stats updated`);
	};

	return (
		<InviteFriendsCard
			referralUrl={mockReferralUrl}
			stats={mockStats}
			onShare={handleShare}
		/>
	);
}

/**
 * Example 9: Server-Side Rendering (SSR)
 * Fetch referral data on server
 */
export async function SSRInviteExample() {
	// This would run on the server in a Next.js page/component

	// Simulated server-side data fetching
	// const referralData = await fetch('/api/user/referral').then(r => r.json());

	const referralData = {
		url: "https://dealscale.app/ref/SSR123",
		userName: "Server User",
		stats: {
			totalInvitesSent: 12,
			pendingSignups: 4,
			successfulReferrals: 6,
			rewardsEarned: 300,
		},
	};

	return (
		<InviteFriendsCard
			referralUrl={referralData.url}
			userName={referralData.userName}
			stats={referralData.stats}
		/>
	);
}

/**
 * Example 10: A/B Testing Different Messages
 */
export function ABTestingExample() {
	const variant = Math.random() > 0.5 ? "A" : "B";

	const messages = {
		A: "Join DealScale and transform your real estate business with AI-powered automation!",
		B: "I've closed 3x more deals using DealScale. Try it out with my referral link!",
	};

	const handleShare = (platform: SharePlatform) => {
		// Track A/B test results
		console.log(`Variant ${variant} shared via ${platform}`);

		// Send to analytics
		// analytics.track('ab_test_referral', {
		//   variant,
		//   platform,
		//   timestamp: new Date().toISOString(),
		// });
	};

	return (
		<InviteFriendsCard
			referralUrl={`https://dealscale.app/ref/TEST${variant}`}
			customMessage={messages[variant]}
			onShare={handleShare}
		/>
	);
}
