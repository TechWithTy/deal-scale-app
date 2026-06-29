export type ApiErrorKind =
	| "auth"
	| "forbidden"
	| "not_found"
	| "provider_unavailable"
	| "server"
	| "validation"
	| "unknown";

export type ApiErrorEnvelope = {
	detail?: unknown;
	error?: {
		code?: string;
		details?: unknown;
		message?: string;
	};
	path?: string;
	request_id?: string;
	timestamp?: string;
};

export type PublicApiRequestOptions = Omit<RequestInit, "body"> & {
	body?: unknown;
	token?: string;
};

export type PublicApiLoginResponse = {
	access_token: string;
	expires_in?: number;
	refresh_token?: string;
	token_type?: string;
};

export type PublicApiUser = {
	available_credits?: number;
	credit_breakdown?: Record<string, unknown> | null;
	email: string;
	email_verified: boolean;
	first_name: string | null;
	id: string;
	is_active: boolean;
	last_login: string | null;
	last_name: string | null;
	profile_setup_status: string;
};

export type PublicApiProfileSetup = {
	completed_steps?: string[];
	current_step?: string;
	is_complete?: boolean;
	profile_setup_status?: string;
	required_steps?: string[];
	[key: string]: unknown;
};

export class PublicApiError extends Error {
	code?: string;
	details?: unknown;
	kind: ApiErrorKind;
	path?: string;
	requestId?: string;
	status: number;

	constructor(params: {
		code?: string;
		details?: unknown;
		kind: ApiErrorKind;
		message: string;
		path?: string;
		requestId?: string;
		status: number;
	}) {
		super(params.message);
		this.name = "PublicApiError";
		this.code = params.code;
		this.details = params.details;
		this.kind = params.kind;
		this.path = params.path;
		this.requestId = params.requestId;
		this.status = params.status;
	}
}

function getErrorKind(status: number, code?: string): ApiErrorKind {
	if (status === 401) {
		return "auth";
	}
	if (status === 403) {
		return "forbidden";
	}
	if (status === 404) {
		return "not_found";
	}
	if (status === 422 || status === 400) {
		return "validation";
	}
	if (status === 503 || code === "PROVIDER_NOT_CONFIGURED") {
		return "provider_unavailable";
	}
	if (status >= 500) {
		return "server";
	}
	return "unknown";
}

function getDetailMessage(detail: unknown) {
	if (typeof detail === "string") {
		return detail;
	}
	if (Array.isArray(detail)) {
		return detail
			.map((item) =>
				typeof item === "object" && item && "msg" in item
					? String(item.msg)
					: "Validation error",
			)
			.join("; ");
	}
	return undefined;
}

async function readJson(response: Response) {
	const text = await response.text();
	if (!text) {
		return null;
	}

	try {
		return JSON.parse(text) as unknown;
	} catch {
		return text;
	}
}

function toPublicApiError(response: Response, payload: unknown) {
	const envelope =
		typeof payload === "object" && payload !== null
			? (payload as ApiErrorEnvelope)
			: {};
	const message =
		envelope.error?.message ||
		getDetailMessage(envelope.detail) ||
		response.statusText ||
		"Request failed";
	const code = envelope.error?.code;

	return new PublicApiError({
		code,
		details: envelope.error?.details ?? envelope.detail,
		kind: getErrorKind(response.status, code),
		message,
		path: envelope.path,
		requestId: envelope.request_id,
		status: response.status,
	});
}

export async function publicApiFetch<T>(
	pathname: string,
	options: PublicApiRequestOptions = {},
) {
	const headers = new Headers(options.headers);
	headers.set("Accept", "application/json");

	if (options.token) {
		headers.set("Authorization", `Bearer ${options.token}`);
	}

	const body =
		options.body === undefined ? undefined : JSON.stringify(options.body);
	if (body && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const response = await fetch(pathname, {
		...options,
		body,
		headers,
	});
	const payload = await readJson(response);

	if (!response.ok) {
		throw toPublicApiError(response, payload);
	}

	return payload as T;
}

export function loginPublicApi(email: string, password: string) {
	return publicApiFetch<PublicApiLoginResponse>("/api/v1/auth/login", {
		body: { email, password },
		method: "POST",
	});
}

export function getCurrentUserProfile(token?: string) {
	return publicApiFetch<PublicApiUser>("/api/v1/auth/me", { token });
}

export function getProfileSetup(token?: string) {
	return publicApiFetch<PublicApiProfileSetup>("/api/v1/auth/profile-setup", {
		token,
	});
}

export function getPublicApiSupportLabel(error: unknown) {
	if (!(error instanceof PublicApiError)) {
		return "Unexpected client error";
	}

	return error.requestId
		? `${error.message} (request ${error.requestId})`
		: error.message;
}

export function isProviderUnavailable(error: unknown) {
	return (
		error instanceof PublicApiError && error.kind === "provider_unavailable"
	);
}
