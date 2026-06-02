export { cn } from "../_utils";

export const safeWindow =
	typeof window !== "undefined" ? window : (undefined as Window | undefined);
