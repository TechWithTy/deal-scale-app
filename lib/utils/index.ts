export { cn } from "../_utils";

export function safeWindow(): Window | undefined {
	return typeof window !== "undefined" ? window : undefined;
}
