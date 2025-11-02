import type { CallCampaign } from "../../../types/_dashboard/campaign";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "../../data";
import {
        createSeededCallCampaignFaker as buildSeededCallCampaignFaker,
        generateCallCampaignData as buildCallCampaignData,
} from "./internal/callCampaignGenerator";

export {
        CALL_CAMPAIGN_FAKER_SEED,
        createSeededCallCampaignFaker,
        generateCallCampaignData,
} from "./internal/callCampaignGenerator";

const deterministicFallbackCampaigns: CallCampaign[] = (() => {
        const seeded = buildSeededCallCampaignFaker();
        return buildCallCampaignData(seeded);
})();

export const fallbackCallCampaignData = deterministicFallbackCampaigns;

export const mockCallCampaignData: CallCampaign[] | false =
        NEXT_PUBLIC_APP_TESTING_MODE && deterministicFallbackCampaigns;
