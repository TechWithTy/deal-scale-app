import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type OpenApiDocument = {
	paths: Record<string, Record<string, unknown>>;
};

type RouteEntry = {
	methods: Set<string>;
	pattern: RegExp;
	template: string;
};

const SPEC_PATH = path.join(
	process.cwd(),
	"public",
	"openapi",
	"deal-scale-public.openapi.json",
);
const DEFAULT_API_BASE_URL = "https://api.dealscale.io";
const BODYLESS_METHODS = new Set(["GET", "HEAD"]);
const HOP_BY_HOP_HEADERS = new Set([
	"connection",
	"content-length",
	"host",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailer",
	"transfer-encoding",
	"upgrade",
]);
const OPENAPI_METHODS = new Set(["DELETE", "GET", "PATCH", "POST", "PUT"]);

let routeEntries: RouteEntry[] | undefined;

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pathTemplateToPattern(template: string) {
	const parts = template.split("/").filter(Boolean);
	const pattern = parts
		.map((part) => (part.startsWith("{") ? "[^/]+" : escapeRegExp(part)))
		.join("/");

	return new RegExp(`^/${pattern}$`);
}

function getRouteEntries() {
	if (routeEntries) {
		return routeEntries;
	}

	const spec = JSON.parse(readFileSync(SPEC_PATH, "utf8")) as OpenApiDocument;
	routeEntries = Object.entries(spec.paths).map(([template, operations]) => ({
		methods: new Set(
			Object.keys(operations)
				.map((method) => method.toUpperCase())
				.filter((method) => OPENAPI_METHODS.has(method)),
		),
		pattern: pathTemplateToPattern(template),
		template,
	}));

	return routeEntries;
}

function findRoute(pathname: string) {
	return getRouteEntries().find((entry) => entry.pattern.test(pathname));
}

function getAllowedMethods(entry: RouteEntry) {
	const methods = new Set(entry.methods);

	if (methods.has("GET")) {
		methods.add("HEAD");
	}

	return Array.from(methods).sort();
}

function getForwardHeaders(source: Headers) {
	const headers = new Headers(source);

	for (const header of HOP_BY_HOP_HEADERS) {
		headers.delete(header);
	}

	return headers;
}

function getApiBaseUrl() {
	return (
		process.env.DEAL_SCALE_API_BASE_URL ||
		process.env.NEXT_PUBLIC_DEAL_SCALE_API_BASE_URL ||
		DEFAULT_API_BASE_URL
	).replace(/\/+$/, "");
}

async function buildProxyRequestInit(request: NextRequest) {
	const method = request.method.toUpperCase();

	return {
		body: BODYLESS_METHODS.has(method)
			? undefined
			: await request.arrayBuffer(),
		headers: getForwardHeaders(request.headers),
		method,
		redirect: "manual" as RequestRedirect,
	};
}

export async function proxyPublicApiRequest(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	const method = request.method.toUpperCase();
	const route = findRoute(pathname);

	if (!route) {
		return NextResponse.json(
			{ error: "API route is not documented", path: pathname },
			{ status: 404 },
		);
	}

	const allowedMethods = getAllowedMethods(route);
	if (!allowedMethods.includes(method)) {
		return NextResponse.json(
			{ allowed_methods: allowedMethods, error: "Method not allowed" },
			{ headers: { Allow: allowedMethods.join(", ") }, status: 405 },
		);
	}

	const apiBaseUrl = getApiBaseUrl();
	if (new URL(apiBaseUrl).origin === request.nextUrl.origin) {
		return NextResponse.json(
			{ error: "API proxy target cannot be the current Next.js origin" },
			{ status: 508 },
		);
	}

	const upstreamUrl = new URL(`${apiBaseUrl}${pathname}`);
	upstreamUrl.search = request.nextUrl.search;

	const upstreamResponse = await fetch(
		upstreamUrl,
		await buildProxyRequestInit(request),
	);
	const responseHeaders = getForwardHeaders(upstreamResponse.headers);

	return new Response(method === "HEAD" ? null : upstreamResponse.body, {
		headers: responseHeaders,
		status: upstreamResponse.status,
		statusText: upstreamResponse.statusText,
	});
}
