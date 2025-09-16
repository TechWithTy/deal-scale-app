import type { SavedSearch } from "@/types/userProfile";
import type { FC } from "react";
import { Star, StarOff } from "lucide-react";

type SavedSearchModalProps = {
	open: boolean;
	onClose: () => void;
	savedSearches: SavedSearch[];
	onDelete: (id: string) => void;
	onSelect: (search: SavedSearch) => void;
	onSetPriority: (id: string) => void;
};

const SavedSearchModal: FC<SavedSearchModalProps> = ({
	open,
	onClose,
	savedSearches,
	onDelete,
	onSelect,
	onSetPriority,
}) => {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="relative w-full max-w-lg rounded-xl bg-card p-6 shadow-lg text-card-foreground">
				<button
					type="button"
					className="absolute right-3 top-3 text-muted-foreground hover:text-accent"
					onClick={onClose}
					aria-label="Close modal"
				>
					&times;
				</button>
				<h2 className="mb-4 font-bold text-lg">Saved Searches</h2>
				{savedSearches.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						No saved searches yet.
					</div>
				) : (
					<ul className="max-h-80 space-y-4 overflow-y-auto">
						{savedSearches.map((search) => (
							<li
								key={search.id}
								className="flex flex-col gap-2 rounded-lg border bg-muted/50 p-4"
							>
								<div className="flex items-center justify-between">
									<span className="font-semibold text-foreground">
										{search.name}
									</span>
									<div className="flex items-center gap-2">
										<button
											type="button"
											className="group"
											title={
												search.priority ? "Priority Search" : "Set as Priority"
											}
											onClick={() => onSetPriority(search.id)}
										>
											{search.priority ? (
												<Star className="fill-accent text-accent" size={20} />
											) : (
												<StarOff
													className="text-muted-foreground group-hover:text-accent"
													size={20}
												/>
											)}
										</button>
										<span className="text-xs text-muted-foreground">
											{new Date(search.createdAt).toLocaleString()}
										</span>
									</div>
								</div>
								<div className="flex flex-wrap gap-2 rounded-lg bg-muted p-3 text-xs">
									{typeof search.searchCriteria.location === "string" && (
										<div className="rounded bg-accent/10 px-2 py-1 font-semibold text-accent-foreground">
											Location:{" "}
											<span className="font-normal">
												{search.searchCriteria.location}
											</span>
										</div>
									)}
									{typeof search.searchCriteria.baths === "string" && (
										<div className="rounded bg-primary/10 px-2 py-1 font-semibold text-primary-foreground">
											Baths:{" "}
											<span className="font-normal">
												{search.searchCriteria.baths}
											</span>
										</div>
									)}
									{typeof search.searchCriteria.beds === "string" && (
										<div className="rounded bg-green-500/10 px-2 py-1 font-semibold text-green-700">
											Beds:{" "}
											<span className="font-normal">
												{search.searchCriteria.beds}
											</span>
										</div>
									)}
									{typeof search.searchCriteria.propertyType === "string" && (
										<div className="rounded bg-purple-500/10 px-2 py-1 font-semibold text-purple-700">
											Type:{" "}
											<span className="font-normal">
												{search.searchCriteria.propertyType}
											</span>
										</div>
									)}
									{typeof search.searchCriteria.advanced === "object" &&
										search.searchCriteria.advanced !== null &&
										(() => {
											const adv = search.searchCriteria.advanced as Record<
												string,
												unknown
											>;
											return (
												<>
													{"mlsOnly" in adv &&
														typeof adv.mlsOnly === "boolean" && (
															<div className="rounded bg-muted px-2 py-1 font-semibold text-muted-foreground">
																MLS Only:
																<span className="font-normal">
																	{adv.mlsOnly ? "Yes" : "No"}
																</span>
															</div>
														)}
													{"foreClosure" in adv &&
														typeof adv.foreClosure === "boolean" && (
															<div className="rounded bg-muted px-2 py-1 font-semibold text-muted-foreground">
																Foreclosure:
																<span className="font-normal">
																	{adv.foreClosure ? "Yes" : "No"}
																</span>
															</div>
														)}
													{"extraPropertyData" in adv &&
														typeof adv.extraPropertyData === "boolean" && (
															<div className="rounded bg-muted px-2 py-1 font-semibold text-muted-foreground">
																Extra Data:
																<span className="font-normal">
																	{adv.extraPropertyData ? "Yes" : "No"}
																</span>
															</div>
														)}
													{"excludePending" in adv &&
														typeof adv.excludePending === "boolean" && (
															<div className="rounded bg-muted px-2 py-1 font-semibold text-muted-foreground">
																Exclude Pending:
																<span className="font-normal">
																	{adv.excludePending ? "Yes" : "No"}
																</span>
															</div>
														)}
												</>
											);
										})()}
								</div>
								<div className="flex justify-end gap-2">
									<button
										type="button"
										className="rounded bg-accent px-3 py-1 text-xs text-accent-foreground hover:bg-accent/90"
										onClick={() => onSelect(search)}
									>
										Select
									</button>
									<button
										type="button"
										className="rounded bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
										onClick={() => onDelete(search.id)}
									>
										Delete
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default SavedSearchModal;
