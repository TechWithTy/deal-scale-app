/* eslint-disable import/no-duplicates */
import { beforeEach, describe, expect, it, vi } from "vitest";

const useRegisterSWMock = vi.fn();

vi.mock("virtual:pwa-register/react", () => ({
	useRegisterSW: (options: unknown) => {
		useRegisterSWMock(options);
		return {
			needRefresh: false,
			offlineReady: false,
			updateServiceWorker: vi.fn(),
		};
	},
}));

describe("PWA registration integration", () => {
	beforeEach(() => {
		vi.resetModules();
		useRegisterSWMock.mockClear();
		document.body.innerHTML = '<div id="root"></div>';
	});

	it("invokes the registration hook with prompt handlers", async () => {
		await import("../../../src/main");

		expect(useRegisterSWMock).toHaveBeenCalledTimes(1);

		const [options] = useRegisterSWMock.mock.calls[0] ?? [{}];

		expect(options).toMatchObject({ immediate: false });
	});
});

