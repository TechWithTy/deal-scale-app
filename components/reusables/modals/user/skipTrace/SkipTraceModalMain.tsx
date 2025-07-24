import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import FieldMappingStep from "./steps/FieldMappingStep";
import ListNameAndUploadStep from "./steps/ListNameAndUploadStep";
import ReviewAndSubmitStep from "./steps/ReviewAndSubmitStep";

const SkipTraceModalMain = ({
	isOpen,
	onClose,
}: { isOpen: boolean; onClose: () => void }) => {
	const [step, setStep] = useState(0);
	const [listName, setListName] = useState("");
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [headers, setHeaders] = useState<string[]>([]);
	const [selectedHeaders, setSelectedHeaders] = useState<
		Record<string, string | undefined>
	>({});
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, { message?: string }>>(
		{},
	);

	// Dropzone setup
	const onDrop = async (acceptedFiles: File[]) => {
		if (acceptedFiles.length) {
			const file = acceptedFiles[0];
			setUploadedFile(file);
			// Simulate header extraction (replace with real logic)
			try {
				// Replace this with your real header extraction logic
				const extractedHeaders = [
					"FirstName",
					"LastName",
					"Street",
					"City",
					"State",
					"Zip",
					"Phone1",
					"Phone2",
					"Email",
					"Facebook",
					"LinkedIn",
					"Instagram",
					"Twitter",
				];
				setHeaders(extractedHeaders);
				setError(null);
			} catch (err) {
				setError("Error extracting headers from the file");
				setHeaders([]);
			}
		}
	};
	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			"text/csv": [".csv"],
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
				".xlsx",
			],
		},
		maxSize: 2 * 1024 * 1024 * 1024, // 2 GB
	});

	// Navigation
	const nextStep = () => setStep((s) => Math.min(s + 1, 2));
	const prevStep = () => setStep((s) => Math.max(s - 1, 0));

	// Field selection handler
	const handleHeaderSelect = (fieldName: string, value: string) => {
		setSelectedHeaders((prev) => ({ ...prev, [fieldName]: value }));
	};

	// Submission logic
	const handleSubmit = async () => {
		setSubmitting(true);
		try {
			// TODO: Add real validation and backend submission here
			toast.success("Skip-traced list uploaded successfully!");
			setTimeout(() => {
				setSubmitting(false);
				onClose();
			}, 1000);
		} catch (err) {
			toast.error("Failed to upload skip-traced list");
			setSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
			<div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
				<button
					type="button"
					className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
					onClick={onClose}
				>
					&times;
				</button>
				<h2 className="mb-4 font-semibold text-xl dark:text-white">
					Upload a skip-traced list
				</h2>
				<div className="flex-1 overflow-y-auto">
					{step === 0 && (
						<ListNameAndUploadStep
							listName={listName}
							onListNameChange={setListName}
							uploadedFile={uploadedFile}
							onFileDrop={(file) => setUploadedFile(file)}
							error={error}
							listNameError={errors.listName?.message}
							fileError={errors.skipTracedFile?.message}
							getRootProps={getRootProps}
							getInputProps={getInputProps}
						/>
					)}
					{step === 1 && (
						<FieldMappingStep
							headers={headers}
							selectedHeaders={selectedHeaders}
							onHeaderSelect={handleHeaderSelect}
							errors={errors}
						/>
					)}
					{step === 2 && (
						<ReviewAndSubmitStep
							listName={listName}
							uploadedFile={uploadedFile}
							selectedHeaders={selectedHeaders}
							onSubmit={handleSubmit}
							onBack={prevStep}
							submitting={submitting}
						/>
					)}
				</div>
				<div className="mt-6 flex items-center justify-between">
					<button
						type="button"
						className="rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
						onClick={prevStep}
						disabled={step === 0}
					>
						Back
					</button>
					{step < 2 ? (
						<button
							type="button"
							className="rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
							onClick={nextStep}
							disabled={step === 0 && (!listName.trim() || !uploadedFile)}
						>
							Next
						</button>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default SkipTraceModalMain;
