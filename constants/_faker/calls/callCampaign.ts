import { Faker, base, en, generateMersenne53Randomizer } from "@faker-js/faker";

import { NEXT_PUBLIC_APP_TESTING_MODE } from "../../data";
import {
        CALL_CAMPAIGN_FAKER_SEED,
        generateCallCampaignData,
} from "./internal/callCampaignGenerator";

const deterministicFallbackCampaigns = (() => {
        const seeded = new Faker({
                locale: [en, base],
                randomizer: generateMersenne53Randomizer(),
        });
        seeded.seed(CALL_CAMPAIGN_FAKER_SEED);
        return generateCallCampaignData(seeded);
})();

export { generateCallCampaignData };

export const fallbackCallCampaignData = deterministicFallbackCampaigns;

export const mockCallCampaignData =
        NEXT_PUBLIC_APP_TESTING_MODE && deterministicFallbackCampaigns;
