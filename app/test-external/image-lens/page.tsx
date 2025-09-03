"use client";

import React from "react";
import { ModalImageLens } from "@/external/modal-image-inspect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImageLensTestPage() {
	const seed = "lens-demo";
	const src = `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`;

	return (
		<div className="mx-auto max-w-4xl p-6">
			<h1 className="mb-4 font-semibold text-2xl">Modal Image Lens - Demo</h1>

			<Card>
				<CardHeader>
					<CardTitle>Hover to zoom. Click to open modal.</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
						<ModalImageLens src={src} alt="Sample image" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
