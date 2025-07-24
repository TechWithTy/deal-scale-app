import type { NextAuthConfig } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { NextResponse } from "next/server";

// Get the base URL based on the environment
const getBaseUrl = () => {
	// In production on Vercel, use VERCEL_URL if available
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	// Allow overriding with NEXTAUTH_URL if explicitly set
	if (process.env.NEXTAUTH_URL) {
		return process.env.NEXTAUTH_URL;
	}
	// Default to localhost for development
	return "http://localhost:3000";
};

const baseUrl = getBaseUrl();
console.log("Auth Config - Base URL:", baseUrl);

// Get the root domain for cookies (without www or subdomains)
const getCookieDomain = (url: string) => {
	try {
		const hostname = new URL(url).hostname;
		// For localhost, return undefined to avoid setting domain
		if (hostname === "localhost") return undefined;
		// For Vercel preview URLs, use the full domain
		if (hostname.endsWith(".vercel.app")) return hostname;
		// For custom domains, remove subdomains
		const parts = hostname.split(".");
		return parts.length > 2 ? parts.slice(-2).join(".") : hostname;
	} catch (e) {
		console.error("Error parsing URL for cookie domain:", e);
		return undefined;
	}
};

const cookieDomain = getCookieDomain(baseUrl);
console.log("Auth Config - Cookie Domain:", cookieDomain);

// List of trusted hosts for NextAuth
export const authTrustedHosts = [
	// Vercel preview deployments
	/\.vercel\.app$/,
	// Add your production domain here when ready
	// /yourdomain\.com$/,
];

// Auth configuration for NextAuth
export // Auth configuration for NextAuth with App Router support
const authConfig: NextAuthConfig = {
	providers: [
		CredentialProvider({
			name: "credentials",
			credentials: {
				email: { type: "email", label: "Email" },
				password: { type: "password", label: "Password" },
			},
			async authorize(credentials) {
				try {
					const testEmail = process.env.NEXT_PUBLIC_TEST_USER_EMAIL;
					const testPassword = process.env.NEXT_PUBLIC_TEST_USER_PASSWORD;

					if (!testEmail || !testPassword) {
						console.error(
							"Missing test user credentials in environment variables",
						);
						return null;
					}

					// DEBUG LOGGING
					console.log("AUTH_DEBUG: Authorization attempt", {
						hasCredentials: !!credentials,
						emailProvided: !!credentials?.email,
						passwordProvided: !!credentials?.password,
						testEmailConfigured: !!testEmail,
						testPasswordConfigured: !!testPassword,
						environment: process.env.NODE_ENV,
						baseUrl: process.env.NEXTAUTH_URL || process.env.VERCEL_URL,
					});

					if (!credentials?.email || !credentials?.password) {
						console.error("Missing email or password in credentials");
						return null;
					}

					if (
						credentials.email !== testEmail ||
						credentials.password !== testPassword
					) {
						console.warn("AUTH_FAILED: Invalid credentials", {
							email: credentials.email,
							timestamp: new Date().toISOString(),
						});
						return null;
					}

					const user = {
						id: "test-user",
						email: testEmail,
						name: "Test User",
						role: "tester",
					};
					console.log("AUTH_SUCCESS: User authenticated successfully", {
						email: user.email,
						timestamp: new Date().toISOString(),
					});
					return user;
				} catch (error) {
					console.error("AUTH_ERROR: Unexpected error during authentication", {
						error: error instanceof Error ? error.message : "Unknown error",
						stack: error instanceof Error ? error.stack : undefined,
						timestamp: new Date().toISOString(),
					});
					return null;
				}
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	useSecureCookies: process.env.NODE_ENV === "production",
	cookies: {
		sessionToken: {
			name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: process.env.NODE_ENV === "production",
				domain: cookieDomain,
			},
		},
	},
	debug:
		process.env.NODE_ENV === "development" ||
		process.env.NODE_ENV === "production",
	trustHost: true, // Temporarily set to true for Vercel, implement custom trust check in middleware instead
	theme: {
		logo: `${baseUrl}/logo.png`, // Example of using baseUrl
	},
	callbacks: {
		async redirect({ url, baseUrl }) {
			// Ensure we don't redirect to external URLs
			if (url.startsWith(baseUrl)) {
				return url;
			}
			// Redirect to the base URL if the URL is not relative
			return baseUrl;
		},

		// Add session callback to ensure user is included in the session
		async session({ session, token }) {
			if (token?.user) {
				// Safely type the user object
				session.user = {
					...session.user,
					...(token.user as Record<string, unknown>),
				};
			}
			return session;
		},

		// Add JWT callback to handle user data
		async jwt({ token, user }) {
			if (user) {
				token.user = user;
			}
			return token;
		},
	},
	pages: {
		signIn: "/auth/signin",
	},
} satisfies NextAuthConfig;

// Export the config for use in the auth route handler
export default authConfig;
