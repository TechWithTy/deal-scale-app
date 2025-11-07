import { expect, test } from "@playwright/test";
import { useSkipTraceReportsStore } from "../userProfile";

test("Skip Trace reports have progress and headers summaries", () => {
	const s = useSkipTraceReportsStore.getState();
	const progress = s.progress();
	expect(progress).toHaveProperty("step");
	expect(progress).toHaveProperty("stepPercent");

	const headers = s.headers();
	expect(headers).toHaveProperty("parsedCount");
	expect(headers).toHaveProperty("selectedCount");
});
