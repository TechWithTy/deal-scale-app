import { describe, expect, it } from "vitest";

import { DEFAULT_CUSTOMIZATION_VALUES } from "@/external/shadcn-table/src/examples/campaigns/modal/CampaignModalMain";
import { TransferConditionalSchema } from "@/external/shadcn-table/src/examples/campaigns/modal/steps/ChannelCustomizationStep";

describe("CampaignModalMain default values", () => {
	it("stay compatible with the customization schema when required fields are provided", () => {
		const hydratedValues = {
			...DEFAULT_CUSTOMIZATION_VALUES,
			selectedLeadListId: "lead_123",
			transferAgentId: "agent_456",
			transferGuidelines: "Always be helpful.",
			transferPrompt: "Warm transfer with context.",
		};

		const result = TransferConditionalSchema.safeParse(hydratedValues);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.areaMode).toBe("leadList");
			expect(result.data.transferEnabled).toBe(true);
		}
	});
});
