import type { Header } from "@/types/skip-trace";
import type { InputField } from "@/types/skip-trace/enrichment";
import { create } from "zustand";

interface SkipTraceState {
	step: number;
	listName: string;
	uploadedFile: File | null;
	parsedHeaders: string[];
	selectedHeaders: Header[];
	selectedEnrichmentOptions: string[];
	userInput: Record<InputField, string>;
	leadCount: number;
	submitting: boolean;
}

interface SkipTraceActions {
	setStep: (step: number) => void;
	nextStep: () => void;
	prevStep: () => void;
	setListName: (name: string) => void;
	handleFileSelect: (
		file: File,
		headers: string[],
		name: string,
		data: Record<string, unknown>[],
	) => void;
	handleHeaderSelection: (headers: Header[]) => void;
	handleEnrichmentNext: (
		options: string[],
		currentInput: Record<InputField, string>,
	) => void;
	setSelectedEnrichmentOptions: (options: string[]) => void;
	setUserInput: (userInput: Partial<Record<InputField, string>>) => void;
	setSubmitting: (isSubmitting: boolean) => void;
	reset: () => void;
}

const initialState: SkipTraceState = {
	step: 0,
	listName: "",
	uploadedFile: null,
	parsedHeaders: [],
	selectedHeaders: [],
	selectedEnrichmentOptions: [],
	userInput: {} as Record<InputField, string>,
	leadCount: 1,
	submitting: false,
};

export const useSkipTraceStore = create<SkipTraceState & SkipTraceActions>()(
	(set, get) => ({
		...initialState,

		setStep: (step) => set({ step }),
		nextStep: () => set((state) => ({ step: state.step + 1 })),
		prevStep: () => set((state) => ({ step: state.step - 1 })),
		setListName: (name) => set({ listName: name }),
		handleFileSelect: (file, headers, name, data) => {
			set({
				uploadedFile: file,
				parsedHeaders: headers,
				listName: name,
				leadCount: data.length,
				step: 1, // * Move to next step after file processing
			});
		},
		handleHeaderSelection: (headers) => {
			set({ selectedHeaders: headers });
			get().nextStep();
		},
		handleEnrichmentNext: (options, currentInput) => {
			set({ selectedEnrichmentOptions: options, userInput: currentInput });
			get().nextStep();
		},
		setSelectedEnrichmentOptions: (options) =>
			set({ selectedEnrichmentOptions: options }),
		setUserInput: (userInput) =>
			set((state) => ({ userInput: { ...state.userInput, ...userInput } })),
		setSubmitting: (isSubmitting) => set({ submitting: isSubmitting }),
		reset: () => set(initialState),
	}),
);
