"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDrawerFlowStore } from "../stores/drawerFlowStore";
import type { DrawerItem } from "../types";
import { Bed, Bath, Ruler, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { ModalImageLens } from "@/external/modal-image-inspect";

interface ItemsGridProps {
	renderItem?: (
		item: DrawerItem,
		selected: boolean,
		toggle: () => void,
	) => React.ReactNode;
}

export const ItemsGrid: React.FC<ItemsGridProps> = ({ renderItem }) => {
	const { items, searchTerm, selectedIds, toggleSelect } = useDrawerFlowStore();
	const [slideByItem, setSlideByItem] = useState<Record<string, number>>({});

	const filtered = useMemo(() => {
		const q = searchTerm.trim().toLowerCase();
		if (!q) return items;
		return items.filter(
			(it) =>
				it.display.title.toLowerCase().includes(q) ||
				(it.display.subtitle?.toLowerCase().includes(q) ?? false),
		);
	}, [items, searchTerm]);

	const goSlide = (id: string, dir: 1 | -1, total: number) => {
		setSlideByItem((prev) => {
			const curr = prev[id] ?? 0;
			const next = (curr + dir + total) % total;
			return { ...prev, [id]: next };
		});
	};

	return (
		<div className="flex-1 overflow-auto p-6 pt-0">
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				{filtered.map((item, i) => {
					const selected = selectedIds.includes(item.id);
					const toggle = () => toggleSelect(item.id);

					if (renderItem) {
						return (
							<div key={item.id} className="p-1">
								{renderItem(item, selected, toggle)}
							</div>
						);
					}

					// Default enhanced card renderer
					let urls = item.display.mediaUrls?.length
						? item.display.mediaUrls
						: item.display.mediaUrl
							? [item.display.mediaUrl]
							: [];
					if (urls.length === 0) {
						const seed = encodeURIComponent(item.id);
						urls = [
							`https://picsum.photos/seed/${seed}a/800/450`,
							`https://picsum.photos/seed/${seed}b/800/450`,
							`https://picsum.photos/seed/${seed}c/800/450`,
						];
					}
					const total = urls.length;
					const idx = slideByItem[item.id] ?? 0;
					const showCarousel = total > 0;

					return (
						<div key={item.id} className="p-1">
							<Card
								className={`relative overflow-hidden border bg-card text-card-foreground shadow-sm transition ${selected ? "ring-2 ring-primary ring-offset-2" : ""}`}
							>
								<CardContent className="p-0">
									{showCarousel && (
										<div className="group relative h-40 md:h-48 w-full bg-muted">
											{/* image with hover lens + modal on click */}
											<ModalImageLens
												src={urls[idx]}
												alt={item.display.title}
												className="h-full w-full"
												priority={i < 3}
												sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
											/>
											{total > 1 && (
												<>
													<button
														type="button"
														className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 text-white shadow backdrop-blur-sm ring-1 ring-white/20 hover:bg-black/55 transition-opacity opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center z-30"
														onClick={(e) => {
															e.stopPropagation();
															goSlide(item.id, -1, total);
														}}
														aria-label="Previous image"
													>
														<ChevronLeft className="h-5 w-5" aria-hidden />
													</button>
													<button
														type="button"
														className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 text-white shadow backdrop-blur-sm ring-1 ring-white/20 hover:bg-black/55 transition-opacity opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center z-30"
														onClick={(e) => {
															e.stopPropagation();
															goSlide(item.id, 1, total);
														}}
														aria-label="Next image"
													>
														<ChevronRight className="h-5 w-5" aria-hidden />
													</button>
													<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/30 px-1.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30">
														{urls.map((_, i) => (
															<span
																key={i}
																className={`h-1.5 w-3 rounded-full ${i === idx ? "bg-primary" : "bg-background/70 ring-1 ring-border"}`}
															/>
														))}
													</div>
												</>
											)}
										</div>
									)}

									<div className="p-4">
										<div className="mb-2 flex items-center justify-between gap-2">
											<h3 className="font-semibold text-base truncate pr-2">
												{item.display.title}
											</h3>
											<div className="flex items-center gap-2">
												<Button
													asChild
													size="sm"
													className="bg-primary text-primary-foreground hover:bg-primary/90 shadow"
												>
													<Link
														href={`/dashboard/properties/${item.id}`}
														prefetch
														title="View details"
													>
														<Eye className="mr-1.5 h-4 w-4" /> View
													</Link>
												</Button>
												<Button
													variant={selected ? "default" : "outline"}
													size="sm"
													onClick={toggle}
													aria-pressed={selected}
												>
													{selected ? "Selected" : "Select"}
												</Button>
											</div>
										</div>
										{item.display.subtitle && (
											<p className="text-muted-foreground text-sm">
												{item.display.subtitle}
											</p>
										)}

										{/* mock icons with numbers */}
										<div className="mt-3 grid grid-cols-3 items-center gap-2 text-xs text-muted-foreground">
											<div className="flex items-center gap-1">
												<Bed className="h-4 w-4" />
												<span>
													{(item.details?.beds as number | undefined) ?? "—"}
												</span>
											</div>
											<div className="flex items-center gap-1">
												<Bath className="h-4 w-4" />
												<span>
													{(item.details?.baths as number | undefined) ?? "—"}
												</span>
											</div>
											<div className="flex items-center gap-1">
												<Ruler className="h-4 w-4" />
												<span>
													{(item.details?.sqft as number | undefined) ?? "—"}
												</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					);
				})}
			</div>
		</div>
	);
};
