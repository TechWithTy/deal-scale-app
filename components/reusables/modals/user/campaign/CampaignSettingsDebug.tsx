import React, { useState } from "react";

import {
	type CampaignCreationState,
	useCampaignCreationStore,
} from "@/lib/stores/campaignCreation";
import { formatCurrency } from "@/lib/utils/campaignCostCalculator";
import type { z } from "zod";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

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

	const [copied, setCopied] = useState(false);

	// Generate the full debug text for copying
	const generateDebugText = () => {
		const lines = [
			"===== CAMPAIGN SETTINGS DEBUG LOG =====",
			"",
			"CHANNEL SELECTION:",
			`Primary Channel: ${formatValue(store.primaryChannel)}`,
			`Campaign Name: ${formatValue(store.campaignName)}`,
			`Selected Agent: ${formatValue(store.selectedAgentId)}`,
			"",
			"AREA & LEAD LIST:",
			`Area Mode: ${formatValue(store.areaMode)}`,
			`Lead List ID: ${formatValue(store.selectedLeadListId)}`,
			`Lead List A ID: ${formatValue(store.selectedLeadListAId)}`,
			`Lead List B ID: ${formatValue(store.selectedLeadListBId)}`,
			`A/B Testing: ${formatValue(store.abTestingEnabled)}`,
			`Lead Count: ${formatValue(store.leadCount)}`,
			"",
			"CAMPAIGN AREA:",
			`Include Weekends: ${formatValue(store.includeWeekends)}`,
			"",
			"CHANNEL CUSTOMIZATION:",
			`Phone Number: ${formatValue(formData?.primaryPhoneNumber)}`,
			`Area Mode (Form): ${formatValue(formData?.areaMode)}`,
			`Zip Code: ${formatValue(formData?.zipCode)}`,
			`Selected Lead List (Form): ${formatValue(formData?.selectedLeadListId)}`,
			`Social Platform: ${formatValue(formData?.socialMedia)}`,
			`Direct Mail Type: ${formatValue(formData?.directMailType)}`,
			`Templates: ${formatValue(store.selectedDirectMailTemplates?.length || 0)} selected (requires at least 1)`,
			`Transfer Enabled: ${formatValue(store.transferEnabled)}`,
			`Transfer Type: ${formatValue(store.transferType)}`,
			`Transfer Agent ID: ${formatValue(store.transferAgentId)}`,
			`Transfer Guidelines: ${formatValue(store.transferGuidelines)}`,
			`Transfer Prompt: ${formatValue(store.transferPrompt)}`,
			`Number Pooling: ${formatValue(store.numberPoolingEnabled)}`,
			`Messaging Service SID: ${formatValue(store.messagingServiceSID)}`,
			`Sender Numbers CSV: ${formatValue(store.senderNumbersCSV)}`,
			`Smart Encoding: ${formatValue(store.smartEncodingEnabled)}`,
			`Opt-out Handling: ${formatValue(store.optOutHandlingEnabled)}`,
			`Daily Limit: ${formatValue(store.perNumberDailyLimit)}`,
			`TCPA Source Link: ${formatValue(store.tcpaSourceLink)}`,
			`Skip Name: ${formatValue(store.skipName)}`,
			`Address Verified: ${formatValue(store.addressVerified)}`,
			`Phone Verified: ${formatValue(store.phoneVerified)}`,
			`Email Address: ${formatValue(store.emailAddress)}`,
			`Email Verified: ${formatValue(store.emailVerified)}`,
			`Possible Phones: ${formatValue(store.possiblePhones)}`,
			`Possible Emails: ${formatValue(store.possibleEmails)}`,
			`Possible Handles: ${formatValue(store.possibleHandles)}`,
			"",
			"TEXT MESSAGING:",
			`Text Signature: ${formatValue(store.textSignature)}`,
			`Media Source: ${formatValue(store.smsMediaSource)}`,
			`Can Send Images: ${formatValue(store.smsCanSendImages)}`,
			`Can Send Videos: ${formatValue(store.smsCanSendVideos)}`,
			`Can Send Links: ${formatValue(store.smsCanSendLinks)}`,
			"",
			"TIMING PREFERENCES:",
			`Days Selected: ${formatValue(store.daysSelected?.length || 0)}`,
			`Start Date: ${formatValue(store.scheduleStartDate)}`,
			`End Date: ${formatValue(store.scheduleEndDate)}`,
			`Reach Before Business: ${formatValue(store.reachBeforeBusiness)}`,
			`Reach After Business: ${formatValue(store.reachAfterBusiness)}`,
			`Reach on Weekend: ${formatValue(store.reachOnWeekend)}`,
			`Reach on Holidays: ${formatValue(store.reachOnHolidays)}`,
			`Min Daily Attempts: ${formatValue(store.minDailyAttempts)}`,
			`Max Daily Attempts: ${formatValue(store.maxDailyAttempts)}`,
			`Count Voicemail as Answered: ${formatValue(store.countVoicemailAsAnswered)}`,
			`TCPA Not Opted In: ${formatValue(store.tcpaNotOptedIn)}`,
			`Do Voicemail Drops: ${formatValue(store.doVoicemailDrops)}`,
			`Voice (overrides agent): ${formatValue(store.preferredVoicemailVoiceId)}`,
			`Preferred Voicemail Message: ${formatValue(store.preferredVoicemailMessageId)}`,
			`Get Timezone from Lead: ${formatValue(store.getTimezoneFromLead)}`,
			"",
			"NUMBER POOLING:",
			`Number Pooling Enabled: ${formatValue(store.numberPoolingEnabled)}`,
			`Messaging Service SID: ${formatValue(store.messagingServiceSID)}`,
			`Sender Pool Numbers: ${formatValue(store.selectedSenderNumbers?.length || 0)} selected`,
			`Number Selection Strategy: ${formatValue(store.numberSelectionStrategy)}`,
			`Smart Encoding: ${formatValue(store.smartEncodingEnabled)}`,
			`Opt-out Handling: ${formatValue(store.optOutHandlingEnabled)}`,
			`Per Number Daily Limit: ${formatValue(store.perNumberDailyLimit)}`,
			"",
			"AVAILABLE AGENTS:",
			`Available Agents: ${formatValue(store.availableAgents?.length || 0)} agents`,
			"",
		];

		if (campaignCost) {
			lines.push("CAMPAIGN COST BREAKDOWN:");
			lines.push(`Campaign: ${campaignCost.CampaignName || "N/A"}`);
			lines.push(`Channel: ${campaignCost.Channel || "N/A"}`);
			lines.push(`Lead Count: ${campaignCost.LeadsTargeted || 0}`);
			lines.push(`Total Days: ${campaignCost.TotalDays || 0}`);
			lines.push(`Total Attempts: ${campaignCost.TotalAttempts || 0}`);
			lines.push(`Plan: ${campaignCost.Plan || "N/A"}`);
			lines.push(`Margin: ${campaignCost.Margin || 0}%`);
			lines.push(`Total Cost: ${formatCurrency(campaignCost.TotalCost || 0)}`);
			lines.push(`Billable Credits: ${campaignCost.TotalBillableCredits || 0}`);
			lines.push(`Available Agents: ${campaignCost.AgentsAvailable || 0}`);
		}

		lines.push("");
		lines.push("===== END DEBUG LOG =====");

		return lines.join("\n");
	};

	const handleCopy = async () => {
		try {
			const debugText = generateDebugText();
			await navigator.clipboard.writeText(debugText);
			setCopied(true);
			toast.success("Debug log copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			toast.error("Failed to copy debug log");
			console.error("Copy failed:", err);
		}
	};

	return (
		<div className="mt-8 rounded-lg bg-muted/30 p-4 text-xs">
			<div className="mb-3 flex items-center justify-between">
				<div className="font-semibold text-muted-foreground">
					🔍 Campaign Settings Debug Log
				</div>
				<button
					type="button"
					onClick={handleCopy}
					className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-primary transition-colors hover:bg-primary/20"
					title="Copy debug log to clipboard"
				>
					{copied ? (
						<>
							<Check className="h-3.5 w-3.5" />
							<span>Copied!</span>
						</>
					) : (
						<>
							<Copy className="h-3.5 w-3.5" />
							<span>Copy</span>
						</>
					)}
				</button>
			</div>
			<div className="max-h-48 space-y-2 overflow-y-auto">
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
							{/* Templates quick view: read from form state, friendly labels */}
							{Array.isArray(formData.templates) && (
								<div>
									{(() => {
										const labelMap: Record<string, string> = {
											tpl_basic: "Basic Template",
											tpl_pro: "Professional Template",
											tpl_modern: "Modern Template",
										};
										const required =
											formData.directMailType === "letter_front_back" ||
											formData.directMailType === "snap_pack"
												? 2
												: 1;

										const selected = formData.templates?.length ?? 0;
										return (
											<div className="space-y-1">
												<div>
													Templates: {selected} selected (requires at least{" "}
													{required})
												</div>
												{formData.templates.map((tpl, idx) => (
													<div
														key={`${tpl.templateId}-${idx}`}
														className="ml-3"
													>
														{labelMap[tpl.templateId] || tpl.templateId}
														{tpl.description ? ` — ${tpl.description}` : ""}
													</div>
												))}
											</div>
										);
									})()}
								</div>
							)}
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

				{/* Text Messaging Settings (from store) */}
				<div className="font-medium text-primary">Text Messaging:</div>
				<div className="ml-2 space-y-1">
					<div>Text Signature: {formatValue(store.textSignature)}</div>
					<div>Media Source: {formatValue((store as any).smsMediaSource)}</div>
					<div>Can Send Images: {formatValue(store.smsCanSendImages)}</div>
					<div>Can Send Videos: {formatValue(store.smsCanSendVideos)}</div>
					<div>Can Send Links: {formatValue(store.smsCanSendLinks)}</div>
				</div>

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
						Voice (overrides agent):{" "}
						{formatValue((store as any).preferredVoicemailVoiceId)}
					</div>
					<div>
						Preferred Voicemail Message:{" "}
						{formatValue((store as any).preferredVoicemailMessageId)}
					</div>
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
