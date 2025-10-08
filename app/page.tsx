import { auth } from "@/auth";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "@/constants/testingMode";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SIGN_IN_ROUTE = "/signin";
const AUTHENTICATED_HOME = "/dashboard";

/**
 * Determines the correct sign-in destination for public entry points.
 * Keeping the branch explicit allows the environment flag to evolve without
 * touching this redirect logic again.
 */
function resolveSignInDestination(testingModeEnabled: boolean) {
	return testingModeEnabled ? SIGN_IN_ROUTE : SIGN_IN_ROUTE;
}

export default async function HomePage() {
	const session = await auth();

	if (session?.user) {
		redirect(AUTHENTICATED_HOME);
	}

	redirect(resolveSignInDestination(NEXT_PUBLIC_APP_TESTING_MODE));
}
