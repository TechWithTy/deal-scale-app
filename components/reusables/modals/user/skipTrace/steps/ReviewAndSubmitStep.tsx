import { Button } from "@/components/ui/button";
import type { FC } from "react";

interface ReviewAndSubmitStepProps {
	listName: string;
	uploadedFile: File | null;
	selectedHeaders: Record<string, string | undefined>;
	onSubmit: () => void;
	onBack: () => void;
	submitting: boolean;
}

const ReviewAndSubmitStep: FC<ReviewAndSubmitStepProps> = ({
	listName,
	uploadedFile,
	selectedHeaders,
	onSubmit,
	onBack,
	submitting,
}) => {
	return (
		<div className="space-y-6">
			<h3 className="font-semibold text-lg">Review & Submit</h3>
			<div>
				<div className="mb-2">
					<span className="font-medium">List Name:</span> {listName}
				</div>
				<div className="mb-2">
					<span className="font-medium">File:</span>{" "}
					{uploadedFile?.name || "No file uploaded"}
				</div>
				<div>
					<span className="mb-1 block font-medium">Field Mappings:</span>
					<div className="overflow-x-auto rounded border border-gray-200 bg-gray-50 dark:bg-gray-800">
						<table className="min-w-full text-sm">
							<thead>
								<tr className="bg-gray-100 dark:bg-gray-700">
									<th className="px-4 py-2 text-left font-semibold">Field</th>
									<th className="px-4 py-2 text-left font-semibold">
										Mapped Header
									</th>
								</tr>
							</thead>
							<tbody>
								{Object.entries(selectedHeaders).map(([field, header]) => (
									<tr
										key={field}
										className="border-gray-200 border-t dark:border-gray-700"
									>
										<td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">
											{field}
										</td>
										<td className="px-4 py-2">
											{header ? (
												<span className="text-green-700 dark:text-green-400">
													{header}
												</span>
											) : (
												<span className="text-red-500">Not mapped</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
			{/*
			 * UI/UX: Button group for navigation
			 * "Back" is always on the left, "Confirm" on the right
			 * Both use loading/disabled state for submitting
			 * ! Prevent navigation during submission
			 */}
			<div className="mt-6 flex items-center justify-between gap-4">
				<Button
					type="button"
					variant="outline"
					onClick={onBack}
					disabled={submitting}
					aria-label="Go back to previous step"
				>
					Back
				</Button>
				<Button
					type="button"
					variant="default"
					className="rounded-md bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					onClick={onSubmit}
					disabled={submitting}
					aria-label="Confirm and upload list"
				>
					{submitting ? "Uploading..." : "Confirm"}
				</Button>
			</div>
		</div>
	);
};

export default ReviewAndSubmitStep;
