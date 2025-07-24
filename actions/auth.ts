// // ! Auth actions for FastAPI Supabase backend integration
// // * This file replaces all logic from _depr/auth.ts and is ready for production use

// "use server";

// import { createClient } from "@/utils/supabase/server";
// import type { Provider } from "@supabase/supabase-js";
// import { revalidatePath } from "next/cache";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import { v4 as uuidv4 } from "uuid";

// // * Get current user session from FastAPI backend
// export async function getUserSession() {
// 	const res = await fetch(`${process.env.FAST_API_URL}/auth/session`, {
// 		method: "GET",
// 		headers: { "Content-Type": "application/json" },
// 		credentials: "include",
// 	});
// 	if (!res.ok) return null;
// 	const data = await res.json();
// 	return { status: "success", user: data?.user };
// }

// // * Sign up user (delegates to FastAPI backend)
// export async function signUp(formData: FormData) {
// 	const payload = {
// 		email: formData.get("email")?.toString() ?? "",
// 		password: formData.get("password")?.toString() ?? "",
// 		username: formData.get("username")?.toString() ?? undefined,
// 	};
// 	if (!payload.email || !payload.password)
// 		throw new Error("Email and password are required.");
// 	const res = await fetch(`${process.env.FAST_API_URL}/auth/signup`, {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		credentials: "include",
// 		body: JSON.stringify(payload),
// 	});
// 	const data = await res.json();
// 	if (!res.ok) return { status: data?.message || "error", user: null };
// 	revalidatePath("/", "layout");
// 	return { status: "success", user: data.user };
// }

// // * Sign in user (delegates to FastAPI backend)
// export async function signIn(formData: FormData) {
// 	const payload = {
// 		email: formData.get("email")?.toString() ?? "",
// 		password: formData.get("password")?.toString() ?? "",
// 	};
// 	const res = await fetch(`${process.env.FAST_API_URL}/auth/signin`, {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		credentials: "include",
// 		body: JSON.stringify(payload),
// 	});
// 	const data = await res.json();
// 	if (!res.ok) return { status: data?.message || "error", user: null };
// 	revalidatePath("/", "layout");
// 	return { status: "success", user: data.user };
// }

// // * Sign out user (delegates to FastAPI backend)
// export async function signOut() {
// 	const res = await fetch(`${process.env.FAST_API_URL}/auth/signout`, {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		credentials: "include",
// 	});
// 	if (!res.ok) redirect("/error");
// 	revalidatePath("/", "layout");
// 	redirect("/login");
// }

// // * Sign in with OAuth provider (delegates to FastAPI backend)
// export async function signInWithOAuth(
// 	provider: Provider | null = "linkedin_oidc",
// ) {
// 	const origin = (await headers()).get("origin");
// 	const payload = {
// 		provider: provider || "linkedin",
// 		redirectTo: `${origin}/auth/callback`,
// 	};
// 	const res = await fetch(`${process.env.FAST_API_URL}/auth/oauth`, {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		credentials: "include",
// 		body: JSON.stringify(payload),
// 	});
// 	const data = await res.json();
// 	if (!res.ok) redirect("/error");
// 	if (data.url) return redirect(data.url);
// }

// // * Forgot password (delegates to FastAPI backend)
// export async function forgotPassword(formData: FormData) {
// 	const origin = (await headers()).get("origin");
// 	const payload = {
// 		email: formData.get("email")?.toString() ?? "",
// 		redirectTo: `${origin}/reset-password`,
// 	};
// 	const res = await fetch(`${process.env.FAST_API_URL}/auth/forgot-password`, {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		credentials: "include",
// 		body: JSON.stringify(payload),
// 	});
// 	const data = await res.json();
// 	if (!res.ok) return { status: data?.message || "error" };
// 	return { status: "success" };
// }

// // * Reset password using code (delegates to FastAPI backend)
// export async function resetPassword(formData: FormData, code: string) {
// 	if (!code) return { status: "Invalid or missing token. Err" };
// 	const payload = {
// 		password: formData.get("password")?.toString() ?? "",
// 		code,
// 	};
// 	const res = await fetch(`${process.env.FAST_API_URL}/auth/reset-password`, {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		credentials: "include",
// 		body: JSON.stringify(payload),
// 	});
// 	const data = await res.json();
// 	if (!res.ok) return { status: data?.message || "error" };
// 	return { status: "success" };
// }

// // * Get user profile by user_id (delegates logic to Supabase backend REST API)
// export async function getUserProfile(id: string) {
// 	const res = await fetch(`${process.env.FAST_API_URL}/user-profile/${id}`, {
// 		method: "GET",
// 		headers: { "Content-Type": "application/json" },
// 		credentials: "include",
// 	});
// 	if (!res.ok) {
// 		const err = await res.json().catch(() => ({}));
// 		return { status: "error", message: err?.message || "User not found" };
// 	}
// 	const data = await res.json();
// 	return { status: "success", userProfile: data };
// }

// // * Fetch user profile data (optionally for a specific table) via Supabase backend REST API
// export async function fetchUserProfileData(id: string, table?: string) {
// 	const url = table
// 		? `${process.env.FAST_API_URL}/user-profile/${id}/${table}`
// 		: `${process.env.FAST_API_URL}/user-profile/${id}`;
// 	const res = await fetch(url, {
// 		method: "GET",
// 		headers: { "Content-Type": "application/json" },
// 		credentials: "include",
// 	});
// 	if (!res.ok) {
// 		const err = await res.json().catch(() => ({}));
// 		return {
// 			status: "error",
// 			message: err?.message || "Failed to fetch user profile data",
// 			data: null,
// 		};
// 	}
// 	const data = await res.json();
// 	return { status: "success", data };
// }
