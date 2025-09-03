import { useCallback } from "react";
import { useDrawerFlowStore } from "../stores/drawerFlowStore";

const MIN_DRAWER_HEIGHT = 100;

export function useResizeHandle() {
	const setHeight = useDrawerFlowStore((s) => s.setHeight);

	const startResizing = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault();
			const onMove = (e: MouseEvent) => {
				const newHeight = window.innerHeight - e.clientY;
				if (newHeight >= MIN_DRAWER_HEIGHT && newHeight <= window.innerHeight) {
					setHeight(newHeight);
				}
			};
			const onUp = () => {
				window.removeEventListener("mousemove", onMove);
				window.removeEventListener("mouseup", onUp);
			};

			window.addEventListener("mousemove", onMove);
			window.addEventListener("mouseup", onUp);
		},
		[setHeight],
	);

	return { startResizing };
}
