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
					<span className="font-medium">Field Mappings:</span>
					<ul className="mt-1 ml-4 list-disc text-sm">
						{Object.entries(selectedHeaders).map(([field, header]) => (
							<li key={field}>
								<span className="font-medium">{field}:</span>{" "}
								{header || <span className="text-red-500">Not mapped</span>}
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className="flex items-center justify-between gap-4">
				<Button type="button" variant="outline" onClick={onBack}>
					Back
				</Button>
				<Button type="button" onClick={onSubmit} disabled={submitting}>
					{submitting ? "Uploading..." : "Submit"}
				</Button>
			</div>
		</div>
	);
};

export default ReviewAndSubmitStep;
