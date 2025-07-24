// import { fetchUserProfileData, getUserProfile } from "@/actions/auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import BillingModalMain from "@/components/reusables/modals/user/billing/BillingModalMain";
import { SecurityModal } from "@/components/reusables/modals/user/security";
import AiUsageModal from "@/components/reusables/modals/user/usage";
import UsageModalMain from "@/components/reusables/modals/user/usage/UsageMain";
import { WebhookModal } from "@/components/reusables/modals/user/webhooks/WebHookMain";
import { InviteEmployeeModal } from "@/components/tables/employee-tables/utils/addEmployee";
import { Toaster } from "@/components/ui/sonner";
import {
	MockUserProfile,
	mockUserProfile,
} from "@/constants/_faker/profile/userProfile";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title:
		"Lead Ignite Dashboard | Real Estate Property Search & Market Analysis",
	description:
		"Explore properties by location with the Lead Ignite Dashboard. Access in-depth market analysis and detailed property information to make informed decisions for your real estate business.",
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
	return (
		<div className="flex">
			{/* Pass only a valid UserProfile or null to Sidebar */}
			<Sidebar user={MockUserProfile} />
			<main className="w-full flex-1 overflow-hidden">
				<Header />
				{children}
			</main>
			<AiUsageModal />
			<BillingModalMain
				billingHistory={mockUserProfile.billingHistory}
				paymentDetails={mockUserProfile.paymentDetails}
				subscription={mockUserProfile.subscription}
			/>
			<InviteEmployeeModal />
			<SecurityModal />
			<UsageModalMain />
			<WebhookModal />
			<Toaster />
		</div>
	);
}
