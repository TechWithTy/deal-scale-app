import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProfileStepper } from "@/components/forms/steppers/profile-form/ProfileStepperMain";
import PageContainer from "@/components/layout/page-container";
import { mockUserProfile } from "@/constants/_faker/profile/userProfile";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Profile", link: "/dashboard/profile" },
];
export default function page() {
	return (
		<PageContainer scrollable={true}>
			<div className="space-y-4">
				<Breadcrumbs items={breadcrumbItems} />
				<ProfileStepper />
			</div>
		</PageContainer>
	);
}
