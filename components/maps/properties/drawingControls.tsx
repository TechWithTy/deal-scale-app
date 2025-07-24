// * DrawingControls.tsx
// ! UI for drawing mode selection on the map
import type React from "react";

interface DrawingControlsProps {
	drawingMode: google.maps.drawing.OverlayType | null;
	setDrawingMode: (mode: google.maps.drawing.OverlayType | null) => void;
}

const DrawingControls: React.FC<DrawingControlsProps> = ({
	drawingMode,
	setDrawingMode,
}) => (
	<div className="absolute top-4 left-4 z-10 flex gap-2 rounded bg-white p-2 shadow">
		<button
			type="button"
			className={`rounded px-3 py-1 text-xs ${drawingMode === google.maps.drawing.OverlayType.CIRCLE ? "bg-blue-600 text-white" : "bg-gray-200"}`}
			onClick={() => setDrawingMode(google.maps.drawing.OverlayType.CIRCLE)}
		>
			Circle
		</button>
		<button
			type="button"
			className={`rounded px-3 py-1 text-xs ${drawingMode === google.maps.drawing.OverlayType.POLYLINE ? "bg-blue-600 text-white" : "bg-gray-200"}`}
			onClick={() => setDrawingMode(google.maps.drawing.OverlayType.POLYLINE)}
		>
			Polyline
		</button>
		<button
			type="button"
			className="rounded bg-red-500 px-3 py-1 text-white text-xs"
			onClick={() => setDrawingMode(null)}
		>
			Cancel
		</button>
	</div>
);

export default DrawingControls;
