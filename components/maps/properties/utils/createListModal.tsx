"use client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { PropertyDetails } from "@/types/_dashboard/maps";
import { skipTraceSchema } from "@/types/zod/createListSkip";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

type SkipTraceFormProps = {
	properties: PropertyDetails[];
	availableListNames: string[] | undefined;
	costPerRecord: number;
	onClose: () => void; // Pass close function from parent
	useExistingList: boolean;
	setUseExistingList: React.Dispatch<React.SetStateAction<boolean>>;
};

const SkipTraceForm: React.FC<SkipTraceFormProps> = ({
	properties,
	availableListNames,
	costPerRecord,
	onClose,
	useExistingList,
	setUseExistingList,
}) => {
	console.log("SkipTraceForm rendered. useExistingList:", useExistingList); // * Debug: check for remounts
	const [targetList, setTargetList] = useState<string | null>(null); // Selected or created list
	const [newListName, setNewListName] = useState<string>(""); // New list name input
	const [recordsToSkip, setRecordsToSkip] = useState<number>(properties.length); // Default to max records
	const [redoSkipTrace, setRedoSkipTrace] = useState<boolean>(true); // Switch for redoing skip trace

	// Calculate total cost based on records to skip and cost per record
	const calculateCost = () => {
		const totalCost = (recordsToSkip * costPerRecord).toFixed(2);
		return Number(totalCost).toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};
	const handleSubmit = () => {
		const listToUse = useExistingList ? targetList : newListName;

		// Construct the data object for validation
		const formData = {
			newListName: listToUse,
			recordsToSkip: recordsToSkip,
			redoSkipTrace: redoSkipTrace,
			totalLeads: properties.length,
		};

		// Validate the form data against the Zod schema
		const validationResult = skipTraceSchema.safeParse(formData);

		if (!validationResult.success) {
			// Handle validation errors
			for (const error of validationResult.error.errors) {
				toast.error(error.message); // Display each error message using toast notifications
			}
			return;
		}

		// Close the dialog after validation succeeds
		onClose();
	};

	return (
		<>
			<p className="mb-4 text-gray-500 text-sm dark:text-gray-400">
				Skip trace and create a list.
			</p>

			{/* Switch for adding to an existing list */}
			{availableListNames && availableListNames.length >= 1 && (
				<div className="mb-4">
					<div className="flex items-center justify-between">
						<label
							htmlFor="use-existing-list"
							className="font-medium text-gray-700 text-sm dark:text-gray-300"
						>
							Add to an existing list({availableListNames.length}):
						</label>

						<label
							htmlFor="use-existing-list"
							className="relative inline-flex cursor-pointer items-center"
						>
							<input
								type="checkbox"
								checked={useExistingList}
								onChange={() => {
									setUseExistingList(!useExistingList);
								}}
								style={{
									width: 24,
									height: 24,
									zIndex: 10,
									position: "relative",
								}}
							/>
							{/* REMOVE the custom <div> and <span> for now */}
						</label>
					</div>
				</div>
			)}

			{/* Conditionally render the target list selector or new list name input */}
			{availableListNames &&
			availableListNames.length >= 1 &&
			useExistingList ? (
				<div className="mb-4">
					<label
						htmlFor="target-list"
						className="block font-medium text-gray-700 text-sm dark:text-gray-300"
					>
						Select a target list
					</label>

					<BareDropdown
						value={targetList || ""}
						onChange={setTargetList}
						options={availableListNames}
						placeholder="Select a list"
					/>
				</div>
			) : (
				<div className="mb-4">
					<label
						htmlFor="new-list-name"
						className="block font-medium text-gray-700 text-sm dark:text-gray-300"
					>
						New List Name
					</label>
					<Input
						type="text"
						value={newListName}
						onChange={(e) => setNewListName(e.target.value)}
						placeholder="Enter new list name"
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					/>
				</div>
			)}

			{/* Records to skip */}
			<div className="mb-4">
				<label
					htmlFor="records-to-skip"
					className="block font-medium text-gray-700 text-sm dark:text-gray-300"
				>
					Records to skip
				</label>
				<div className="flex items-center space-x-2">
					<Input
						type="number"
						value={recordsToSkip}
						onChange={(e) => setRecordsToSkip(Number(e.target.value))}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						min={1}
						max={properties.length}
					/>
					<span className="text-gray-500 text-sm dark:text-gray-400">
						/ {properties.length}
					</span>
				</div>
			</div>

			{/* Switch for redo skip trace */}
			<div className="mb-4 flex items-center">
				<label className="relative inline-flex cursor-pointer items-center">
					<input
						type="checkbox"
						id="redo-skip-trace"
						checked={redoSkipTrace}
						onChange={() => setRedoSkipTrace(!redoSkipTrace)}
						className="peer sr-only"
					/>
					<div className="h-6 w-11 rounded-full bg-gray-300 transition-colors duration-200 peer-checked:bg-blue-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:bg-gray-700" />
					<span
						className={`absolute top-0.5 left-0.5 h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
							redoSkipTrace ? "translate-x-5" : ""
						}`}
					/>
				</label>

				<label
					htmlFor="redo-skip-trace"
					className="ml-3 font-medium text-gray-700 text-sm dark:text-gray-300"
				>
					Don’t redo skip traces on data you’ve already purchased in the past 2
					months
				</label>
			</div>

			{/* Total credits */}
			<div className="mb-6">
				<p className="font-medium text-lg dark:text-white">
					Total Credits: <span className="text-blue-500">{recordsToSkip}</span>
				</p>
			</div>

			{/* Submit button */}
			<Button
				onClick={handleSubmit}
				className="w-full rounded-md bg-blue-500 py-2 text-white"
			>
				Create List
			</Button>
		</>
	);
};

import { useModalStore } from "@/lib/stores/leadSearch/leadListStore";
import BareDropdown from "@/components/ui/bareDropdown";

export type SkipTraceDialogProps = {
	properties: PropertyDetails[];
	availableListNames?: string[];
	costPerRecord: number;
};

const SkipTraceDialog: React.FC = () => {
	const [useExistingList, setUseExistingList] = useState(false);
	const { activeModal, modalProps, closeModal } = useModalStore();
	if (activeModal !== "skipTrace") return null;
	const {
		properties = [],
		availableListNames = [],
		costPerRecord = 0,
	} = modalProps as SkipTraceDialogProps;

	// Prevent opening modal if no properties are selected
	if (!properties.length) {
		closeModal();
		return null;
	}

	return (
		<Dialog open onOpenChange={closeModal}>
			<DialogContent className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 transform rounded-lg bg-white shadow-lg sm:max-w-[425px] dark:bg-gray-900 ">
				<DialogHeader className="flex w-full flex-row items-center justify-between">
					<DialogTitle className="dark:text-white">
						Create Your List
					</DialogTitle>
				</DialogHeader>
				<SkipTraceForm
					properties={properties}
					availableListNames={availableListNames}
					costPerRecord={costPerRecord}
					onClose={closeModal}
					useExistingList={useExistingList}
					setUseExistingList={setUseExistingList}
				/>
			</DialogContent>
		</Dialog>
	);
};

export default SkipTraceDialog;
