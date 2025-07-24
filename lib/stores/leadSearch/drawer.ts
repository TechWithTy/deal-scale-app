import type { Property } from "@/types/_dashboard/property";
import { create } from "zustand";

interface PropertyStoreState {
	isDrawerOpen: boolean;
	drawerHeight: number;
	properties: Property[];
	visibleProperties: Property[];
	progressValue: number;
	listSizeLabel: string;
	hasMore: boolean;
	isLoading: boolean;

	setIsDrawerOpen: (open: boolean) => void;
	setDrawerHeight: (height: number) => void;
	loadMoreProperties: (maxCardsPerLoad: number) => void;
	setProperties: (properties: Property[]) => void;
}

const MAX_CARDS_PER_LOAD = 12;
const MIN_DRAWER_HEIGHT = 100;
export const usePropertyStore = create<PropertyStoreState>((set, get) => ({
	// Initial states
	isDrawerOpen: false,
	drawerHeight: 800,
	properties: [],
	visibleProperties: [],
	progressValue: 0,
	listSizeLabel: "Specific",
	hasMore: true,
	isLoading: false,

	// Actions
	setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),

	setDrawerHeight: (height) => {
		if (height >= MIN_DRAWER_HEIGHT) {
			set({ drawerHeight: height });
		}
	},

	setProperties: (properties) => {
		// Set the properties first
		set({ properties });

		// Then derive visible properties after setting properties
		const visibleProps = properties.slice(0, MAX_CARDS_PER_LOAD);

		set({
			visibleProperties: visibleProps,
			progressValue:
				properties.length <= 100 ? 25 : properties.length <= 10000 ? 50 : 75,
			listSizeLabel:
				properties.length <= 100
					? "Specific"
					: properties.length <= 10000
						? "Moderate"
						: "Broad",
			hasMore: properties.length > MAX_CARDS_PER_LOAD,
		});
	},

	loadMoreProperties: (maxCardsPerLoad: number) => {
		const { properties, visibleProperties, isLoading } = get();
		if (isLoading) return;

		set({ isLoading: true });

		setTimeout(() => {
			const nextProperties = properties.slice(
				visibleProperties.length,
				visibleProperties.length + maxCardsPerLoad, // Use dynamic maxCardsPerLoad
			);

			set({
				visibleProperties: [...visibleProperties, ...nextProperties],
				hasMore:
					visibleProperties.length + nextProperties.length < properties.length, // Update hasMore based on total length
				isLoading: false,
			});
		}, 1000); // Simulated delay
	},
}));
