/**
 * useDrawerController: minimal hook for opening/closing drawer from UI components.
 */
import { useTabbedListStore } from "../store";

export function useDrawerController() {
	const open = useTabbedListStore((s) => s.drawer.open);
	const item = useTabbedListStore((s) => s.drawer.currentItem);

	return {
		open,
		item,
		openWith: (it: any) => useTabbedListStore.getState().openDrawer(it),
		close: () => useTabbedListStore.getState().closeDrawer(),
	};
}
