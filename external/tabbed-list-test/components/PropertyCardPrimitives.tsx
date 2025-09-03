import { PropertySummary } from "../schemas/types";

// Primitive components for building property cards
export function PropertyImage({ imageUrl }: { imageUrl?: string }) {
	return (
		<div className="relative aspect-video rounded-t-lg overflow-hidden bg-muted">
			{imageUrl ? (
				<img
					src={imageUrl}
					alt="Property"
					className="w-full h-full object-cover"
					onError={(e) => (e.currentTarget.style.display = "none")}
				/>
			) : (
				<div className="bg-muted border-border w-full h-full flex items-center justify-center">
					<span className="text-muted-foreground text-sm">No image</span>
				</div>
			)}
		</div>
	);
}

export function PropertyAddress({ property }: { property: PropertySummary }) {
	return (
		<div>
			<h3 className="font-medium text-foreground truncate">
				{property.addressLine}
			</h3>
			<p className="text-sm text-muted-foreground truncate">
				{property.city}, {property.state} {property.zip}
			</p>
		</div>
	);
}

export function PropertyPrice({ price }: { price?: number }) {
	if (typeof price !== "number") return null;
	return (
		<div className="font-semibold text-foreground">
			${price.toLocaleString()}
		</div>
	);
}

export function PropertyDetails({ property }: { property: PropertySummary }) {
	return (
		<div className="flex gap-4 text-sm text-muted-foreground">
			{property.beds && <span>{property.beds} bd</span>}
			{property.baths && <span>{property.baths} ba</span>}
			{property.sqft && <span>{property.sqft.toLocaleString()} sqft</span>}
		</div>
	);
}

export function PropertyBadges({ badges }: { badges?: string[] }) {
	if (!badges?.length) return null;
	return (
		<div className="flex flex-wrap gap-1 mt-2">
			{badges.map((badge) => (
				<span
					key={badge}
					className="px-2 py-1 text-xs rounded-full bg-accent text-accent-foreground border border-border"
				>
					{badge}
				</span>
			))}
		</div>
	);
}

export function PropertySelectionButton({
	isSelected,
	onToggle,
}: {
	isSelected: boolean;
	onToggle: () => void;
}) {
	// Minimal classnames combiner
	function cn(...classes: Array<string | false | null | undefined>): string {
		return classes.filter(Boolean).join(" ");
	}

	return (
		<button
			onClick={onToggle}
			className={cn(
				"w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
				isSelected
					? "bg-primary border-primary"
					: "bg-background border-border",
			)}
		>
			{isSelected && (
				<svg
					xmlns="http://www.w3.org/2000"
					viewBox="0 0 24 24"
					fill="currentColor"
					className="w-3 h-3 text-primary-foreground"
				>
					<path
						fillRule="evenodd"
						d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
						clipRule="evenodd"
					/>
				</svg>
			)}
		</button>
	);
}
