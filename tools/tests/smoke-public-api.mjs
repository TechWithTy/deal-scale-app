import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const API_BASE_URL =
	process.env.DEAL_SCALE_API_BASE_URL || "https://api.dealscale.io";
const SPEC_PATH = path.join(
	process.cwd(),
	"public",
	"openapi",
	"deal-scale-public.openapi.json",
);
const REPORT_PATH = path.join(
	process.cwd(),
	"reports",
	"public-api-smoke-latest.json",
);
const METHODS_WITH_BODY = new Set(["PATCH", "POST", "PUT"]);
const SAFE_STATUS_MAX = 499;
const EXPECTED_UNAVAILABLE_CODES = new Set([
	"PROVIDER_NOT_CONFIGURED",
	"PROVIDER_UNAVAILABLE",
	"SERVICE_UNAVAILABLE",
]);
const REQUEST_TIMEOUT_MS = Number(
	process.env.DEAL_SCALE_SMOKE_TIMEOUT_MS || 30_000,
);
const SENSITIVE_FIELD_PATTERN =
	/(^|_)(api_key|access_token|refresh_token|password|secret|token)$/i;
const TEST_EMAIL =
	process.env.DEAL_SCALE_SMOKE_EMAIL || `codex-smoke-${Date.now()}@example.com`;
const TEST_PASSWORD =
	process.env.DEAL_SCALE_SMOKE_PASSWORD || `CodexSmoke${Date.now()}!`;
const INCLUDE_MUTATING =
	process.env.DEAL_SCALE_SMOKE_MUTATING === "1" ||
	process.argv.includes("--include-mutating");
const MUTATING_ALLOWLIST = new Set(
	(process.env.DEAL_SCALE_SMOKE_ALLOWLIST || "")
		.split(",")
		.map((value) => value.trim())
		.filter(Boolean),
);

const spec = JSON.parse(readFileSync(SPEC_PATH, "utf8"));
const tokenByScheme = new Map();

function resolveRef(schema) {
	if (!schema?.$ref) {
		return schema;
	}

	const name = schema.$ref.replace("#/components/schemas/", "");
	return spec.components?.schemas?.[name] || schema;
}

function sampleForSchema(schema, name = "value") {
	const resolved = resolveRef(schema);
	if (!resolved) {
		return "test";
	}

	if (resolved.anyOf) {
		const nonNull = resolved.anyOf.find((item) => item.type !== "null");
		return sampleForSchema(nonNull, name);
	}

	if (resolved.enum?.length) {
		return resolved.enum[0];
	}

	const lowerName = name.toLowerCase();
	if (resolved.format === "uuid" || lowerName.endsWith("_id")) {
		return "00000000-0000-4000-8000-000000000000";
	}
	if (resolved.format === "email" || lowerName.includes("email")) {
		return "smoke@example.com";
	}
	if (resolved.format === "date-time") {
		return "2026-01-01T00:00:00Z";
	}

	switch (resolved.type) {
		case "array":
			return [sampleForSchema(resolved.items, name)];
		case "boolean":
			return true;
		case "integer":
		case "number":
			return resolved.minimum ?? 1;
		case "object": {
			const value = {};
			for (const requiredName of resolved.required || []) {
				value[requiredName] = sampleForSchema(
					resolved.properties?.[requiredName],
					requiredName,
				);
			}
			return value;
		}
		default:
			return lowerName.includes("phone") ? "+15555550123" : "smoke-test";
	}
}

function buildUrl(pathTemplate, operation) {
	let pathname = pathTemplate;
	const url = new URL(pathname, API_BASE_URL);

	for (const parameter of operation.parameters || []) {
		const value = sampleForSchema(parameter.schema, parameter.name);
		if (parameter.in === "path") {
			pathname = pathname.replace(
				`{${parameter.name}}`,
				encodeURIComponent(value),
			);
			url.pathname = pathname;
		}
		if (parameter.in === "query" && parameter.required) {
			url.searchParams.set(parameter.name, value);
		}
	}

	return url;
}

function buildBody(operation) {
	const content = operation.requestBody?.content?.["application/json"];
	if (!content) {
		return undefined;
	}

	return sampleForSchema(content.schema, "body");
}

