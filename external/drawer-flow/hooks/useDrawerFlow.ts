import { useEffect } from "react";
import { useDrawerFlowStore } from "../stores/drawerFlowStore";
import type { DrawerFlowProps } from "../types";

export function useDrawerFlow(props: DrawerFlowProps) {
	const store = useDrawerFlowStore();

	useEffect(() => {
		if (props.items?.length) store.loadInitial(props.items);
		if (props.defaultPageSize) store.setPageSize(props.defaultPageSize);
		if (props.pageSizeOptions?.length) {
			// minimal: ignore overwrite here; could be added to store
		}
		// Ensure drawer starts closed unless controlled by prop
		if (typeof props.isOpen === "boolean") {
			store.setOpen(props.isOpen);
		} else {
			store.setOpen(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		props.onSelectionChange?.(store.selectedIds);
	}, [store.selectedIds]);

	return store;
}
