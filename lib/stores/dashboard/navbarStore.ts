import { create } from "zustand";

interface NavbarState {
	isSidebarMinimized: boolean;
	toggleSidebar: () => void;
}

export const useNavbarStore = create<NavbarState>((set) => ({
	isSidebarMinimized: true, // ✅ Default to minimized
	toggleSidebar: () =>
		set((state) => ({ isSidebarMinimized: !state.isSidebarMinimized })),
}));
