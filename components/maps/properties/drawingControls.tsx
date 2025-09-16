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
	<div className="absolute left-4 top-4 z-10 flex gap-2 rounded bg-card p-2 shadow">
		<button
			type="button"
			className={`rounded px-3 py-1 text-xs ${drawingMode === google.maps.drawing.OverlayType.CIRCLE ? "bg-primary text-primary-foreground" : "bg-muted"}`}
			onClick={() => setDrawingMode(google.maps.drawing.OverlayType.CIRCLE)}
		>
			Circle
		</button>
		<button
			type="button"
			className={`rounded px-3 py-1 text-xs ${drawingMode === google.maps.drawing.OverlayType.POLYLINE ? "bg-primary text-primary-foreground" : "bg-muted"}`}
			onClick={() => setDrawingMode(google.maps.drawing.OverlayType.POLYLINE)}
		>
			Polyline
		</button>
		<button
			type="button"
			className="rounded bg-destructive px-3 py-1 text-xs text-destructive-foreground"
			onClick={() => setDrawingMode(null)}
		>
			Cancel
		</button>
	</div>
);

export default DrawingControls;