async function requestJson(url, init) {
	const response = await fetch(url, {
		...init,
		signal: init?.signal || AbortSignal.timeout(REQUEST_TIMEOUT_MS),
	});
	const text = await response.text();

	try {
		return { body: text ? JSON.parse(text) : null, response };
	} catch {
		return { body: text.slice(0, 500), response };
	}
}

function redactSensitive(value) {
	if (Array.isArray(value)) {
		return value.map(redactSensitive);
	}
	if (!value || typeof value !== "object") {
		return value;
	}

	return Object.fromEntries(
		Object.entries(value).map(([key, child]) => [
			key,
			SENSITIVE_FIELD_PATTERN.test(key) ? "[REDACTED]" : redactSensitive(child),
		]),
	);
}

async function authenticate() {
	const signupBody = {
		confirm_password: TEST_PASSWORD,
		email: TEST_EMAIL,
		first_name: "Codex",
		last_name: "Smoke",
		password: TEST_PASSWORD,
	};
	const signupUrl = new URL("/api/v1/auth/signup", API_BASE_URL);
	const signup = await requestJson(signupUrl, {
		body: JSON.stringify(signupBody),
		headers: { "Content-Type": "application/json" },
		method: "POST",
	});

	const loginBody = { email: TEST_EMAIL, password: TEST_PASSWORD };
	const loginUrl = new URL("/api/v1/auth/login", API_BASE_URL);
	const login = await requestJson(loginUrl, {
		body: JSON.stringify(loginBody),
		headers: { "Content-Type": "application/json" },
		method: "POST",
	});

	const token = login.body?.access_token || signup.body?.access_token;
	if (!token) {
		throw new Error(
			`Authentication failed. signup=${signup.response.status} ${JSON.stringify(
				signup.body,
			)} login=${login.response.status} ${JSON.stringify(login.body)}`,
		);
	}

	tokenByScheme.set("BearerAuth", token);
	tokenByScheme.set("HTTPBearer", token);
	tokenByScheme.set("OAuth2PasswordBearer", token);

	return {
		email: TEST_EMAIL,
		loginStatus: login.response.status,
		signupStatus: signup.response.status,
	};
}

function getHeaders(operation) {
	const headers = { Accept: "application/json" };
	const security = operation.security || spec.security || [];

	if (security.length) {
		headers.Authorization = `Bearer ${tokenByScheme.get("BearerAuth")}`;
	}

	return headers;
}

async function smokeOperation(method, pathTemplate, operation) {
	const isMutating = !["GET", "HEAD"].includes(method);
	const isAllowlisted =
		MUTATING_ALLOWLIST.has(operation.operationId) ||
		MUTATING_ALLOWLIST.has(`${method} ${pathTemplate}`);

	if (isMutating && !INCLUDE_MUTATING && !isAllowlisted) {
		return {
			method,
			ok: true,
			operationId: operation.operationId,
			path: pathTemplate,
			skipped: true,
			skipReason: "mutating operations are disabled by default",
			tag: operation.tags?.[0] || "untagged",
		};
	}

	const url = buildUrl(pathTemplate, operation);
	const headers = getHeaders(operation);
	const init = { headers, method };

	if (METHODS_WITH_BODY.has(method)) {
		const body = buildBody(operation);
		headers["Content-Type"] = "application/json";
		init.body = JSON.stringify(body ?? {});
	}

	const startedAt = Date.now();
	try {
		const { body, response } = await requestJson(url, init);
		const isExpectedProviderUnavailable =
			response.status === 503 &&
			EXPECTED_UNAVAILABLE_CODES.has(body?.error?.code);
		const outcome = isExpectedProviderUnavailable
			? "expected_provider_unavailable"
			: response.status < 400
				? "success"
				: response.status < 500
					? "controlled_client_error"
					: "failure";

		return {
			durationMs: Date.now() - startedAt,
			method,
			ok: response.status <= SAFE_STATUS_MAX || isExpectedProviderUnavailable,
			operationId: operation.operationId,
			outcome,
			path: pathTemplate,
			responsePreview: body,
			status: response.status,
			tag: operation.tags?.[0] || "untagged",
			url: url.toString(),
		};
	} catch (error) {
		return {
			durationMs: Date.now() - startedAt,
			error: error.message,
			method,
			ok: false,
			operationId: operation.operationId,
			path: pathTemplate,
			tag: operation.tags?.[0] || "untagged",
			url: url.toString(),
		};
	}
}

