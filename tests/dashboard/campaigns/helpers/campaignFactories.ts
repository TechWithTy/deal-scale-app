import type { Row } from "@tanstack/react-table";

import type { CallCampaign } from "@/types/_dashboard/campaign";

export const buildCallCampaignRow = (
        rowId: string,
        campaignId: string,
): Row<CallCampaign> => {
        const campaign: CallCampaign = {
                id: campaignId,
                name: campaignId,
                status: "queued",
                startDate: new Date().toISOString(),
                callInformation: [],
                callerNumber: "+1-555-000-0000",
                receiverNumber: "+1-555-000-0001",
                duration: 0,
                callType: "inbound",
                calls: 0,
                inQueue: 0,
                leads: 0,
                voicemail: 0,
                hungUp: 0,
                dead: 0,
                wrongNumber: 0,
                inactiveNumbers: 0,
                dnc: 0,
                endedReason: [],
        };

        return {
                id: rowId,
                index: Number(rowId.replace("row-", "")),
                original: campaign,
        } as unknown as Row<CallCampaign>;
};

export const createLaunchCampaign = (campaignId: string): CallCampaign =>
        buildCallCampaignRow("row-launch", campaignId).original;
