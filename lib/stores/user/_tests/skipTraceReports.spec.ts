import { describe, expect, it } from "vitest";
import { useSkipTraceReportsStore } from "../userProfile";

describe("Skip Trace reports summaries", () => {
	it("have progress and headers summaries", () => {
		const s = useSkipTraceReportsStore.getState();
		const progress = s.progress();
		expect(progress).toHaveProperty("step");
		expect(progress).toHaveProperty("stepPercent");

		const headers = s.headers();
		expect(headers).toHaveProperty("parsedCount");
		expect(headers).toHaveProperty("selectedCount");
	});
});
