// // ! User actions for FastAPI Supabase backend integration
// // * This file replaces all logic from _depr/user.ts and is ready for production use

// "use server";

// import { revalidatePath } from "next/cache";
// import { v4 as uuidv4 } from "uuid";

// import type {
// 	NotificationPreferences,
// 	TwoFactorAuth,
// } from "@/types/userProfile";
// import type { UserProfile } from "@/types/userProfile";

// // * Update user profile via FastAPI backend
// export async function updateUserProfile(
// 	id: string,
// 	updatedData: Partial<UserProfile>,
// 	twoFactorAuth?: TwoFactorAuth,
// 	notifications?: Partial<NotificationPreferences>,
// ) {
// 	if (!id) {
// 		return {
// 			status: "error",
// 			message: "Invalid update request. Missing id.",
// 		};
// 	}
// 	try {
// 		const errors: string[] = [];

// 		// * Update User Profile
// 		if (Object.keys(updatedData).length > 0) {
// 			const res = await fetch(
// 				`${process.env.FAST_API_URL}/user/profile/${id}`,
// 				{
// 					method: "PATCH",
// 					headers: { "Content-Type": "application/json" },
// 					body: JSON.stringify(updatedData),
// 					credentials: "include",
// 				},
// 			);
// 			if (!res.ok) errors.push("Failed to update UserProfile.");
// 		}

// 		// * Update Two-Factor Authentication
// 		if (twoFactorAuth) {
// 			const res = await fetch(`${process.env.FAST_API_URL}/user/2fa/${id}`, {
// 				method: "PUT",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify(twoFactorAuth),
// 				credentials: "include",
// 			});
// 			if (!res.ok) errors.push("Failed to update TwoFactorAuth.");
// 		}

// 		// * Update Notification Preferences
// 		if (notifications) {
// 			const res = await fetch(
// 				`${process.env.FAST_API_URL}/user/notifications/${id}`,
// 				{
// 					method: "PUT",
// 					headers: { "Content-Type": "application/json" },
// 					body: JSON.stringify(notifications),
// 					credentials: "include",
// 				},
// 			);
// 			if (!res.ok) errors.push("Failed to update NotificationPreferences.");
// 		}

// 		if (errors.length > 0) {
// 			return { status: "error", message: errors.join(", ") };
// 		}
// 		revalidatePath("/dashboard/profile");
// 		return { status: "success", message: "Profile updated successfully!" };
// 	} catch (error) {
// 		return {
// 			status: "error",
// 			message: `Unexpected error: ${(error as Error).message}`,
// 		};
// 	}
// }

// // * Get user preferences from FastAPI backend
// export async function getUserPreferences(id: string) {
// 	const res = await fetch(
// 		`${process.env.FAST_API_URL}/user/preferences/${id}`,
// 		{
// 			method: "GET",
// 			headers: { "Content-Type": "application/json" },
// 			credentials: "include",
// 		},
// 	);
// 	if (!res.ok) return null;
// 	return await res.json();
// }

// // * Get two-factor authentication settings
// export async function getTwoFactorAuth(id: string) {
// 	const res = await fetch(`${process.env.FAST_API_URL}/user/2fa/${id}`, {
// 		method: "GET",
// 		headers: { "Content-Type": "application/json" },
// 		credentials: "include",
// 	});
// 	if (!res.ok) return null;
// 	return await res.json();
// }

// // * Get notification preferences
// export async function getNotificationPreferences(id: string) {
// 	const res = await fetch(
// 		`${process.env.FAST_API_URL}/user/notifications/${id}`,
// 		{
// 			method: "GET",
// 			headers: { "Content-Type": "application/json" },
// 			credentials: "include",
// 		},
// 	);
// 	if (!res.ok) return null;
// 	return await res.json();
// }

// // * Helper: updateUserProfileData (delegated to updateUserProfile)
// // * Helper: updateTwoFactorAuth (delegated to updateUserProfile)
// // * Helper: updateNotificationPreferences (delegated to updateUserProfile)
// //
// // All helpers are now handled via backend API endpoints for consistency.

// // ! All user-related actions now use FastAPI backend endpoints. Ensure your backend implements the corresponding REST endpoints:
// //   PATCH   /user/profile/:id
// //   PUT     /user/2fa/:id
// //   PUT     /user/notifications/:id
// //   GET     /user/preferences/:id
// //   GET     /user/2fa/:id
// //   GET     /user/notifications/:id
// //
// // ? If you need to extend functionality, add new endpoints to your FastAPI backend and mirror them here.
