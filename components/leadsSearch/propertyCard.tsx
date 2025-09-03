import { Card, CardContent } from "@/components/ui/card";
import type { Property } from "@/types/_dashboard/property";
import { isRealtorProperty } from "@/types/_dashboard/property";
import { format } from "date-fns";
import {
	MapPin,
	Ruler,
	Bath,
	Bed,
	DollarSign,
	Calendar,
	Home,
} from "lucide-react";
import type {
	RealtorProperty,
	RentCastProperty,
} from "@/types/_dashboard/property";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useState } from "react";

interface PropertyCardProps {
	property: Property;
	selected: boolean;
	onSelect: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
	property,
	selected,
	onSelect,
}) => {
	const isRealtor = isRealtorProperty(property);

	// Build image list (Realtor only has media list; RentCast lacks images in the type)
	const realtorImages = isRealtor
		? (property as RealtorProperty).media.images
				.map((img) => img.url)
				.filter(Boolean)
		: [];
	let images = realtorImages;
	if (!images.length) {
		// Fallback demo images so the carousel is visible even when data lacks media
		const seed = encodeURIComponent(property.id ?? "prop");
		images = [
			`https://picsum.photos/seed/${seed}a/800/450`,
			`https://picsum.photos/seed/${seed}b/800/450`,
			`https://picsum.photos/seed/${seed}c/800/450`,
		];
	}
	const [imgIdx, setImgIdx] = useState(0);
	const prevImg = () =>
		setImgIdx((i) => (i - 1 + images.length) % images.length);
	const nextImg = () => setImgIdx((i) => (i + 1) % images.length);

	// Pre-compute neighbor indices and prefetch those images using hidden <img>
	const leftIdx = (imgIdx - 1 + images.length) % images.length;
	const rightIdx = (imgIdx + 1) % images.length;
	const blurDataURL =
		"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyNlZWUnIC8+PC9zdmc+";

	// Get property details with type safety
	const { address, details, metadata } = property;

	// Access property values based on type
	const listPrice = isRealtor
		? (property as RealtorProperty).metadata.listPrice
		: (property as RentCastProperty).metadata.lastSalePrice;

	const lastSoldDate = isRealtor
		? (property as RealtorProperty).metadata.lastSoldDate
		: (property as RentCastProperty).metadata.lastSaleDate;

	const soldPrice = isRealtor
		? undefined // Not available in RealtorProperty
		: (property as RentCastProperty).metadata.lastSalePrice;

	// Format price
	const formatPrice = (price: number | string | undefined | null): string => {
		if (price === undefined || price === null) return "N/A";
		const priceNum =
			typeof price === "string" ? Number.parseFloat(price) : price;
		if (Number.isNaN(priceNum)) return "N/A";

		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 0,
		}).format(priceNum);
	};

	// Format date
	const formatDate = (date: string | Date | undefined | null): string => {
		if (!date) return "N/A";
		try {
			return format(new Date(date), "MMM d, yyyy");
		} catch (e) {
			return "N/A";
		}
	};

	return (
		<Card
			className={`group relative mx-auto max-w-lg overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md ${
				selected ? "ring-2 ring-orange-500 ring-offset-2" : ""
			}`}
			aria-selected={selected}
		>
			<CardContent className="p-0">
				{/* Checkbox for selection */}
				<button
					type="button"
					className={`absolute z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-transparent shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
						selected
							? "bg-orange-500 text-white border-orange-500"
							: "bg-white/80 group-hover:text-gray-400 dark:bg-gray-800/80 border-gray-200 hover:border-orange-500"
					}`}
					onClick={(e) => {
						e.stopPropagation();
						onSelect(property.id);
					}}
					aria-pressed={selected}
					tabIndex={0}
					title={selected ? "Deselect property" : "Select property"}
					aria-label={selected ? "Deselect property" : "Select property"}
				>
					{selected ? (
						<svg
							className="h-5 w-5 text-white"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clipRule="evenodd"
							/>
						</svg>
					) : (
						<svg
							className="h-5 w-5 text-gray-500"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
								clipRule="evenodd"
							/>
						</svg>
					)}
				</button>

				{/* Property Image Carousel */}
				<div className="group relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
					<Link
						href={`/dashboard/properties/${property.id}`}
						className="block h-full w-full"
					>
						{images[imgIdx] ? (
							<Image
								src={images[imgIdx]}
								alt={`${address.street}, ${address.city}, ${address.state} ${address.zipCode}`}
								fill
								className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								loading="eager"
								placeholder="blur"
								blurDataURL={blurDataURL}
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-gray-400">
								<Home className="h-16 w-16" />
							</div>
						)}
					</Link>
					{images.length > 1 && (
						<>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									prevImg();
								}}
								className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/35 text-white shadow backdrop-blur-sm ring-1 ring-white/20 hover:bg-black/55 transition-opacity opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center"
								aria-label="Previous image"
							>
								<svg
									className="h-5 w-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<polyline points="15 18 9 12 15 6"></polyline>
								</svg>
							</button>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									nextImg();
								}}
								className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/35 text-white shadow backdrop-blur-sm ring-1 ring-white/20 hover:bg-black/55 transition-opacity opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center"
								aria-label="Next image"
							>
								<svg
									className="h-5 w-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<polyline points="9 18 15 12 9 6"></polyline>
								</svg>
							</button>
							<div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2">
								<div className="flex gap-1">
									{images.map((_, i) => (
										<span
											key={i}
											className={`h-1.5 w-3 rounded-full ${i === imgIdx ? "bg-primary" : "bg-background/70 ring-1 ring-border"}`}
										/>
									))}
								</div>
							</div>
						</>
					)}

					{/* Hidden prefetch for neighbor images */}
					<div className="hidden">
						{images[leftIdx] && <img src={images[leftIdx]} alt="" />}
						{images[rightIdx] && <img src={images[rightIdx]} alt="" />}
					</div>
				</div>

				{/* Property Details */}
				<div className="p-4 text-center">
					<div className="mb-2">
						<Link href={`/dashboard/properties/${property.id}`}>
							<h3 className="font-semibold text-gray-900 text-lg hover:text-orange-600 dark:text-white dark:hover:text-orange-400">
								{address.street}, {address.city}, {address.state}{" "}
								{address.zipCode}
							</h3>
						</Link>
					</div>

					{/* Price */}
					<div className="mb-3 flex items-center justify-center">
						<DollarSign className="mr-1 h-4 w-4 text-gray-500" />
						<span className="font-medium text-gray-700 text-sm dark:text-gray-300">
							{listPrice ? formatPrice(listPrice) : "Price not available"}
						</span>
					</div>

					{/* Last Sold */}
					{(lastSoldDate || soldPrice) && (
						<div className="mb-3 flex items-center justify-center">
							<Calendar className="mr-1 h-4 w-4 text-gray-500" />
							<span className="text-gray-600 text-sm dark:text-gray-400">
								{lastSoldDate && `Last sold: ${formatDate(lastSoldDate)}`}
								{soldPrice && ` for ${formatPrice(soldPrice)}`}
							</span>
						</div>
					)}

					{/* Property Features */}
					<div className="grid grid-cols-3 gap-2 border-gray-200 border-t pt-3 dark:border-gray-700">
						<div className="flex items-center justify-center">
							<Bed className="mr-1 h-4 w-4 text-gray-500" />
							<span className="text-gray-700 text-sm dark:text-gray-300">
								{details.beds} {details.beds === 1 ? "bed" : "beds"}
							</span>
						</div>

						<div className="flex items-center justify-center">
							<Bath className="mr-1 h-4 w-4 text-gray-500" />
							<span className="text-gray-700 text-sm dark:text-gray-300">
								{details.fullBaths} {details.fullBaths === 1 ? "bath" : "baths"}
								{details.halfBaths ? `, ${details.halfBaths} half` : ""}
							</span>
						</div>

						<div className="flex items-center justify-center">
							<Ruler className="mr-1 h-4 w-4 text-gray-500" />
							<span className="text-gray-700 text-sm dark:text-gray-300">
								{details.sqft?.toLocaleString() || "N/A"} sqft
							</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default PropertyCard;
