const API_BASE_URL =
	process.env.DEAL_SCALE_API_BASE_URL || "https://api.dealscale.io";
const TEST_EMAIL =
	process.env.DEAL_SCALE_E2E_EMAIL || `codex-e2e-${Date.now()}@example.com`;
const TEST_PASSWORD =
	process.env.DEAL_SCALE_E2E_PASSWORD || `CodexE2e${Date.now()}!`;
const USE_EXISTING_ACCOUNT = Boolean(
	process.env.DEAL_SCALE_E2E_EMAIL && process.env.DEAL_SCALE_E2E_PASSWORD,
);

function getUrl(pathname) {
	return new URL(pathname, API_BASE_URL);
}

async function requestJson(pathname, init = {}) {
	const response = await fetch(getUrl(pathname), init);
	const text = await response.text();
	let body = null;

	try {
		body = text ? JSON.parse(text) : null;
	} catch {
		body = text;
	}

	return { body, response };
}

function assertOk(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

async function signup() {
	const { body, response } = await requestJson("/api/v1/auth/signup", {
		body: JSON.stringify({
			confirm_password: TEST_PASSWORD,
			email: TEST_EMAIL,
			first_name: "Codex",
			last_name: "E2E",
			password: TEST_PASSWORD,
		}),
		headers: { "Content-Type": "application/json" },
		method: "POST",
	});

	assertOk(
		response.status === 201 || response.status === 200,
		`Signup failed: ${response.status} ${JSON.stringify(body)}`,
	);
}

async function login() {
	const { body, response } = await requestJson("/api/v1/auth/login", {
		body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
		headers: { "Content-Type": "application/json" },
		method: "POST",
	});

	assertOk(
		response.status === 200 && body?.access_token,
		`Login failed: ${response.status} ${JSON.stringify(body)}`,
	);

	return body.access_token;
}

async function createApiKey(token) {
	const name = `codex-e2e-cleanup-${Date.now()}`;
	const { body, response } = await requestJson("/api/v1/api-keys/", {
		body: JSON.stringify({
			description: "Temporary key created by public API cleanup e2e",
			expires_in_days: 1,
			name,
			scopes: ["read:profile"],
		}),
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		method: "POST",
	});

	assertOk(
		response.status === 200 && body?.api_key && body?.key_id,
		`API key creation failed: ${response.status} ${JSON.stringify(body)}`,
	);

	return { keyId: body.key_id, name };
}

async function listApiKeys(token) {
	const { body, response } = await requestJson("/api/v1/api-keys/", {
		headers: { Authorization: `Bearer ${token}` },
		method: "GET",
	});

	assertOk(
		response.status === 200 && Array.isArray(body),
		`API key list failed: ${response.status} ${JSON.stringify(body)}`,
	);

	return body;
}

async function revokeApiKey(token, keyId) {
	const { body, response } = await requestJson(
		`/api/v1/api-keys/${encodeURIComponent(keyId)}`,
		{
			headers: { Authorization: `Bearer ${token}` },
			method: "DELETE",
		},
	);

	assertOk(
		response.status === 200 || response.status === 404,
		`API key revoke failed: ${response.status} ${JSON.stringify(body)}`,
	);
}

async function logout(token) {
	const { body, response } = await requestJson("/api/v1/auth/logout", {
		headers: { Authorization: `Bearer ${token}` },
		method: "POST",
	});

	assertOk(
		response.status === 200,
		`Logout failed: ${response.status} ${JSON.stringify(body)}`,
	);
}

async function main() {
	let token;
	let keyId;
	let keyName;

	try {
		if (!USE_EXISTING_ACCOUNT) {
			await signup();
		}

		token = await login();
		const apiKey = await createApiKey(token);
		keyId = apiKey.keyId;
		keyName = apiKey.name;

		const keysAfterCreate = await listApiKeys(token);
		assertOk(
			keysAfterCreate.some((key) => key.id === keyId || key.key_id === keyId),
			`Created API key was not returned by list endpoint: ${keyId}`,
		);
	} finally {
		try {
			if (token && keyId) {
				await revokeApiKey(token, keyId);

				const keysAfterCleanup = await listApiKeys(token);
				assertOk(
					!keysAfterCleanup.some(
						(key) => key.id === keyId || key.key_id === keyId,
					),
					`API key cleanup failed; key still exists: ${keyId}`,
				);
			}
		} finally {
			if (token) {
				await logout(token);
			}
		}
	}

	console.log(
		JSON.stringify(
			{
				apiBaseUrl: API_BASE_URL,
				cleanedUp: true,
				keyName,
				testEmail: USE_EXISTING_ACCOUNT ? TEST_EMAIL : undefined,
			},
			null,
			2,
		),
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
