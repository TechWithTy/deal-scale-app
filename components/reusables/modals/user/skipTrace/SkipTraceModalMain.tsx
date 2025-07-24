"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ListTraceFlow from "./flows/ListTraceFlow";
import SingleTraceFlow from "./flows/SingleTraceFlow";

// * Define the type for the flows available
type Flow = "list" | "single" | null;

interface SkipTraceModalMainProps {
	isOpen: boolean;
	onClose: () => void;
	initialData?:
		| { type: "list"; file: File }
		| ({ type: "single" } & Partial<
				Record<
					| "firstName"
					| "lastName"
					| "address"
					| "email"
					| "phone"
					| "socialMedia"
					| "domain",
					string
				>
		  >);
}

const SkipTraceModalMain: React.FC<SkipTraceModalMainProps> = ({
	isOpen,
	onClose,
	initialData,
}) => {
	const [currentFlow, setCurrentFlow] = useState<Flow>(null);

	useEffect(() => {
		if (initialData) {
			setCurrentFlow(initialData.type);
		}
	}, [initialData]);

	const handleClose = () => {
		setCurrentFlow(null); // * Reset flow when closing
		onClose();
	};

	const handleBack = () => {
		setCurrentFlow(null); // * Go back to flow selection
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
			<div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
				<button
					type="button"
					className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
					onClick={handleClose}
				>
					&times;
				</button>

				{!currentFlow && (
					<>
						<h2 className="mb-4 font-semibold text-xl dark:text-white">
							Skip Trace
						</h2>
						<p className="mb-6 text-gray-600 dark:text-gray-300">
							Choose an option to begin.
						</p>
						<div className="flex flex-col space-y-4">
							<Button onClick={() => setCurrentFlow("list")} variant="outline">
								Skip Trace a List
							</Button>
							<Button
								onClick={() => setCurrentFlow("single")}
								variant="outline"
							>
								Skip Trace a Single Contact
							</Button>
						</div>
					</>
				)}

				{currentFlow === "list" && (
					<ListTraceFlow
						onClose={handleClose}
						onBack={handleBack}
						initialFile={
							initialData?.type === "list" ? initialData.file : undefined
						}
					/>
				)}

				{currentFlow === "single" && (
					<SingleTraceFlow
						onClose={handleClose}
						onBack={handleBack}
						initialData={
							initialData?.type === "single" ? initialData : undefined
						}
					/>
				)}
			</div>
		</div>
	);
};

export default SkipTraceModalMain;
