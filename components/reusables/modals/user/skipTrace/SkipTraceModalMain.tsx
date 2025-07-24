import { useState } from "react";
import Papa from "papaparse"; // ! CSV parsing
import * as XLSX from "xlsx"; // ! Excel parsing
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import FieldMappingStep from "./steps/FieldMappingStep";
import ListNameAndUploadStep from "./steps/ListNameAndUploadStep";
import ReviewAndSubmitStep from "./steps/ReviewAndSubmitStep";

const SkipTraceModalMain = ({
	isOpen,
	onClose,
}: { isOpen: boolean; onClose: () => void }) => {
	// * Track if all required fields are mapped in field mapping step
	const [canProceedFieldMapping, setCanProceedFieldMapping] = useState(false);
	const [step, setStep] = useState(0);
	const [listName, setListName] = useState("");
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);

	// Live validation for list name
	const handleListNameChange = (value: string) => {
		setListName(value);
		setErrors((prev) => ({
			...prev,
			listName: {
				message: !value.trim()
					? "List name is required"
					: value.trim().length < 3
						? "List name must be at least 3 characters"
						: "",
			},
		}));
	};

	// Live validation for file upload
	const handleFileDrop = (file: File | null) => {
		setUploadedFile(file);
		setErrors((prev) => ({
			...prev,
			skipTracedFile: {
				message: !file ? "File upload is required" : "",
			},
		}));
	};
	const [headers, setHeaders] = useState<string[]>([]);
	const [selectedHeaders, setSelectedHeaders] = useState<
		Record<string, string | undefined>
	>({});
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, { message?: string }>>(
		{},
	);

	// ! Dropzone setup with robust header extraction for CSV and Excel
	const onDrop = async (acceptedFiles: File[]) => {
		if (acceptedFiles.length) {
			const file = acceptedFiles[0];
			setUploadedFile(file);
			try {
				let extractedHeaders: string[] = [];
				const fileName = file.name.toLowerCase();
				if (fileName.endsWith(".csv")) {
					// Parse CSV file and extract headers
					Papa.parse(file, {
						complete: (results) => {
							if (Array.isArray(results.data) && results.data.length > 0) {
								// ! Preserve all columns, replace empty headers, trim whitespace
								extractedHeaders = (results.data[0] as string[]).map((h, i) => {
									if (typeof h === "string" && h.trim() !== "") return h.trim();
									return `__EMPTY_${i}`;
								});
								console.log("Extracted CSV Headers:", extractedHeaders);
								const headerSet = new Set<string>();
								const duplicates = extractedHeaders.filter(
									(h, i, arr) => arr.indexOf(h) !== i && h !== "",
								);
								if (duplicates.length > 0) {
									setError(
										`Duplicate headers detected: ${duplicates.join(", ")}`,
									);
								} else {
									setError(null);
								}
								setHeaders(extractedHeaders);
							} else {
								setError("No headers found in CSV");
								setHeaders([]);
							}
						},
						header: false,
						skipEmptyLines: true,
					});
				} else if (fileName.endsWith(".xlsx")) {
					// Parse Excel file and extract headers
					const reader = new FileReader();
					reader.onload = (e) => {
						const data = new Uint8Array(e.target?.result as ArrayBuffer);
						const workbook = XLSX.read(data, { type: "array" });
						const firstSheetName = workbook.SheetNames[0];
						const worksheet = workbook.Sheets[firstSheetName];
						const sheetJson = XLSX.utils.sheet_to_json(worksheet, {
							header: 1,
						});
						if (Array.isArray(sheetJson) && sheetJson.length > 0) {
							// ! Preserve all columns, replace empty headers, trim whitespace
							extractedHeaders = (sheetJson[0] as string[]).map((h, i) => {
								if (typeof h === "string" && h.trim() !== "") return h.trim();
								return `__EMPTY_${i}`;
							});
							console.log("Extracted Excel Headers:", extractedHeaders);
							const headerSet = new Set<string>();
							const duplicates = extractedHeaders.filter(
								(h, i, arr) => arr.indexOf(h) !== i && h !== "",
							);
							if (duplicates.length > 0) {
								setError(
									`Duplicate headers detected: ${duplicates.join(", ")}`,
								);
							} else {
								setError(null);
							}
							setHeaders(extractedHeaders);
						} else {
							setError("No headers found in Excel sheet");
							setHeaders([]);
						}
					};
					reader.onerror = () => {
						setError("Error reading Excel file");
						setHeaders([]);
					};
					reader.readAsArrayBuffer(file);
				} else {
					setError("Unsupported file type. Please upload a CSV or Excel file.");
					setHeaders([]);
				}
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
							onListNameChange={handleListNameChange}
							uploadedFile={uploadedFile}
							onFileDrop={handleFileDrop}
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
							onCanProceedChange={setCanProceedFieldMapping}
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
					{step < 2 && (
						<div className="mt-6 flex items-center justify-between gap-4">
							<button
								type="button"
								className="rounded-md border bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								onClick={prevStep}
								disabled={step === 0}
							>
								Back
							</button>
							<button
								type="button"
								className="rounded-md bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								onClick={nextStep}
								disabled={
									(step === 0 &&
										(!!errors.listName?.message ||
											!!errors.skipTracedFile?.message ||
											!listName.trim() ||
											!uploadedFile)) ||
									(step === 1 && !canProceedFieldMapping)
								}
							>
								Next
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SkipTraceModalMain;
