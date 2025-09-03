"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Lens } from "@/components/magicui/lens";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

export interface ModalImageLensProps {
	/** Image source URL */
	src: string;
	/** Accessible alt text */
	alt: string;
	/** If using "fill", set container sizing via className/style on parent */
	fill?: boolean;
	/** Explicit width (ignored when fill is true) */
	width?: number;
	/** Explicit height (ignored when fill is true) */
	height?: number;
	/** Tailwind classes applied to the outer container */
	className?: string;
	/** Lens options */
	zoomFactor?: number;
	lensSize?: number;
	/** Next.js Image props passthrough */
	priority?: boolean;
	sizes?: string;
	/** Disable Next/Image optimization if remote domains cause issues */
	unoptimized?: boolean;
	/** Render inline view with <img> instead of Next/Image for maximal compatibility */
	useImgTagInline?: boolean;
}

/**
 * ModalImageLens
 * - Hover: shows Magic UI Lens zoom over the image
 * - Click: opens modal with same image and lens, with subtle animation
 */
export const ModalImageLens: React.FC<ModalImageLensProps> = ({
	src,
	alt,
	fill = true,
	width,
	height,
	className = "",
	zoomFactor = 1.6,
	lensSize = 160,
	priority = false,
	sizes,
	unoptimized = true,
	useImgTagInline = true,
}) => {
	const [open, setOpen] = useState(false);

	return (
		<div className={"group relative overflow-hidden rounded-lg " + className}>
			{/* Inline Lens */}
			<button
				type="button"
				aria-label={`Open ${alt}`}
				className="block h-full w-full focus:outline-none"
				onClick={() => setOpen(true)}
			>
				<div className="relative h-full w-full">
					<div className="absolute inset-0">
						<Lens
							zoomFactor={zoomFactor}
							lensSize={lensSize}
							ariaLabel="Zoom area"
						>
							<div className="relative h-full w-full bg-muted">
								{useImgTagInline ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={src}
										alt={alt}
										className="h-full w-full object-cover"
										loading={priority ? "eager" : "lazy"}
										decoding="async"
									/>
								) : (
									<Image
										src={src}
										alt={alt}
										fill={fill}
										width={fill ? undefined : width}
										height={fill ? undefined : height}
										className="object-cover"
										sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
										priority={priority}
										unoptimized={unoptimized}
									/>
								)}
							</div>
						</Lens>
					</div>
				</div>
			</button>

			{/* Modal with animated content */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 border-0 bg-transparent p-0 shadow-none max-w-[96vw] w-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
					<div className="relative mx-auto max-h-[90vh] max-w-[92vw]">
						<Lens
							zoomFactor={Math.max(zoomFactor, 1.8)}
							lensSize={Math.max(lensSize, 220)}
							ariaLabel="Zoom area"
						>
							<div className="relative h-[70vh] w-[82vw] bg-black">
								<Image
									src={src}
									alt={alt}
									fill
									className="object-contain object-center"
									sizes="100vw"
									priority
									unoptimized={unoptimized}
								/>
							</div>
						</Lens>
						<button
							type="button"
							className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-black shadow hover:bg-white"
							aria-label="Close"
							onClick={() => setOpen(false)}
						>
							<X className="h-5 w-5" />
						</button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ModalImageLens;
