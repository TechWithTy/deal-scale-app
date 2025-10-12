import { NextResponse } from "next/server";

type NextUrlLike = {
	pathname: string;
	origin?: string;
	clone?: () => NextUrlLike;
	toString(): string;
};

type AuthenticatedRequest = {
	nextUrl: NextUrlLike;
	auth?: unknown;
};

const MARKETING_PATHS = new Set(["/"]);

export function marketingRedirect(request: AuthenticatedRequest) {
	const { auth, nextUrl } = request;
	if (!auth || !nextUrl || !MARKETING_PATHS.has(nextUrl.pathname)) {
		return undefined;
	}

	if (nextUrl.clone) {
		const redirectTarget = nextUrl.clone();
		redirectTarget.pathname = "/dashboard";
		if ("search" in redirectTarget) {
			(redirectTarget as { search: string }).search = "";
		}
		return NextResponse.redirect(redirectTarget.toString());
	}

	const origin = nextUrl.origin ?? "https://example.com";
	const destination = new URL("/dashboard", origin);
	return NextResponse.redirect(destination.toString());
}
