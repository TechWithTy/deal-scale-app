import { create } from "zustand";

export type MarketView = "off" | "on_default" | "on_premium";

interface PropertyMarketViewState {
	marketView: MarketView;
	setMarketView: (v: MarketView) => void;
}

export const usePropertyMarketView = create<PropertyMarketViewState>((set) => ({
	marketView: "on_default",
	setMarketView: (v) => set({ marketView: v }),
}));
