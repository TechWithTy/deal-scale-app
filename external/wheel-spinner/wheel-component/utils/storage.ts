export function safeGet(key: string): string | null {
	try {
		return typeof window === "undefined"
			? null
			: window.localStorage.getItem(key);
	} catch {
		return null;
	}
}

export function safeSet(key: string, value: string): void {
	try {
		if (typeof window !== "undefined") window.localStorage.setItem(key, value);
	} catch {
		// ignore
	}
}
