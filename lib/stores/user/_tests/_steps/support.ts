import { Before, After, AfterStep } from "@cucumber/cucumber";
import "./index";

class MemoryStorage {
	private store = new Map<string, string>();
	get length() {
		return this.store.size;
	}
	clear() {
		this.store.clear();
	}
	getItem(key: string) {
		return this.store.has(key) ? this.store.get(key)! : null;
	}
	key(index: number) {
		return Array.from(this.store.keys())[index] ?? null;
	}
	removeItem(key: string) {
		this.store.delete(key);
	}
	setItem(key: string, value: string) {
		this.store.set(String(key), String(value));
	}
}

Before(() => {
	// Minimal browser-like globals for stores using persist/localStorage
	if (!(globalThis as any).localStorage)
		(globalThis as any).localStorage = new MemoryStorage();
	if (!(globalThis as any).sessionStorage)
		(globalThis as any).sessionStorage = new MemoryStorage();
	if (!(globalThis as any).window)
		(globalThis as any).window = globalThis as any;
	if (!(globalThis as any).navigator)
		(globalThis as any).navigator = { userAgent: "node" } as any;
});

After(() => {
	try {
		(globalThis as any).localStorage?.clear?.();
	} catch {}
	try {
		(globalThis as any).sessionStorage?.clear?.();
	} catch {}
});

AfterStep(function (this: any, p) {
	// Normalize status to lowercase for mapping regardless of enum/string case
	const status = String(p.result?.status ?? "unknown").toLowerCase();
	const emojiMap: Record<string, string> = {
		passed: "✅",
		failed: "❌",
		skipped: "⏭️",
		undefined: "❓",
		pending: "⏳",
		unknown: "❔",
	};
	const emoji = emojiMap[status] ?? "❔";
	// Derive the current step text from the pickle using the hook index
	const idx = (p as any).index ?? 0;
	const text = (p as any).pickle?.steps?.[idx]?.text ?? "(unknown step)";
	console.log(`${emoji} ${text} (${status})`);
});
