import React, { act } from "react";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Globe } from "@/components/ui/globe";

const destroySpy = vi.fn();

vi.mock("cobe", () => ({
	__esModule: true,
	default: vi.fn(() => ({
		destroy: destroySpy,
	})),
}));

describe("Globe deferred opacity initialization", () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("does not throw if unmounted before deferred canvas opacity runs", () => {
		vi.useFakeTimers();

		const { unmount } = render(<Globe />);

		unmount();

		expect(() => {
			act(() => {
				vi.runAllTimers();
			});
		}).not.toThrow();
	});
});


