/**
 * Shared domain types for tabbed property lists and drawer logic.
 */
export type TabKey = "all" | "favorites" | "saved" | "recent" | "results";

export interface Pagination {
	page: number;
	pageSize: number;
	total: number;
}

export type SortDirection = "asc" | "desc";

export interface SortSpec {
	field: "price" | "beds" | "baths" | "sqft" | "createdAt" | "aiScore";
	direction: SortDirection;
}

export interface FilterSpec {
	query?: string;
	minPrice?: number;
	maxPrice?: number;
	beds?: number;
	baths?: number;
	propertyType?: string;
	city?: string;
	state?: string;
}

export interface PropertySummary {
	id: string;
	addressLine: string;
	city: string;
	state: string;
	zip: string;
	price?: number;
	beds?: number;
	baths?: number;
	sqft?: number;
	lotSqft?: number;
	imageUrl?: string;
	badges?: Array<{
		label: string;
		tone?: "default" | "info" | "success" | "warning";
	}>;
	aiScore?: number;
	createdAt?: string;
}

export interface DrawerState<T = PropertySummary> {
	open: boolean;
	currentItem: T | null;
}

export interface TabbedListState<T = PropertySummary> {
	items: T[];
	loading: boolean;
	error: string | null;
	pagination: Pagination;
	sort: SortSpec | null;
	filters: FilterSpec;
	selectedIds: Set<string>;
	activeTab: TabKey;
	drawer: DrawerState<T>;
}
