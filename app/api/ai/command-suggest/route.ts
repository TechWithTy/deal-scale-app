import { NextResponse } from "next/server";

// CORS helpers
const ALLOW_HEADERS = "Authorization, Content-Type, X-Deal-Action-Key";
const ALLOW_METHODS = "GET, OPTIONS";

function parseAllowedOrigins(): string[] {
	const raw = process.env.ACTION_BAR_CORS_ORIGINS || "";
	return raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

function resolveAllowOrigin(
	origin: string | null,
	allowed: string[],
): string | null {
	if (!origin) return null;
	if (allowed.includes("*")) return origin;
	return allowed.includes(origin) ? origin : null;
}

function corsHeaders(request: Request): Headers {
	const origin = request.headers.get("origin");
	const allowed = parseAllowedOrigins();
	let allowOrigin: string | null = null;

	if (allowed.length === 0) {
		// Default: same-origin only; in dev permit localhost for quick demos
		if (
			origin?.startsWith("http://localhost") ||
			origin?.startsWith("http://127.0.0.1")
		) {
			allowOrigin = origin;
		}
	} else {
		allowOrigin = resolveAllowOrigin(origin, allowed);
	}

	const headers = new Headers();
	headers.set("Vary", "Origin");
	if (allowOrigin) headers.set("Access-Control-Allow-Origin", allowOrigin);
	headers.set("Access-Control-Allow-Methods", ALLOW_METHODS);
	headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
	headers.set("Access-Control-Max-Age", "600");
	return headers;
}

function providedToken(request: Request): string {
	const auth = request.headers.get("authorization") || "";
	if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
	const headerKey = request.headers.get("x-deal-action-key");
	if (headerKey) return headerKey.trim();
	const { searchParams } = new URL(request.url);
	const key = searchParams.get("key");
	return (key || "").trim();
}

function tokenValid(token: string): boolean {
	const configured = (
		process.env.ACTION_BAR_API_KEYS ||
		process.env.ACTION_BAR_API_KEY ||
		""
	)
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	if (configured.length === 0) {
		// Require token in production when none configured
		if (process.env.NODE_ENV === "production") return false;
		return true;
	}
	return configured.includes(token);
}

export async function OPTIONS(request: Request) {
	const headers = corsHeaders(request);
	return new Response(null, { status: 204, headers });
}

// Very simple heuristic suggestions. Replace with real AI endpoint later.
export async function GET(request: Request) {
	const headers = corsHeaders(request);
	// Token validation (Authorization: Bearer, X-Deal-Action-Key, or ?key=)
	const token = providedToken(request);
	if (!tokenValid(token)) {
		return NextResponse.json(
			{ error: "Unauthorized" },
			{ status: 401, headers },
		);
	}

	const { searchParams } = new URL(request.url);
	const q = (searchParams.get("q") || "").toLowerCase();
	const ctx = searchParams.get("ctx") || "/";

	const suggestions: {
		id: string;
		label: string;
		hint?: string;
		actionPath?: string;
	}[] = [];

	// Context-aware: leaderboard
	if (ctx.includes("leaderboard")) {
		if (q.includes("rank") || q.includes("top")) {
			suggestions.push(
				{
					id: "lb-top-1",
					label: "Jump to #1 Champion",
					hint: "Scroll to champion row",
					actionPath: "/app/dashboard/leaderboard?jump=1",
				},
				{
					id: "lb-top-10",
					label: "Filter: Top 10 Players",
					hint: "Show only top 10",
					actionPath: "/app/dashboard/leaderboard?filter=top10",
				},
			);
		}
		if (q.includes("predict") || q.includes("ai")) {
			suggestions.push(
				{
					id: "lb-ai-player-watch",
					label: "AI: Players to Watch",
					hint: "Surging and at-risk players",
					actionPath: "/app/dashboard/leaderboard?ai=players-to-watch",
				},
				{
					id: "lb-ai-my-rank",
					label: "AI: My Rank Prediction",
					hint: "Where you'll be in 24h",
					actionPath: "/app/dashboard/leaderboard?ai=my-rank",
				},
			);
		}
	}

	// Generic navigation suggestions
	if (q.startsWith("h") || q.includes("home")) {
		suggestions.push({ id: "nav-home", label: "Go Home", actionPath: "/" });
	}
	if (q.includes("leader")) {
		suggestions.push({
			id: "nav-leaderboard",
			label: "Open Leaderboard",
			actionPath: "/app/dashboard/leaderboard",
		});
	}

	// Deduplicate by id
	const unique = Array.from(
		new Map(suggestions.map((s) => [s.id, s])).values(),
	);

	return NextResponse.json({ suggestions: unique.slice(0, 6) }, { headers });
}
