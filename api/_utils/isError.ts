// utils/isError.ts
export function isError(error: unknown): error is Error {
	return error instanceof Error;
}
