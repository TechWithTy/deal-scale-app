// Minimal shim for '@auth/core' to unblock builds when the package
// is not installed in the current environment.
// This does not implement actual auth logic.
export async function Auth(..._args: any[]): Promise<any> {
  return {};
}

export async function customFetch(..._args: any[]): Promise<any> {
  return {};
}

export function createActionURL(..._args: any[]): URL {
  return new URL('http://localhost/');
}

export const errors = {} as Record<string, unknown>;

export default {
  Auth,
  customFetch,
  createActionURL,
  errors,
} as unknown as Record<string, unknown>;
