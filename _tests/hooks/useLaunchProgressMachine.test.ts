import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useLaunchProgressMachine } from "@/hooks/useLaunchProgressMachine";

describe("useLaunchProgressMachine", () => {
	it("progresses through launch phases and resolves", async () => {
		vi.useFakeTimers();

		const { result } = renderHook(() =>
			useLaunchProgressMachine({
				durations: { configuring: 10, branding: 10, training: 10 },
			}),
		);

		let resolveCount = 0;
		let startPromise: Promise<boolean> | undefined;
		let successFlag = false;

		await act(async () => {
			startPromise = result.current.start(async () => {
				resolveCount += 1;
			});
		});

		expect(result.current.open).toBe(true);
		expect(result.current.status).toBe("configuring");

		await act(async () => {
			vi.advanceTimersByTime(10);
		});
		expect(result.current.status).toBe("branding");

		await act(async () => {
			vi.advanceTimersByTime(10);
		});
		expect(result.current.status).toBe("training");

		await act(async () => {
			vi.advanceTimersByTime(10);
			successFlag = await startPromise!;
		});

		expect(result.current.status).toBe("done");
		expect(resolveCount).toBe(1);
		expect(successFlag).toBe(true);

		vi.useRealTimers();
	});

	it("captures launch errors and sets error status", async () => {
		const { result } = renderHook(() =>
			useLaunchProgressMachine({
				durations: { configuring: 1, branding: 1, training: 1 },
			}),
		);

		let success = true;
		await act(async () => {
			success = await result.current.start(async () => {
				throw new Error("launch-failed");
			});
		});

		expect(success).toBe(false);
		expect(result.current.status).toBe("error");

		act(() => {
			result.current.reset();
		});
		expect(result.current.status).toBe("idle");
		expect(result.current.open).toBe(false);
	});
});

