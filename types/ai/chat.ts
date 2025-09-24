export type AIChatRole = "user" | "assistant" | "system";

export interface AIChatMessage {
  id: string;
  role: AIChatRole;
  content: string;
  createdAt: string; // ISO
  attachments?: string[];
}

export interface AIChatThread {
  id: string;
  title: string;
  messages: AIChatMessage[];
  relatedLeadId?: string;
  relatedCampaignId?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
