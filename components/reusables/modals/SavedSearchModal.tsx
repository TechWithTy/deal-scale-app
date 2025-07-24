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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-lg dark:bg-gray-900">
				<button
					type="button"
					className="absolute top-3 right-3 text-gray-500 hover:text-orange-600"
					onClick={onClose}
					aria-label="Close modal"
				>
					&times;
				</button>
				<h2 className="mb-4 font-bold text-lg">Saved Searches</h2>
				{savedSearches.length === 0 ? (
					<div className="py-8 text-center text-gray-400">
						No saved searches yet.
					</div>
				) : (
					<ul className="max-h-80 space-y-4 overflow-y-auto">
						{savedSearches.map((search) => (
							<li
								key={search.id}
								className="flex flex-col gap-2 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800"
							>
								<div className="flex items-center justify-between">
									<span className="font-semibold text-gray-900 dark:text-white">
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
												<Star
													className="fill-orange-400 text-orange-500"
													size={20}
												/>
											) : (
												<StarOff
													className="text-gray-400 group-hover:text-orange-500"
													size={20}
												/>
											)}
										</button>
										<span className="text-gray-400 text-xs">
											{new Date(search.createdAt).toLocaleString()}
										</span>
									</div>
								</div>
								<div className="flex flex-wrap gap-2 rounded-lg bg-gray-100 p-3 text-xs dark:bg-gray-900">
									{typeof search.searchCriteria.location === "string" && (
										<div className="rounded bg-orange-50 px-2 py-1 font-semibold text-orange-800 dark:bg-orange-900 dark:text-orange-200">
											Location:{" "}
											<span className="font-normal">
												{search.searchCriteria.location}
											</span>
										</div>
									)}
									{typeof search.searchCriteria.baths === "string" && (
										<div className="rounded bg-blue-50 px-2 py-1 font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
											Baths:{" "}
											<span className="font-normal">
												{search.searchCriteria.baths}
											</span>
										</div>
									)}
									{typeof search.searchCriteria.beds === "string" && (
										<div className="rounded bg-green-50 px-2 py-1 font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
											Beds:{" "}
											<span className="font-normal">
												{search.searchCriteria.beds}
											</span>
										</div>
									)}
									{typeof search.searchCriteria.propertyType === "string" && (
										<div className="rounded bg-purple-50 px-2 py-1 font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-200">
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
															<div className="rounded bg-gray-200 px-2 py-1 font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-100">
																MLS Only:
																<span className="font-normal">
																	{adv.mlsOnly ? "Yes" : "No"}
																</span>
															</div>
														)}
													{"foreClosure" in adv &&
														typeof adv.foreClosure === "boolean" && (
															<div className="rounded bg-gray-200 px-2 py-1 font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-100">
																Foreclosure:
																<span className="font-normal">
																	{adv.foreClosure ? "Yes" : "No"}
																</span>
															</div>
														)}
													{"extraPropertyData" in adv &&
														typeof adv.extraPropertyData === "boolean" && (
															<div className="rounded bg-gray-200 px-2 py-1 font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-100">
																Extra Data:
																<span className="font-normal">
																	{adv.extraPropertyData ? "Yes" : "No"}
																</span>
															</div>
														)}
													{"excludePending" in adv &&
														typeof adv.excludePending === "boolean" && (
															<div className="rounded bg-gray-200 px-2 py-1 font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-100">
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
										className="rounded bg-orange-600 px-3 py-1 text-white text-xs hover:bg-orange-700"
										onClick={() => onSelect(search)}
									>
										Select
									</button>
									<button
										type="button"
										className="rounded bg-gray-200 px-3 py-1 text-gray-800 text-xs hover:bg-red-500 hover:text-white"
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
