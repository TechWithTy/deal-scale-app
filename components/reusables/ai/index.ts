/**
 * AI Components - Reusable AI prompt and chip components
 */

export { AIPromptGenerator } from "./AIPromptGenerator";
export type {
	AIPromptField,
	AIPromptGeneratorProps,
} from "./AIPromptGenerator";

export { CampaignPromptGenerator } from "./CampaignPromptGenerator";

// Export campaign-specific version from modals
export { AICampaignPromptGenerator } from "../modals/user/campaign/AICampaignPromptGenerator";

export { ChipTextarea } from "./ChipTextarea";
export type { ChipItem } from "./ChipTextarea";

export { InlineChipEditor } from "./InlineChipEditor";
export type { ChipDefinition, ChipType } from "./InlineChipEditor";

export { InsertableChips } from "./InsertableChips";
export type { InsertableChip } from "./InsertableChips";

export { QuickActionTemplates } from "./QuickActionTemplates";
export type { QuickActionTemplate } from "./QuickActionTemplates";

export { QuickActionButton } from "./QuickActionButton";

export { AIChatButton } from "./AIChatButton";

export { CompactFileUpload } from "./CompactFileUpload";

export { PromptTemplatesButton } from "./PromptTemplatesButton";

export { PromptFlowchartPreview } from "./PromptFlowchartPreview";

export {
	VoiceInputButton,
	VoiceInputButtonCompact,
	VoiceInputButtonFull,
} from "./VoiceInputButton";
export type {
	VoiceInputButtonProps,
	VoiceInputState,
} from "./VoiceInputButton";

export { VoiceInputPopover } from "./VoiceInputPopover";
export type { VoiceInputPopoverProps } from "./VoiceInputPopover";
