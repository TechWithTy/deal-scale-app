import React from "react";
import { auth } from "@/auth";
import AuthenticationPage from "@/app/(auth)/signin/page";
import { AuthenticatedHomeShell } from "@/components/home/authenticated-home-shell";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage() {
	const session = await auth();

	if (!session) {
		return <AuthenticationPage />;
	}

	return <AuthenticatedHomeShell />;
}
