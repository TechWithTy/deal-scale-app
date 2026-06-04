import { afterEach, describe, expect, it } from "vitest";

import { mockTasks } from "@/external/kanban/utils/mocks";
import { useKanbanView } from "@/external/kanban/utils/viewStore";

afterEach(() => {
	useKanbanView.getState().resetView();
});

describe("useKanbanView scope filtering", () => {
	it("filters tasks to a single lead", () => {
		const leadId = mockTasks.find((task) => task.leadId)?.leadId;
		expect(leadId).toBeTruthy();

		useKanbanView.getState().setScope({ mode: "lead", value: String(leadId) });

		const visible = useKanbanView.getState().deriveVisibleTasks(mockTasks);
		expect(visible.length).toBeGreaterThan(0);
		expect(visible.every((task) => String(task.leadId ?? "") === leadId)).toBe(
			true,
		);
	});

	it("filters tasks to a single lead list", () => {
		const leadListId = mockTasks.find((task) => task.leadListId)?.leadListId;
		expect(leadListId).toBeTruthy();

		useKanbanView.getState().setScope({
			mode: "leadList",
			value: String(leadListId),
		});

		const visible = useKanbanView.getState().deriveVisibleTasks(mockTasks);
		expect(visible.length).toBeGreaterThan(0);
		expect(
			visible.every((task) => String(task.leadListId ?? "") === String(leadListId)),
		).toBe(true);
	});
});
