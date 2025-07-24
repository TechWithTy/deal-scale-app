import { create } from "zustand";

// Modal types for global modal management
export type ModalType = null | "skipTrace" | "otherModal";

interface ModalStore {
	activeModal: ModalType;
	modalProps: Record<string, unknown>;
	openModal: (modal: ModalType, props?: Record<string, unknown>) => void;
	closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
	activeModal: null,
	modalProps: {},
	openModal: (modal, props = {}) =>
		set({ activeModal: modal, modalProps: props }),
	closeModal: () => set({ activeModal: null, modalProps: {} }),
}));
