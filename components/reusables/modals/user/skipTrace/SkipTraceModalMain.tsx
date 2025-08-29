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
		| { type: "list"; file?: File }
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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-card p-6 text-foreground shadow-lg">
				<button
					type="button"
					className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
					onClick={handleClose}
				>
					&times;
				</button>

				{!currentFlow && (
					<>
						<h2 className="mb-4 text-xl font-semibold">Skip Trace</h2>
						<p className="mb-6 text-muted-foreground">
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
