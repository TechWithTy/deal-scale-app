import type React from "react";

export interface DrawerItemDisplay {
	title: string;
	subtitle?: string;
	mediaUrl?: string;
	mediaUrls?: string[]; // optional carousel images
}

export interface DrawerItem {
	id: string;
	display: DrawerItemDisplay;
	details?: Record<string, string | number | null | undefined>;
}

export interface LoadMoreArgs {
	pageSize: number;
	cursor?: string | null;
}

export interface LoadMoreResult {
	items: DrawerItem[];
	hasMore: boolean;
	cursor?: string | null;
}

export interface ListService {
	getListNames: () => Promise<string[]>;
	createList: (
		name: string,
		items: DrawerItem[],
	) => Promise<{ listId: string }>;
	addToList: (listId: string, items: DrawerItem[]) => Promise<void>;
	loadMore: (args: LoadMoreArgs) => Promise<LoadMoreResult>;
}

export interface DrawerFlowProps {
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	listService: ListService;
	loadMore: (args: LoadMoreArgs) => Promise<LoadMoreResult>;
	items?: DrawerItem[];
	defaultPageSize?: number;
	pageSizeOptions?: number[];
	initialSelectedIds?: string[];
	onSelectionChange?: (ids: string[]) => void;
	renderItem?: (
		item: DrawerItem,
		selected: boolean,
		toggle: () => void,
	) => React.ReactNode;
	listSizeCalc?: (items: DrawerItem[]) => { label: string; progress: number };
}

export interface ModalState {
	open: boolean;
	mode: "create" | "add";
	pending: boolean;
}