async function cleanupResources(results) {
	const token = tokenByScheme.get("BearerAuth");
	const headers = { Authorization: `Bearer ${token}` };
	const createdKeyIds = results
		.filter((result) => result.operationId === "ApiKeys-create_user_api_key")
		.map((result) => result.responsePreview?.key_id)
		.filter(Boolean);
	const revokedKeyIds = [];

	for (const keyId of createdKeyIds) {
		const { response } = await requestJson(
			new URL(`/api/v1/api-keys/${encodeURIComponent(keyId)}`, API_BASE_URL),
			{ headers, method: "DELETE" },
		);
		if (![200, 404].includes(response.status)) {
			throw new Error(
				`API key cleanup failed for ${keyId}: ${response.status}`,
			);
		}
		revokedKeyIds.push(keyId);
	}

	const { body: keys, response: listResponse } = await requestJson(
		new URL("/api/v1/api-keys/", API_BASE_URL),
		{ headers, method: "GET" },
	);
	if (
		listResponse.status !== 200 ||
		!Array.isArray(keys) ||
		createdKeyIds.some((keyId) =>
			keys.some((key) => key.id === keyId || key.key_id === keyId),
		)
	) {
		throw new Error("API key cleanup verification failed");
	}

	const { response: cartResponse } = await requestJson(
		new URL("/api/v1/cart", API_BASE_URL),
		{ headers, method: "DELETE" },
	);
	if (cartResponse.status !== 200) {
		throw new Error(`Cart cleanup failed: ${cartResponse.status}`);
	}

	return {
		apiKeysRevoked: revokedKeyIds.length,
		cartCleared: true,
		verified: true,
	};
}

async function main() {
	const auth = await authenticate();
	const operations = [];
	const deferredOperations = [];

	for (const [pathTemplate, pathItem] of Object.entries(spec.paths)) {
		for (const [method, operation] of Object.entries(pathItem)) {
			const entry = [method.toUpperCase(), pathTemplate, operation];
			if (operation.operationId === "Authentication-logout") {
				deferredOperations.push(entry);
			} else {
				operations.push(entry);
			}
		}
	}
	const results = [];
	for (const [method, pathTemplate, operation] of operations) {
		results.push(await smokeOperation(method, pathTemplate, operation));
	}

	let cleanup = { verified: false };
	try {
		if (INCLUDE_MUTATING) {
			cleanup = await cleanupResources(results);
		}
	} catch (error) {
		cleanup = { error: error.message, verified: false };
	}

	for (const [method, pathTemplate, operation] of deferredOperations) {
		results.push(await smokeOperation(method, pathTemplate, operation));
	}

	const summary = {
		apiBaseUrl: API_BASE_URL,
		auth,
		cleanup,
		failed: results.filter((result) => !result.ok).length,
		generatedAt: new Date().toISOString(),
		mutatingAllowlist: Array.from(MUTATING_ALLOWLIST).sort(),
		mutatingEnabled: INCLUDE_MUTATING,
		outcomes: {
			controlledClientErrors: results.filter(
				(result) => result.outcome === "controlled_client_error",
			).length,
			expectedProviderUnavailable: results.filter(
				(result) => result.outcome === "expected_provider_unavailable",
			).length,
			success: results.filter((result) => result.outcome === "success").length,
		},
		passed: results.filter((result) => result.ok && !result.skipped).length,
		skipped: results.filter((result) => result.skipped).length,
		total: results.length,
	};

	writeFileSync(
		REPORT_PATH,
		JSON.stringify(redactSensitive({ results, summary }), null, 2),
	);
	console.log(JSON.stringify(summary, null, 2));

	if (
		INCLUDE_MUTATING &&
		(summary.failed > 0 || summary.skipped > 0 || !cleanup.verified)
	) {
		process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
