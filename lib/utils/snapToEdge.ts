export interface Position {
	x: number;
	y: number;
}

export interface WidgetSize {
	width: number;
	height: number;
}

export interface ViewportDimensions {
	viewportWidth: number;
	viewportHeight: number;
}

export interface SnapOptions {
	threshold: number;
	margin: number;
}

export type SnapAnchor =
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right"
	| "floating";

function clamp(value: number, min: number, max: number): number {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

export function snapToEdge(
	position: Position,
	size: WidgetSize,
	viewport: ViewportDimensions,
	options: SnapOptions,
): Position {
	const { margin, threshold } = options;
	const maxX = viewport.viewportWidth - size.width - margin;
	const maxY = viewport.viewportHeight - size.height - margin;

	let nextX = clamp(position.x, margin, Math.max(margin, maxX));
	let nextY = clamp(position.y, margin, Math.max(margin, maxY));

	const distanceToLeft = nextX - margin;
	const distanceToRight = maxX - nextX;
	const distanceToTop = nextY - margin;
	const distanceToBottom = maxY - nextY;

	if (distanceToLeft <= threshold) {
		nextX = margin;
	} else if (distanceToRight <= threshold) {
		nextX = maxX;
	}

	if (distanceToTop <= threshold) {
		nextY = margin;
	} else if (distanceToBottom <= threshold) {
		nextY = maxY;
	}

	return { x: nextX, y: nextY };
}

export function calculateSnapAnchor(
	position: Position,
	viewportWidth: number,
	viewportHeight: number,
	width: number,
	height: number,
): SnapAnchor {
	const rightX = viewportWidth - width;
	const bottomY = viewportHeight - height;
	const nearLeft = position.x <= width;
	const nearTop = position.y <= height;
	const nearRight = position.x >= rightX - width;
	const nearBottom = position.y >= bottomY - height;

	if (nearLeft && nearTop) return "top-left";
	if (nearRight && nearTop) return "top-right";
	if (nearRight && nearBottom) return "bottom-right";
	if (nearLeft && nearBottom) return "bottom-left";
	return "floating";
}
