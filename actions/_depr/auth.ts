// "use server";

// import { createClient } from "@/utils/supabase/server";
// import type { Provider } from "@supabase/supabase-js";
// import { revalidatePath } from "next/cache";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import { v4 as uuidv4 } from "uuid";
// export async function getUserSession() {
// 	const supabase = await createClient();
// 	const { data, error } = await supabase.auth.getUser();

// 	if (error) {
// 		return null;
// 	}
// 	return { status: "success", user: data?.user };
// }
// export async function signUp(formData: FormData) {
// 	const supabase = await createClient();

// 	// ✅ Explicitly cast email and password as strings and handle null
// 	const credentials = {
// 		email: formData.get("email")?.toString() ?? "",
// 		password: formData.get("password")?.toString() ?? "",
// 	};
// 	const { email, password } = credentials;

// 	if (!email || !password) {
// 		throw new Error("Email and password are required.");
// 	}

// 	const { error, data } = await supabase.auth.signUp({
// 		email,
// 		password,
// 		options: {
// 			data: {
// 				username: formData.get("username") as string | undefined, // ✅ Handle username safely
// 			},
// 		},
// 	});

// 	if (error) {
// 		return {
// 			status: error?.message,
// 			user: null,
// 		};
// 	}
// 	if (data?.user?.identities?.length === 0) {
// 		return {
// 			status: "User with this email already exists",
// 			user: null,
// 		};
// 	}

// 	revalidatePath("/", "layout");
// 	return { status: "success", user: data.user };
// }

// export async function signIn(formData: FormData) {
// 	const supabase = await createClient();

// 	const credentials = {
// 		email: formData.get("email")?.toString() ?? "",
// 		password: formData.get("password")?.toString() ?? "",
// 	};
// 	const { email, password } = credentials;

// 	const { error, data } = await supabase.auth.signInWithPassword(credentials);

// 	if (error) {
// 		return {
// 			status: error?.message,
// 			user: null,
// 		};
// 	}

// 	const { data: existingUser } = await supabase
// 		.from("UserProfile")
// 		.select("*")
// 		.eq("email", credentials?.email)
// 		.limit(1)
// 		.single();

// 	if (!existingUser) {
// 		const { error: insertError } = await supabase.from("UserProfile").insert({
// 			id: uuidv4(),
// 			user_id: data?.user.id,
// 			email: data?.user.email,
// 			username: data?.user.user_metadata.username,
// 		});

// 		if (insertError) {
// 			return {
// 				status: insertError.message,
// 				user: null,
// 			};
// 		}
// 	}
// 	revalidatePath("/", "layout");
// 	return { status: "success", user: data.user };

// 	// TODO: create a user instance of in user profiles table
// }

// export async function signOut() {
// 	const supabase = await createClient();
// 	const { error } = await supabase.auth.signOut();
// 	if (error) {
// 		redirect("/error");
// 	}
// 	revalidatePath("/", "layout");
// 	redirect("/login");
// }

// export async function signInWithOAuth(
// 	provider: Provider | null = "linkedin_oidc",
// ) {
// 	const supabase = await createClient();
// 	const origin = (await headers()).get("origin");
// 	const { data, error } = await supabase.auth.signInWithOAuth({
// 		provider: provider || "linkedin", // Ensures a default value if provider is null
// 		options: {
// 			redirectTo: `${origin}/auth/callback`,
// 		},
// 	});

// 	if (error) {
// 		redirect("/error");
// 	} else if (data.url) {
// 		return redirect(data.url);
// 	}
// }

// export async function forgotPassword(formData: FormData) {
// 	const supabase = await createClient();
// 	const origin = (await headers()).get("origin");

// 	const { error, data } = await supabase.auth.resetPasswordForEmail(
// 		formData.get("email") as string,
// 		{
// 			redirectTo: `${origin}/reset-password`,
// 		},
// 	);
// 	if (error) {
// 		return { status: error?.message };
// 	}
// 	return { status: "success" };
// }

// export async function resetPassword(formData: FormData, code: string) {
// 	if (!code) {
// 		return { status: "Invalid or missing token. Err" };
// 	}

// 	const supabase = await createClient();

// 	const { error: CodeError } = await supabase.auth.exchangeCodeForSession(code);

// 	if (CodeError) {
// 		return { status: CodeError?.message };
// 	}

// 	const { error } = await supabase.auth.updateUser({
// 		password: formData.get("password") as string,
// 	});

// 	if (error) {
// 		return { status: error?.message };
// 	}

// 	return { status: "success" };
// }

// export async function getUserProfile(id: string) {
// 	const supabase = await createClient();
// 	const { data, error } = await supabase
// 		.from("UserProfile")
// 		.select("*")
// 		.eq("user_id", id)
// 		.single();

// 	if (error || !data) {
// 		return { status: "error", message: error?.message || "User not found" };
// 	}

// 	return {
// 		status: "success",
// 		userProfile: {
// 			...data,
// 			id: data.user_id, // ✅ Map `user_id` from DB to `id` in Zustand
// 		},
// 	};
// }

// export async function fetchUserProfileData(id: string, table?: string) {
// 	const supabase = await createClient();

// 	if (table) {
// 		// ✅ Fetch a specific table related to the user
// 		const { data, error } = await supabase
// 			.from(table)
// 			.select("*")
// 			.eq("user_id", id);

// 		if (error) {
// 			return {
// 				status: "error",
// 				message: `Failed to fetch ${table}: ${error.message}`,
// 				data: null,
// 			};
// 		}

// 		return { status: "success", data };
// 	}
// 	// ✅ Fetch the entire user profile with all relations
// 	const { data, error } = await supabase
// 		.from("UserProfile")
// 		.select(
// 			`
//           *,
//           subscription:UserProfileSubscription(*),
//           connectedAccounts:ConnectedAccounts(*),
//           leadPreferences:LeadPreferences(*),
//           savedSearches:SavedSearch(*),
//           notificationPreferences:NotificationPreferences(*),
//           integrations:Integration(*),
//           companyInfo:CompanyInfo(*),
//           aIKnowledgebase:AIKnowledgebase(*),
//           billingHistory:BillingHistoryItem(*),
//           paymentDetails:PaymentDetails(*),
//           twoFactorAuth:TwoFactorAuth(*),
//           teamMembers:TeamMember(*),
//           activityLog:ActivityLog(*),
//           securitySettings:SecuritySettings(*),
//           CompanyCampaignsUserProfile:CompanyCampaignsUserProfile(*),
//           CampaignAnalytics:CampaignAnalytics(*),
//           LeadList:LeadList(*),
//           KanbanState:KanbanState(*),
//           KanbanTask:KanbanTask(*)
//           `,
// 		)
// 		.eq("user_id", id)
// 		.single();

// 	if (error) {
// 		return {
// 			status: "error",
// 			message: `Failed to fetch user profile: ${error.message}`,
// 			data: null,
// 		};
// 	}

// 	return { status: "success", data };
// }
