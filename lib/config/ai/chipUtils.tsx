/**
 * Chip Definition Utility Functions
 * Helper functions for working with chip definitions
 */

import type { ChipDefinition } from "@/components/reusables/ai/InlineChipEditor";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { FileText, Phone, MessageSquare, Mail } from "lucide-react";

/**
 * Get sales scripts as chip definitions from the campaign store
 */
export function getSalesScriptsChips(): ChipDefinition[] {
	try {
		const state = useCampaignCreationStore.getState();
		const salesScripts = state?.availableSalesScripts || [];

		if (!Array.isArray(salesScripts) || salesScripts.length === 0) {
			return [];
		}

		return salesScripts.map((script: any) => {
			let icon = <FileText className="h-3 w-3" />;

			if (script.type === "call") {
				icon = <Phone className="h-3 w-3" />;
			} else if (script.type === "sms") {
				icon = <MessageSquare className="h-3 w-3" />;
			} else if (script.type === "email") {
				icon = <Mail className="h-3 w-3" />;
			}

			return {
				key: script.value || script.id || `script-${script.label}`,
				label: script.label || "Script",
				description:
					script.description || `${script.type || "messaging"} script template`,
				type: "script" as const,
				icon,
			};
		});
	} catch (error) {
		console.warn("Failed to load sales scripts:", error);
		return [];
	}
}

/**
 * Merge custom chips with base chips, avoiding duplicates by key
 */
export function mergeCustomChips(
	base: ChipDefinition[],
	custom: ChipDefinition[],
): ChipDefinition[] {
	const baseKeys = new Set(base.map((chip) => chip.key));
	const uniqueCustom = custom.filter((chip) => !baseKeys.has(chip.key));
	return [...base, ...uniqueCustom];
}

/**
 * Filter chips by type(s)
 */
export function filterChipsByType(
	chips: ChipDefinition[],
	types: Array<ChipDefinition["type"]>,
): ChipDefinition[] {
	return chips.filter((chip) => types.includes(chip.type));
}

/**
 * Sort chips alphabetically by label
 */
export function sortChipsByLabel(chips: ChipDefinition[]): ChipDefinition[] {
	return [...chips].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Get chips by keys
 */
export function getChipsByKeys(
	chips: ChipDefinition[],
	keys: string[],
): ChipDefinition[] {
	return keys
		.map((key) => chips.find((chip) => chip.key === key))
		.filter((chip): chip is ChipDefinition => chip !== undefined);
}
