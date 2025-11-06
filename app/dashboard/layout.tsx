// import { fetchUserProfileData, getUserProfile } from "@/actions/auth";
import Header from "@/components/layout/header";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import Sidebar from "@/components/layout/sidebar";
import SkipTraceDialog from "@/components/maps/properties/utils/createListModal";
import BillingModalMain from "@/components/reusables/modals/user/billing/BillingModalMain";
import { SecurityModal } from "@/components/reusables/modals/user/security";
import AiUsageModal from "@/components/reusables/modals/user/usage";
import { UpgradeModal } from "@/components/reusables/modals/user/usage/UpgradeModal";
import { WebhookModal } from "@/components/reusables/modals/user/webhooks/WebHookMain";
import { InviteEmployeeModal } from "@/components/tables/employee-tables/utils/addEmployee";
import LeaderboardModal from "@/components/reusables/modals/user/leaderboard/LeaderboardModal";
import WheelSpinnerModal from "@/components/reusables/modals/user/wheel/WheelSpinnerModal";
import dynamic from "next/dynamic";
import {
	MockUserProfile,
	mockUserProfile,
} from "@/constants/_faker/profile/userProfile";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import type { Metadata } from "next";

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
		<div className="flex">
			{/* Pass only a valid UserProfile or null to Sidebar */}
			<Sidebar user={user} />
			<main className="w-full flex-1 overflow-hidden">
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
	);
}
