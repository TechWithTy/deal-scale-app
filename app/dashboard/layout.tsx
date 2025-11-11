import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
// import { fetchUserProfileData, getUserProfile } from "@/actions/auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import {
	MockUserProfile,
	mockUserProfile,
} from "@/constants/_faker/profile/userProfile";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import { DemoRevealWrapper } from "@/components/demo/DemoRevealWrapper";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

// 🚀 Lazy load modals - only load when needed (saves ~150KB on initial bundle)
const SkipTraceDialog = dynamic(
	() => import("@/components/maps/properties/utils/createListModal"),
	{ ssr: false },
);
const BillingModalMain = dynamic(
	() => import("@/components/reusables/modals/user/billing/BillingModalMain"),
	{ ssr: false },
);
const LeaderboardModal = dynamic(
	() =>
		import("@/components/reusables/modals/user/leaderboard/LeaderboardModal"),
	{ ssr: false },
);
const SecurityModal = dynamic(
	() =>
		import("@/components/reusables/modals/user/security").then(
			(mod) => mod.SecurityModal,
		),
	{ ssr: false },
);
const AiUsageModal = dynamic(
	() => import("@/components/reusables/modals/user/usage"),
	{ ssr: false },
);
const UpgradeModal = dynamic(
	() =>
		import("@/components/reusables/modals/user/usage/UpgradeModal").then(
			(mod) => mod.UpgradeModal,
		),
	{ ssr: false },
);
const WebhookModal = dynamic(
	() =>
		import("@/components/reusables/modals/user/webhooks/WebHookMain").then(
			(mod) => mod.WebhookModal,
		),
	{ ssr: false },
);
const WheelSpinnerModal = dynamic(
	() => import("@/components/reusables/modals/user/wheel/WheelSpinnerModal"),
	{ ssr: false },
);
const InviteEmployeeModal = dynamic(
	() =>
		import("@/components/tables/employee-tables/utils/addEmployee").then(
			(mod) => mod.InviteEmployeeModal,
		),
	{ ssr: false },
);

export const metadata: Metadata = {
	title: "Deal Scale Dashboard | Real Estate Property Search & Market Analysis",
	description:
		"Explore properties by location with the Deal Scale Dashboard. Access in-depth market analysis and detailed property information to make informed decisions for your real estate business.",
};

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// const supabase = await createClient();
	// const { data } = await supabase.auth.getUser(); // ✅ Get authenticated user session

	// if (!data?.user) {
	// 	return <p>Unauthorized</p>;
	// }

	// Fetch the full user profile on the server
	// const userProfileResponse = await getUserProfile(data.user.id);
	// const userProfile =
	// 	userProfileResponse && userProfileResponse.status === "success"
	// 		? userProfileResponse.userProfile
	// 		: MockUserProfile;

	// const response = await fetchUserProfileData("data.user.id", "ActivityLog");

	// console.log(`Table Fetch ${data.user.id}`, response);

	// Narrow the possibly false-y mock to a usable value
	const user = MockUserProfile || null;

	return (
		<DemoRevealWrapper>
			<div className="flex">
				{/* Pass only a valid UserProfile or null to Sidebar */}
				<Sidebar user={user} />
				<main className="w-full flex-1 overflow-x-hidden overflow-y-auto">
					<ImpersonationBanner />
					<Header />
					{children}
				</main>
				<AiUsageModal />
				{user && (
					<BillingModalMain
						billingHistory={user.billingHistory}
						paymentDetails={user.paymentDetails}
						subscription={user.subscription}
					/>
				)}
				<InviteEmployeeModal />
				<SecurityModal />
				<WebhookModal />
				<UpgradeModal trial={false} />
				<LeaderboardModal />
				<WheelSpinnerModal />
				<SkipTraceDialog />
			</div>
		</DemoRevealWrapper>
	);
}
