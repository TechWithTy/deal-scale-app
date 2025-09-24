import { beforeEach, afterEach, vi } from "vitest";

// Reset browser-like storage and timers between tests
beforeEach(() => {
	try {
		localStorage.clear();
	} catch {}
	try {
		sessionStorage.clear();
	} catch {}
	vi.clearAllMocks();
});

afterEach(() => {
	vi.useRealTimers();
});
