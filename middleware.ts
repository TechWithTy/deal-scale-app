import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;

	// * Note: Protect the dashboard route
	if (nextUrl.pathname.startsWith("/dashboard")) {
		if (isLoggedIn) {
			return; // * Note: Allow access to the dashboard
		}
		// * Note: Redirect unauthenticated users to the login page
		return Response.redirect(new URL("/", nextUrl));
	}

	// * Note: Allow all other requests to pass
});

// * Note: Optionally, don't invoke Middleware on some paths
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
