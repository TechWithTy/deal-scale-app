import type { FC } from "react";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

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
import type { LeadList } from "@/constants/_faker/_api/mockLeadListApi";
import { fetchFakeLeadLists } from "@/constants/_faker/_api/mockLeadListApi";
import { Loader2 } from "lucide-react";

interface LeadListSelectorProps {
	value: string;
	onChange: (value: string, recordCount: number) => void;
	disabled?: boolean;
}

const LeadListSelector: FC<LeadListSelectorProps> = ({
	value,
	onChange,
	disabled = false,
}) => {
	const { ref, inView } = useInView({
		threshold: 0,
		// * Trigger loading when the user is 200px away from the bottom
		rootMargin: "200px 0px",
	});

	const [items, setItems] = useState<LeadList[]>([]);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);

	const loadMoreLeadLists = useCallback(async () => {
		if (loading || !hasMore) return;
		setLoading(true);
		const nextPage = page + 1;
		const { items: newItems, hasMore: newHasMore } =
			await fetchFakeLeadLists(nextPage);
		setItems((prev) => [...prev, ...newItems]);
		setPage(nextPage);
		setHasMore(newHasMore);
		setLoading(false);
	}, [loading, hasMore, page]);

	useEffect(() => {
		// * Initial load
		const init = async () => {
			setLoading(true);
			const { items: newItems, hasMore: newHasMore } =
				await fetchFakeLeadLists(0);
			setItems(newItems);
			setPage(0);
			setHasMore(newHasMore);
			setLoading(false);
		};
		init();
	}, []);

	useEffect(() => {
		if (inView && hasMore) {
			loadMoreLeadLists();
		}
	}, [inView, hasMore, loadMoreLeadLists]);

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
					{hasMore && (
						<div ref={ref} className="flex items-center justify-center p-2">
							<Loader2 className="h-4 w-4 animate-spin" />
						</div>
					)}
				</SelectContent>
			</Select>
			<FormMessage />
		</FormItem>
	);
};

export default LeadListSelector;
