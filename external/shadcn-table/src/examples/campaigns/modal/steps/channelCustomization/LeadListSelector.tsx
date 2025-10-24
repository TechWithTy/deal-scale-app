import type { FC } from "react";
import { useMemo } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "../../../../../components/ui/form";
import { useLeadListStore } from "../../../../../lib/stores/leadList";
import { useCampaignCreationStore } from "../../../../../lib/stores/campaignCreation";
import { LEAD_LISTS_MOCK } from "../../../../../constants/leadLists.mock";

interface LeadListSelectorProps {
	value: string;
	onChange: (value: string, recordCount: number) => void;
	disabled?: boolean;
	abTestingEnabled?: boolean;
	valueB?: string;
	onChangeB?: (value: string, recordCount: number) => void;
}

const LeadListSelector: FC<LeadListSelectorProps> = ({
        value,
        onChange,
        disabled = false,
        abTestingEnabled = false,
        valueB = "",
        onChangeB,
}) => {
        const leadLists = useLeadListStore((state) => state.leadLists);
        const currentLeadCount = useCampaignCreationStore((state) => state.leadCount);

	const storeItems = useMemo(
		() =>
			leadLists.map((list) => ({
				id: list.id,
				listName: list.listName ?? "Lead List",
				records:
					list.records ??
					(Array.isArray(list.leads) ? list.leads.length : 0),
			})),
		[leadLists],
	);

	const baseItems = useMemo(() => {
		if (storeItems.length > 0) return storeItems;
		return LEAD_LISTS_MOCK.map((mock) => ({
			id: mock.id,
			listName: mock.name,
			records: 0,
		}));
	}, [storeItems]);

	const options = useMemo(() => {
		const map = new Map<string, { id: string; listName: string; records: number }>();
		for (const item of baseItems) {
			map.set(item.id, item);
		}
                if (value && !map.has(value)) {
                        map.set(value, {
                                id: value,
                                listName: "Selected Lead List",
                                records: currentLeadCount ?? 0,
                        });
                }
                if (abTestingEnabled && valueB && !map.has(valueB)) {
                        map.set(valueB, {
                                id: valueB,
                                listName: "Selected Lead List",
                                records: currentLeadCount ?? 0,
                        });
                }
                return Array.from(map.values());
        }, [baseItems, value, valueB, abTestingEnabled, currentLeadCount]);

        const handleValueChange = (selectedValue: string) => {
                const selectedItem = options.find((item) => item.id === selectedValue);
                onChange(selectedValue, selectedItem?.records ?? currentLeadCount ?? 0);
        };

        const handleValueChangeB = (selectedValue: string) => {
                if (!onChangeB) return;
                const selectedItem = options.find((item) => item.id === selectedValue);
                onChangeB(selectedValue, selectedItem?.records ?? currentLeadCount ?? 0);
        };

	return (
		<FormItem>
			<FormLabel>
				{abTestingEnabled ? "Select Lead List A" : "Select Lead List"}
			</FormLabel>
			<Select
				disabled={disabled || options.length === 0}
				onValueChange={handleValueChange}
				value={value}
				defaultValue={value}
			>
				<FormControl>
					<SelectTrigger>
						<SelectValue placeholder="-- Select a lead list --" />
					</SelectTrigger>
				</FormControl>
				<SelectContent
					position="popper"
					side="bottom"
					sideOffset={4}
					avoidCollisions={false}
					className="max-h-72 overflow-y-auto overscroll-contain"
					onWheel={(e) => e.stopPropagation()}
				>
					{options.map((list) => (
						<SelectItem key={list.id} value={list.id}>
							{list.listName}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{abTestingEnabled && (
				<div className="mt-4">
					<FormLabel>Select Lead List B</FormLabel>
					<Select
						disabled={disabled || options.length === 0}
						onValueChange={handleValueChangeB}
						value={valueB}
						defaultValue={valueB}
					>
						<FormControl>
							<SelectTrigger>
								<SelectValue placeholder="-- Select a second lead list --" />
							</SelectTrigger>
						</FormControl>
						<SelectContent
							position="popper"
							side="bottom"
							sideOffset={4}
							avoidCollisions={false}
							className="max-h-72 overflow-y-auto overscroll-contain"
							onWheel={(e) => e.stopPropagation()}
						>
							{options.map((list) => (
								<SelectItem key={list.id} value={list.id}>
									{list.listName}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}
			<FormMessage />
			{abTestingEnabled && (!value || !valueB) ? (
				<div className="mt-2 text-destructive text-xs">
					A/B testing requires two lead lists.
				</div>
			) : null}
			{options.length === 0 && !disabled ? (
				<p className="mt-2 text-muted-foreground text-xs">
					No lead lists available yet. Create a list to enable this step.
				</p>
			) : null}
		</FormItem>
	);
};

export default LeadListSelector;
