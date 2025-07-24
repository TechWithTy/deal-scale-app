// lib/stores/kanbanStore.ts
import { create } from "zustand";

// Define the type for a single quote
interface Quote {
	text: string;
	author: string;
}

// Define the store state and actions
interface KanbanStore {
	quotes: Quote[];
	currentQuoteIndex: number;
	nextQuote: () => void;
}

// Create the Zustand store
export const useKanbanStore = create<KanbanStore>((set) => ({
	quotes: [
		{
			text: "The Ignite Leads system has been a game-changer for me. It has not only saved me countless hours but also allowed me to deliver stunning, data-driven results to my clients faster than ever. This level of efficiency and impact is unmatched!",
			author: "Sofia Davis",
		},
		{
			text: "Deal Scale helped me scale my business by automating key processes, leaving me more time to focus on strategy and growth.",
			author: "John Smith",
		},
		{
			text: "This platform is an absolute must-have for anyone looking to streamline their lead management process. The results speak for themselves.",
			author: "Emily Johnson",
		},
	],
	currentQuoteIndex: 0,
	nextQuote: () =>
		set((state) => ({
			currentQuoteIndex: (state.currentQuoteIndex + 1) % state.quotes.length,
		})),
}));
