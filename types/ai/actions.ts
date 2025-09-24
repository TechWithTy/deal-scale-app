export type AIActionCategory = "chat" | "leads" | "campaigns" | "company" | "system";

export interface AIAction {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  category: AIActionCategory;
}
