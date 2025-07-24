import { Card, CardContent } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import type { PropertyDetails } from "@/types/_dashboard/maps";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import ImageCarousel from "../ui/ImageCarousel";

// * PropertyCard component with selection checkbox for list creation
// ! Accepts `selected` and `onSelect` for selection state management
const PropertyCard: React.FC<{
	property: PropertyDetails;
	selected: boolean;
	onSelect: (id: string) => void;
}> = ({ property, selected, onSelect }) => {
	const altPhotos = property.alt_photos.split(", ");

	return (
		<Card
			className={`hover:-translate-y-1 relative mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white shadow-lg transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-900 ${selected ? "border-orange-700 ring-2 ring-orange-600 dark:ring-amber-400" : ""}`}
			aria-selected={selected}
		>
			<CardContent className="p-0">
				{/* Checkbox for selection */}
				<button
					type="button"
					className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white shadow transition-colors hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-600 dark:border-gray-600 dark:bg-gray-800"
					onClick={(e) => {
						e.stopPropagation();
						if (property.id) {
							onSelect(property.id);
						}
					}}
					aria-pressed={selected}
					tabIndex={0}
					title={selected ? "Deselect property" : "Select property"}
					aria-label={selected ? "Deselect property" : "Select property"}
				>
					{selected ? (
						<svg
							className="h-5 w-5 text-orange-600"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M16.707 7.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L10 12.586l5.293-5.293a1 1 0 011.414 0z"
								clipRule="evenodd"
							/>
						</svg>
					) : (
						<span className="block h-4 w-4 rounded-full border border-gray-400 bg-white dark:bg-gray-900" />
					)}
				</button>

				{/* Image/Carousel Section */}
				{/* Image/Carousel Section */}
				<div className="relative mb-2 aspect-[3/2] overflow-hidden rounded-t-2xl bg-gray-100">
					<ImageCarousel
						images={[property.primary_photo, ...altPhotos]}
						altPrefix="Property Image"
					/>
				</div>

				{/* Divider */}
				<div className="mx-4 border-gray-200 border-b dark:border-gray-700" />

				{/* Details Section */}
				<div className="flex flex-col items-center gap-1 px-4 pt-3 pb-4 text-center">
					<h4 className="mb-1 font-bold text-gray-900 text-lg leading-tight dark:text-white">
						<Link
							href={`dashboard/properties/${property.id}`}
							className="text-primary underline-offset-2 transition-colors hover:text-orange-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
							style={{ cursor: "pointer" }}
						>
							{property.street}, {property.city}, {property.state}{" "}
							{property.zip_code}
						</Link>
					</h4>
					<div className="mb-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-medium text-base text-gray-800 dark:text-gray-200">
						<span>
							Est. Value:{" "}
							<span className="font-semibold text-orange-700 dark:text-amber-400">
								${property.list_price.toLocaleString()}
							</span>
						</span>
					</div>
					<div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-gray-500 text-xs dark:text-gray-400">
						<span>Last Sale: {property.last_sold_date}</span>
						<span>Sold Price: ${property.sold_price.toLocaleString()}</span>
					</div>
					<div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-gray-700 text-sm dark:text-gray-300">
						<span className="inline-flex items-center gap-1">
							<svg
								className="h-4 w-4 text-gray-400"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path d="M4 10V7a4 4 0 014-4h8a4 4 0 014 4v3" />
								<path d="M4 10v10a2 2 0 002 2h12a2 2 0 002-2V10" />
								<path d="M9 21V12h6v9" />
							</svg>
							{property.beds} bed
						</span>
						<span className="inline-flex items-center gap-1">
							<svg
								className="h-4 w-4 text-gray-400"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path d="M9 21V12h6v9" />
								<path d="M9 12V7a3 3 0 013-3 3 3 0 013 3v5" />
							</svg>
							{property.full_baths} bath
						</span>
						<span className="inline-flex items-center gap-1">
							<svg
								className="h-4 w-4 text-gray-400"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path d="M4 21V9a2 2 0 012-2h12a2 2 0 012 2v12" />
								<path d="M4 9V7a4 4 0 014-4h8a4 4 0 014 4v2" />
							</svg>
							{property.sqft} sqft
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default PropertyCard;
