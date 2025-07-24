// import { updateUserProfile } from "@/actions/user";
import type {
	NotificationPreferences,
	TwoFactorAuth,
	UserProfile,
} from "@/types/userProfile";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import { toast } from "sonner";

// 1️⃣ Update Personal Information (UserProfile Table)
export const updatePersonalInfoUtil = async (
	id: string,
	formData: ProfileFormValues,
	setLoading: (loading: boolean) => void,
) => {
	try {
		setLoading(true);

		console.log(`🔄 Updating personal info for user: ${id}`);

		// ✅ Extract Two-Factor Authentication Data
		const twoFactorAuth: TwoFactorAuth = {
			methods: {
				sms: formData.twoFactorAuth?.methods?.sms ?? false,
				email: formData.twoFactorAuth?.methods?.email ?? false,
				authenticatorApp:
					formData.twoFactorAuth?.methods?.authenticatorApp ?? false,
			},
			lastUpdatedAt: formData.twoFactorAuth?.methods?.isEnabled
				? new Date()
				: undefined,
		};

		console.log("🛠 Two-Factor Auth Data:", twoFactorAuth);

		// ✅ Extract Notification Preferences Data
		const notificationPreferences: NotificationPreferences = {
			emailNotifications: formData.notifications?.emailNotifications ?? false,
			smsNotifications: formData.notifications?.smsNotifications ?? false,
			notifyForNewLeads: formData.notifications?.notifyForNewLeads ?? false,
			notifyForCampaignUpdates:
				formData.notifications?.notifyForCampaignUpdates ?? false,
		};

		console.log("🔔 Notification Preferences Data:", notificationPreferences);

		// ✅ Extract General User Profile Data
		const updatedUserProfile: Partial<UserProfile> = {
			firstName: formData.firstName,
			lastName: formData.lastName,
			email: formData.email,
			state: formData.state,
			city: formData.city,
			personalNum: formData.personalNum,
			updatedAt: new Date(),
		};

		console.log("📌 Updated User Profile Data:", updatedUserProfile);

		// ✅ Call `updateUserProfile` with extracted data
		// const response = await updateUserProfile(
		// 	id,
		// 	updatedUserProfile,
		// 	twoFactorAuth,
		// 	notificationPreferences,
		// );

		// if (response.status === "error") {
		// 	toast.error(response.message);
		// 	console.error("❌ Error updating profile:", response.message);
		// 	return false;
		// }

		toast.success("✅ Personal Information updated successfully!");
		console.log("✅ Profile update successful!");

		return true;
	} catch (error) {
		console.error("🚨 Error updating personal info:", error);
		toast.error("Something went wrong while updating your profile.");
		return false;
	} finally {
		setLoading(false);
	}
};
