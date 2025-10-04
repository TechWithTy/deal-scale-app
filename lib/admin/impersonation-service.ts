import { z } from "zod";
import type { ImpersonationSessionPayload } from "@/types/impersonation";

const START_SCHEMA = z.object({
	userId: z.string().min(1, "Target user id is required"),
});

const identitySchema = z.object({
	id: z.string().min(1),
	name: z.string().nullish(),
	email: z.string().email().nullish(),
});

const responseSchema = z.object({
	impersonatedUser: identitySchema,
	impersonator: identitySchema,
});

async function parseJson(response: Response) {
	try {
		return await response.json();
	} catch (error) {
		console.error("Failed to parse impersonation response", error);
		return null;
	}
}

function buildError(message: string, fallback: string) {
	if (message) {
		return new Error(`${fallback}: ${message}`);
	}
	return new Error(fallback);
}

export async function startImpersonationSession(
	params: z.input<typeof START_SCHEMA>,
): Promise<ImpersonationSessionPayload> {
	const parsed = START_SCHEMA.safeParse(params);
	if (!parsed.success) {
		throw new Error(
			parsed.error.issues[0]?.message ?? "Invalid impersonation request",
		);
	}

	const response = await fetch("/api/admin/impersonation", {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		cache: "no-store",
		body: JSON.stringify(parsed.data),
	});

	if (!response.ok) {
		const body = await parseJson(response);
		const message = body?.error as string | undefined;
		throw buildError(message ?? "", "Failed to start impersonation session");
	}

	const body = await parseJson(response);
	const validated = responseSchema.safeParse(body);
	if (!validated.success) {
		throw new Error("Invalid impersonation response payload");
	}

	return validated.data satisfies ImpersonationSessionPayload;
}

export async function stopImpersonationSession(): Promise<void> {
	const response = await fetch("/api/admin/impersonation", {
		method: "DELETE",
		credentials: "include",
		cache: "no-store",
	});

	if (!response.ok && response.status !== 204) {
		const body = await parseJson(response);
		const message = body?.error as string | undefined;
		throw buildError(message ?? "", "Failed to stop impersonation session");
	}
}
