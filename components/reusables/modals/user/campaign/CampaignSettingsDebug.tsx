import React from "react";

import {
	useCampaignCreationStore,
	type CampaignCreationState,
} from "@/lib/stores/campaignCreation";
import { formatCurrency } from "@/lib/utils/campaignCostCalculator";
import type { z } from "zod";

interface CampaignCostResult {
	CampaignName: string;
	Channel: string;
	LeadsTargeted: number;
	TotalDays: number;
	TotalAttempts: number;
	CallCost: number;
	SmsCost: number;
	SocialCost: number;
	DirectMailCost: number;
	TotalCost: number;
	AgentsAvailable: number;
	Plan: string;
	TotalBillableCredits: number;
	Margin: number;
}

interface CampaignSettingsDebugProps {
	formData?: {
		primaryPhoneNumber?: string;
		areaMode?: "zip" | "leadList";
		zipCode?: string;
		selectedLeadListId?: string;
		socialPlatform?: "facebook" | "linkedin";
		directMailType?:
			| "postcard"
			| "letter_front"
			| "letter_front_back"
			| "snap_pack";
		templates?: Array<{ templateId: string; description?: string }>;
		transferEnabled?: boolean;
		transferType?:
			| "inbound_call"
			| "outbound_call"
			| "social"
			| "text"
			| "chat_live_person"
			| "appraisal"
			| "live_avatar";
		transferAgentId?: string;
		transferGuidelines?: string;
		transferPrompt?: string;
		numberPoolingEnabled?: boolean;
		messagingServiceSid?: string;
		senderPoolNumbersCsv?: string;
		smartEncodingEnabled?: boolean;
		optOutHandlingEnabled?: boolean;
		perNumberDailyLimit?: number;
		tcpaSourceLink?: string;
		skipName?: boolean;
		addressVerified?: boolean;
		phoneVerified?: boolean;
		emailAddress?: string;
		emailVerified?: boolean;
		possiblePhones?: string;
		possibleEmails?: string;
		possibleHandles?: string;
	};
	storeSnapshot?: CampaignCreationState;
	campaignCost?: CampaignCostResult;
}

