import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { handleListUpload } from "@/lib/_utils/files/extractheadrsFromFiles";
import { leadSchema } from "@/types/zod/leadSchema";
import { zodResolver } from "@hookform/resolvers/zod";
/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Define the form values type
interface FormValues {
	listName: string;
	skipTracedFile: File;
	firstNameField: string;
	lastNameField: string;
	streetAddressField: string;
	cityField: string;
	stateField: string;
	zipCodeField: string;
	phone1Field: string;
	phone2Field?: string;
	emailField?: string; // Optional email
	facebookField?: string; // Optional Facebook profile URL
	linkedinField?: string; // Optional LinkedIn profile URL
	instagramField?: string; // Optional Instagram profile URL
	twitterField?: string; // Optional Twitter profile URL
}

interface UploadListModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const UploadListModal: React.FC<UploadListModalProps> = ({
	isOpen,
	onClose,
}) => {
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [headers, setHeaders] = useState<string[]>([]);
	const [selectedHeaders, setSelectedHeaders] = useState<
		Record<string, string | undefined>
	>({});
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		watch,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(leadSchema),
		mode: "onSubmit",
	});

	const listName = watch("listName");
	const areRequiredFieldsFilled =
		listName?.trim() &&
		uploadedFile &&
		Object.values(selectedHeaders).every(Boolean);

	// Handling file drop
	const onDrop = async (acceptedFiles: File[]) => {
		if (acceptedFiles.length) {
			const file = acceptedFiles[0];
			setUploadedFile(file);
			setValue("skipTracedFile", file); // Set the uploaded file in the form

			try {
				const extractedHeaders: string[] = await handleListUpload(file);
				setHeaders(extractedHeaders);
				setError(null);
			} catch (err) {
				setError("Error extracting headers from the file");
				setHeaders([]);
			}
		}
	};

	const formState = watch();

	// Setup dropzone
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

	// Ensure selected headers are registered with react-hook-form
	useEffect(() => {
		Object.entries(selectedHeaders).forEach(([key, value]) => {
			setValue(key as keyof FormValues, value || "");
		});
	}, [selectedHeaders, setValue]);

	const onSubmit: (data: FormValues) => void = (data) => {
		toast("Submitting form");

		if (!uploadedFile) {
			toast("Please upload a file");
			return;
		}

		try {
			// Validate the form data against the Zod schema
			leadSchema.parse(data);
			toast.success("Form submitted successfully!");
		} catch (validationError: any) {
			toast.error(
				"Validation failed: " + validationError.message || validationError,
			);
		}
	};

	// Handle header selection
	const handleHeaderSelect = (fieldName: string, value: string) => {
		setSelectedHeaders((prev) => ({
			...prev,
			[fieldName]: value,
		}));
	};

	// Exclude already selected headers from available options
	const getAvailableHeaders = (currentField: string) => {
		return headers.filter(
			(header) =>
				!Object.values(selectedHeaders).includes(header) ||
				selectedHeaders[currentField] === header,
		);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
			<div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
				{/* Close button */}
				<button
					className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
					onClick={onClose}
				>
					&times;
				</button>

				<h2 className="mb-4 text-xl font-semibold dark:text-white">
					Upload a skip-traced list
				</h2>
				<p className="mb-4 text-gray-500 dark:text-gray-400">
					The list you select must be skip-traced.
				</p>

				{/* Scrollable content */}
				<div className="flex-1 overflow-y-auto">
					<form onSubmit={handleSubmit(onSubmit)}>
						{/* List Name */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								List Name*
							</label>
							<Input
								placeholder="Give your list a friendly name"
								{...register("listName")}
							/>
							{errors.listName && (
								<p className="text-sm text-red-500">
									{errors.listName.message}
								</p>
							)}
						</div>

						{/* File Upload */}
						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Skip-traced list*
							</label>
							<div
								{...getRootProps()}
								className={`mt-2 border-2 border-dashed p-4 ${
									!listName?.trim()
										? "cursor-not-allowed bg-gray-200 dark:bg-gray-700"
										: "cursor-pointer border-gray-300 dark:border-gray-600"
								}`}
							>
								<input {...getInputProps()} disabled={!listName?.trim()} />
								{uploadedFile ? (
									<p>{uploadedFile.name}</p>
								) : (
									<p>Provide a valid List Name to enable uploading</p>
								)}
							</div>
							{errors.skipTracedFile && (
								<p className="text-sm text-red-500">
									{errors.skipTracedFile.message}
								</p>
							)}
						</div>

						{/* Fields Mapping */}
						<div className="mt-4 grid grid-cols-2 gap-4">
							<FieldMappingSelect
								label="First Name"
								placeholder="Match first name"
								headers={getAvailableHeaders("firstNameField")}
								onChange={(value) =>
									handleHeaderSelect("firstNameField", value)
								}
								value={selectedHeaders.firstNameField}
								error={errors.firstNameField}
							/>
							<FieldMappingSelect
								label="Last Name"
								placeholder="Match last name"
								headers={getAvailableHeaders("lastNameField")}
								onChange={(value) => handleHeaderSelect("lastNameField", value)}
								value={selectedHeaders.lastNameField}
								error={errors.lastNameField}
							/>
							<FieldMappingSelect
								label="Street Address"
								placeholder="Match street address"
								headers={getAvailableHeaders("streetAddressField")}
								onChange={(value) =>
									handleHeaderSelect("streetAddressField", value)
								}
								value={selectedHeaders.streetAddressField}
								error={errors.streetAddressField}
							/>
							<FieldMappingSelect
								label="City"
								placeholder="Match city"
								headers={getAvailableHeaders("cityField")}
								onChange={(value) => handleHeaderSelect("cityField", value)}
								value={selectedHeaders.cityField}
								error={errors.cityField}
							/>
							<FieldMappingSelect
								label="State"
								placeholder="Match state"
								headers={getAvailableHeaders("stateField")}
								onChange={(value) => handleHeaderSelect("stateField", value)}
								value={selectedHeaders.stateField}
								error={errors.stateField}
							/>
							<FieldMappingSelect
								label="Zip Code"
								placeholder="Match ZIP code"
								headers={getAvailableHeaders("zipCodeField")}
								onChange={(value) => handleHeaderSelect("zipCodeField", value)}
								value={selectedHeaders.zipCodeField}
								error={errors.zipCodeField}
							/>
							<FieldMappingSelect
								label="Phone 1"
								placeholder="Match phone 1"
								headers={getAvailableHeaders("phone1Field")}
								onChange={(value) => handleHeaderSelect("phone1Field", value)}
								value={selectedHeaders.phone1Field}
								error={errors.phone1Field}
							/>
							<FieldMappingSelect
								label="Phone 2"
								placeholder="Match phone 2"
								headers={getAvailableHeaders("phone2Field")}
								onChange={(value) => handleHeaderSelect("phone2Field", value)}
								value={selectedHeaders.phone2Field}
							/>
							<FieldMappingSelect
								label="Email"
								placeholder="Match email"
								headers={getAvailableHeaders("emailField")}
								onChange={(value) => handleHeaderSelect("emailField", value)}
								value={selectedHeaders.emailField}
							/>

							{/* Social Media Fields */}
							<FieldMappingSelect
								label="Facebook (Optional)"
								placeholder="Match Facebook profile"
								headers={getAvailableHeaders("facebookField")}
								onChange={(value) => handleHeaderSelect("facebookField", value)}
								value={selectedHeaders.facebookField}
							/>
							<FieldMappingSelect
								label="LinkedIn (Optional)"
								placeholder="Match LinkedIn profile"
								headers={getAvailableHeaders("linkedinField")}
								onChange={(value) => handleHeaderSelect("linkedinField", value)}
								value={selectedHeaders.linkedinField}
							/>
							<FieldMappingSelect
								label="Instagram (Optional)"
								placeholder="Match Instagram profile"
								headers={getAvailableHeaders("instagramField")}
								onChange={(value) =>
									handleHeaderSelect("instagramField", value)
								}
								value={selectedHeaders.instagramField}
							/>
							<FieldMappingSelect
								label="Twitter (Optional)"
								placeholder="Match Twitter profile"
								headers={getAvailableHeaders("twitterField")}
								onChange={(value) => handleHeaderSelect("twitterField", value)}
								value={selectedHeaders.twitterField}
							/>
						</div>

						<Button
							disabled={!areRequiredFieldsFilled}
							type="submit"
							className={`mt-4 ${
								!areRequiredFieldsFilled
									? "bg-gray-400"
									: "bg-blue-600 text-white hover:bg-blue-700"
							}`}
						>
							Upload
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
};

// Field Mapping Select Component
const FieldMappingSelect: React.FC<{
	label: string;
	placeholder: string;
	headers: string[];
	onChange: (value: string) => void;
	value?: string;
	error?: any;
}> = ({ label, placeholder, headers, onChange, value, error }) => {
	return (
		<div>
			<label className="block text-sm font-medium dark:text-gray-300">
				{label}*
			</label>
			<Select value={value} onValueChange={onChange} disabled={!headers.length}>
				<SelectTrigger className="w-full dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{headers.map((header, index) => (
							<SelectItem key={index} value={header}>
								{header}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			{error && <p className="text-sm text-red-500">{error.message}</p>}
		</div>
	);
};

export default UploadListModal;
