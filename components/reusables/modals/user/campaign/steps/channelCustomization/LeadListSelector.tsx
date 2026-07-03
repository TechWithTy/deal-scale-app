import {
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { LEAD_LISTS_MOCK } from "@/constants/dashboard/leadLists.mock";
import { usePublicApiLeadLists } from "@/hooks/usePublicApiLeadLists";
import { useSession } from "next-auth/react";
import { type FC, useMemo } from "react";

interface LeadListSelectorProps {
	value: string;
	onChange: (value: string, recordCount: number) => void;
	disabled?: boolean;
}

type LeadListOption = {
	id: string;
	listName: string;
	records: number;
};

const LeadListSelector: FC<LeadListSelectorProps> = ({
	value,
	onChange,
	disabled = false,
}) => {
	const { data: session } = useSession();
	const publicApiLeadLists = usePublicApiLeadLists(
		session?.publicApi?.accessToken,
	);
	const items = useMemo<LeadListOption[]>(() => {
		const publicLists = (publicApiLeadLists.rows ?? []).map((list) => ({
			id: list.id,
			listName: list.list,
			records: list.records,
		}));
		const seen = new Set(publicLists.map((list) => list.id));
		const fallbackLists = LEAD_LISTS_MOCK.filter(
			(list) => !seen.has(list.id),
		).map((list) => ({
			id: list.id,
			listName: list.name,
			records: 0,
		}));
		return [...publicLists, ...fallbackLists];
	}, [publicApiLeadLists.rows]);

	const handleValueChange = (selectedValue: string) => {
		const selectedItem = items.find((item) => item.id === selectedValue);
		if (selectedItem) {
			onChange(selectedValue, selectedItem.records);
		}
	};

	return (
		<FormItem>
			<FormLabel>Select Lead List</FormLabel>
			<Select
				disabled={disabled}
				onValueChange={handleValueChange}
				value={value}
			>
				<FormControl>
					<SelectTrigger>
						<SelectValue placeholder="-- Select a lead list --" />
					</SelectTrigger>
				</FormControl>
				<SelectContent
					position="popper"
					side="bottom"
					avoidCollisions={false}
					className="max-h-56 overflow-y-auto"
				>
					{items.map((list) => (
						<SelectItem key={list.id} value={list.id}>
							{list.listName}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<FormMessage />
		</FormItem>
	);
};

export default LeadListSelector;
