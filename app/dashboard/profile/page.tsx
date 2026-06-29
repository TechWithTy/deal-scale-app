import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProfileStepper } from "@/components/forms/steppers/profile-form/ProfileStepperMain";
import PageContainer from "@/components/layout/page-container";
import { ProfilePublicApiStatus } from "./ProfilePublicApiStatus";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Profile", link: "/dashboard/profile" },
];
export default function page() {
	return (
		<PageContainer scrollable={true}>
			<div className="space-y-4" data-tour="profile-page">
				<Breadcrumbs items={breadcrumbItems} />
				<ProfilePublicApiStatus />
				<ProfileStepper />
			</div>
		</PageContainer>
	);
}
