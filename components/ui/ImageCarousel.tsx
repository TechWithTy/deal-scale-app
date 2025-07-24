import type React from "react";
import { useState } from "react";
import Image from "next/image";

interface ImageCarouselProps {
	images: string[];
	aspectRatio?: string; // e.g. "aspect-[3/2]"
	altPrefix?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
	images,
	aspectRatio = "aspect-[3/2]",
	altPrefix = "Image",
}) => {
	const validImages = images.filter(Boolean);
	const [current, setCurrent] = useState(0);
	const [fade, setFade] = useState(false);
	const hasMultiple = validImages.length > 1;

	const triggerFade = () => {
		setFade(false);
		setTimeout(() => setFade(true), 10); // restart animation
	};

	const goPrev = (e: React.MouseEvent) => {
		e.stopPropagation();
		triggerFade();
		setCurrent((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
	};
	const goNext = (e: React.MouseEvent) => {
		e.stopPropagation();
		triggerFade();
		setCurrent((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
	};

	return (
		<div
			className={`relative w-full overflow-hidden rounded-t-2xl bg-gray-100 ${aspectRatio}`}
		>
			{validImages.length > 0 ? (
				<Image
					src={validImages[current]}
					alt={`${altPrefix} ${current + 1}`}
					width={600}
					height={400}
					className={`h-full w-full object-cover object-center transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`}
					{...(current === 0 ? { priority: true } : { loading: "lazy" })}
					onLoad={() => setFade(true)}
				/>
			) : (
				<span className="flex h-full w-full items-center justify-center text-gray-400">
					No Image
				</span>
			)}
			{hasMultiple && (
				<>
					<button
						type="button"
						aria-label="Previous image"
						onClick={goPrev}
						className="-translate-y-1/2 absolute top-1/2 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900/80 text-white shadow transition hover:bg-orange-700 focus:bg-orange-700 focus:ring-2 focus:ring-orange-500"
					>
						&#8592;
					</button>
					<button
						type="button"
						aria-label="Next image"
						onClick={goNext}
						className="-translate-y-1/2 absolute top-1/2 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900/80 text-white shadow transition hover:bg-orange-700 focus:bg-orange-700 focus:ring-2 focus:ring-orange-500"
					>
						&#8594;
					</button>
				</>
			)}
			<span className="sr-only">{`${altPrefix} ${current + 1}`}</span>
		</div>
	);
};

export default ImageCarousel;