export default function CampaignSettingsDebug({
	formData,
	storeSnapshot,
	campaignCost,
}: CampaignSettingsDebugProps) {
	const liveStore = useCampaignCreationStore();
	const store = storeSnapshot ?? liveStore;

	// Helper function to format values for display
	const formatValue = (value: any): string => {
		if (value === null || value === undefined) return "Not set";
		if (typeof value === "boolean") return value ? "Yes" : "No";
		if (typeof value === "object") {
			if (value instanceof Date) return value.toLocaleDateString();
			if (Array.isArray(value)) return `${value.length} items`;
			return JSON.stringify(value);
		}
		return String(value);
	};

	// Helper function to format key names for display
	const formatKey = (key: string): string => {
		return key
			.replace(/([A-Z])/g, " $1")
			.replace(/^./, (str) => str.toUpperCase())
			.trim();
	};

	return (
		<div className="mt-8 rounded-lg bg-muted/30 p-4 text-xs">
			<div className="mb-3 font-semibold text-muted-foreground">
				🔍 Campaign Settings Debug Log
			</div>
			<div className="space-y-2 max-h-48 overflow-y-auto">
				{/* Channel Selection */}
				<div className="font-medium text-primary">Channel Selection:</div>
				<div className="ml-2 space-y-1">
					<div>Primary Channel: {formatValue(store.primaryChannel)}</div>
					<div>Campaign Name: {formatValue(store.campaignName)}</div>
					<div>Selected Agent: {formatValue(store.selectedAgentId)}</div>
				</div>

				{/* Area & Lead List */}
				<div className="font-medium text-primary">Area & Lead List:</div>
				<div className="ml-2 space-y-1">
					<div>Area Mode: {formatValue(store.areaMode)}</div>
					<div>Lead List ID: {formatValue(store.selectedLeadListId)}</div>
					<div>Lead List A ID: {formatValue(store.selectedLeadListAId)}</div>
					<div>Lead List B ID: {formatValue(store.selectedLeadListBId)}</div>
					<div>A/B Testing: {formatValue(store.abTestingEnabled)}</div>
					<div>Lead Count: {formatValue(store.leadCount)}</div>
					<div>Campaign Area: {formatValue(store.campaignArea)}</div>
					<div>Include Weekends: {formatValue(store.includeWeekends)}</div>
				</div>

				{/* Channel Customization Form Data */}
				{formData && (
					<>
						<div className="font-medium text-primary">
							Channel Customization:
						</div>
						<div className="ml-2 space-y-1">
							<div>
								Phone Number: {formatValue(formData.primaryPhoneNumber)}
							</div>
							<div>Area Mode (Form): {formatValue(formData.areaMode)}</div>
							<div>Zip Code: {formatValue(formData.zipCode)}</div>
							<div>
								Selected Lead List (Form):{" "}
								{formatValue(formData.selectedLeadListId)}
							</div>
							<div>Social Platform: {formatValue(formData.socialPlatform)}</div>
							<div>
								Direct Mail Type: {formatValue(formData.directMailType)}
							</div>
							<div>Templates: {formatValue(formData.templates)}</div>
							<div>
								Transfer Enabled: {formatValue(formData.transferEnabled)}
							</div>
							<div>Transfer Type: {formatValue(formData.transferType)}</div>
							<div>
								Transfer Agent ID: {formatValue(formData.transferAgentId)}
							</div>
							<div>
								Transfer Guidelines: {formatValue(formData.transferGuidelines)}
							</div>
							<div>Transfer Prompt: {formatValue(formData.transferPrompt)}</div>
							<div>
								Number Pooling: {formatValue(formData.numberPoolingEnabled)}
							</div>
							<div>
								Messaging Service SID:{" "}
								{formatValue(formData.messagingServiceSid)}
							</div>
							<div>
								Sender Numbers CSV: {formatValue(formData.senderPoolNumbersCsv)}
							</div>
							<div>
								Smart Encoding: {formatValue(formData.smartEncodingEnabled)}
							</div>
							<div>
								Opt-out Handling: {formatValue(formData.optOutHandlingEnabled)}
							</div>
							<div>
								Daily Limit: {formatValue(formData.perNumberDailyLimit)}
							</div>
							{/* New fields */}
							<div>
								TCPA Source Link: {formatValue(formData.tcpaSourceLink)}
							</div>
							<div>Skip Name: {formatValue(formData.skipName)}</div>
							<div>
								Address Verified: {formatValue(formData.addressVerified)}
							</div>
							<div>Phone Verified: {formatValue(formData.phoneVerified)}</div>
							<div>Email Address: {formatValue(formData.emailAddress)}</div>
							<div>Email Verified: {formatValue(formData.emailVerified)}</div>
							<div>Possible Phones: {formatValue(formData.possiblePhones)}</div>
							<div>Possible Emails: {formatValue(formData.possibleEmails)}</div>
							<div>
								Possible Handles: {formatValue(formData.possibleHandles)}
							</div>
						</div>
					</>
				)}

				{/* Timing Preferences */}
				<div className="font-medium text-primary">Timing Preferences:</div>
				<div className="ml-2 space-y-1">
					<div>Days Selected: {formatValue(store.daysSelected)}</div>
					<div>Start Date: {formatValue(store.startDate)}</div>
					<div>End Date: {formatValue(store.endDate)}</div>
					<div>
						Reach Before Business: {formatValue(store.reachBeforeBusiness)}
					</div>
					<div>
						Reach After Business: {formatValue(store.reachAfterBusiness)}
					</div>
					<div>Reach on Weekend: {formatValue(store.reachOnWeekend)}</div>
					<div>Reach on Holidays: {formatValue(store.reachOnHolidays)}</div>
					<div>Min Daily Attempts: {formatValue(store.minDailyAttempts)}</div>
					<div>Max Daily Attempts: {formatValue(store.maxDailyAttempts)}</div>
					<div>
						Count Voicemail as Answered:{" "}
						{formatValue(store.countVoicemailAsAnswered)}
					</div>
					<div>TCPA Not Opted In: {formatValue(store.tcpaNotOptedIn)}</div>
					<div>Do Voicemail Drops: {formatValue(store.doVoicemailDrops)}</div>
					<div>
						Get Timezone from Lead:{" "}
						{formatValue(store.getTimezoneFromLeadLocation)}
					</div>
				</div>

				{/* Number Pooling */}
				<div className="font-medium text-primary">Number Pooling:</div>
				<div className="ml-2 space-y-1">
					<div>
						Number Pooling Enabled: {formatValue(store.numberPoolingEnabled)}
					</div>
					<div>
						Messaging Service SID: {formatValue(store.messagingServiceSid)}
					</div>
					<div>
						Sender Pool Numbers:{" "}
						{formatValue(store.selectedSenderNumbers.length)} selected
					</div>
					<div>
						Number Selection Strategy:{" "}
						{formatValue(store.numberSelectionStrategy)}
					</div>
					<div>Smart Encoding: {formatValue(store.smartEncodingEnabled)}</div>
					<div>
						Opt-out Handling: {formatValue(store.optOutHandlingEnabled)}
					</div>
					<div>
						Per Number Daily Limit: {formatValue(store.perNumberDailyLimit)}
					</div>
				</div>

				{/* Agent Selection */}
				<div className="font-medium text-primary">Available Agents:</div>
				<div className="ml-2 space-y-1">
					<div>
						Available Agents: {formatValue(store.availableAgents.length)} agents
					</div>
				</div>

				{/* Campaign Cost Calculator */}
				{campaignCost && (
					<>
						<div className="font-medium text-primary">
							Campaign Cost Breakdown:
						</div>
						<div className="ml-2 space-y-1">
							<div>Campaign: {campaignCost.CampaignName}</div>
							<div>Channel: {campaignCost.Channel}</div>
							<div>
								Lead Count: {campaignCost.LeadsTargeted.toLocaleString()}
							</div>
							<div>Total Days: {campaignCost.TotalDays}</div>
							<div>
								Total Attempts: {campaignCost.TotalAttempts.toLocaleString()}
							</div>
							<div>Plan: {campaignCost.Plan}</div>
							<div>Margin: {(campaignCost.Margin * 100).toFixed(1)}%</div>
							{campaignCost.CallCost > 0 && (
								<div>Call Cost: {formatCurrency(campaignCost.CallCost)}</div>
							)}
							{campaignCost.SmsCost > 0 && (
								<div>SMS Cost: {formatCurrency(campaignCost.SmsCost)}</div>
							)}
							{campaignCost.SocialCost > 0 && (
								<div>
									Social Cost: {formatCurrency(campaignCost.SocialCost)}
								</div>
							)}
							{campaignCost.DirectMailCost > 0 && (
								<div>
									Direct Mail Cost:{" "}
									{formatCurrency(campaignCost.DirectMailCost)}
								</div>
							)}
							<div className="font-semibold text-green-600">
								Total Cost: {formatCurrency(campaignCost.TotalCost)}
							</div>
							<div className="font-semibold text-blue-600">
								Billable Credits:{" "}
								{campaignCost.TotalBillableCredits.toLocaleString()}
							</div>
							<div>Available Agents: {campaignCost.AgentsAvailable}</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
