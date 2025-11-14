// Minimal shim for '@auth/core' to unblock builds when the package
// is not installed in the current environment.
// This does not implement actual auth logic.
export const errors = {};
export default {} as unknown as Record<string, unknown>;

