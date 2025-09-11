"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import ListTraceFlow from "./flows/ListTraceFlow";
import SingleTraceFlow from "./flows/SingleTraceFlow";

// * Define the type for the flows available
type Flow = "list" | "single" | null;

interface SkipTraceModalMainProps {
	isOpen: boolean;
	onClose: () => void;
	initialData?:
		| {
				type: "list";
				file?: File;
				availableListNames?: string[];
				availableFields?: string[];
		  }
		| ({ type: "single" } & Partial<
				Record<
					| "firstName"
					| "lastName"
					| "address"
					| "email"
					| "phone"
					| "socialMedia"
					| "domain"
					| "listName",
					string
				>
		  > & { availableListNames?: string[] });
}

const SkipTraceModalMain: React.FC<SkipTraceModalMainProps> = ({
	isOpen,
	onClose,
	initialData,
}) => {
	const [currentFlow, setCurrentFlow] = useState<Flow>(
		initialData?.type ?? "list",
	);

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

	const content = (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="relative z-[101] flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-card p-6 text-foreground shadow-lg">
				<button
					type="button"
					className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
					onClick={handleClose}
				>
					&times;
				</button>

				{currentFlow === "list" && (
					<ListTraceFlow
						onClose={handleClose}
						onBack={handleBack}
						initialFile={
							initialData?.type === "list" ? initialData.file : undefined
						}
						initialListMode={(() => {
							// 1) Explicit intent override when provided by launcher
							const hasIntent = Boolean(
								initialData &&
									typeof initialData === "object" &&
									"intent" in (initialData as Record<string, unknown>),
							);
							if (hasIntent) {
								const intent = (initialData as { intent?: string }).intent;
								if (intent === "add_lead") return "create" as const;
								if (intent === "skip_trace") return "select" as const;
							}

							// 2) Fallback: infer from incoming lists/counts
							const hasNames = Boolean(
								initialData &&
									typeof initialData === "object" &&
									"availableListNames" in
										(initialData as Record<string, unknown>) &&
									(initialData as { availableListNames?: string[] })
										.availableListNames?.length,
							);
							const hasLists = Boolean(
								initialData &&
									typeof initialData === "object" &&
									"availableLists" in
										(initialData as Record<string, unknown>) &&
									(
										initialData as {
											availableLists?: { name: string; count: number }[];
										}
									).availableLists?.length,
							);
							const hasCounts = Boolean(
								initialData &&
									typeof initialData === "object" &&
									"listCounts" in (initialData as Record<string, unknown>) &&
									Object.keys(
										(initialData as { listCounts?: Record<string, number> })
											.listCounts ?? {},
									).length,
							);
							return hasNames || hasLists || hasCounts ? "select" : "create";
						})()}
						availableListNames={
							initialData &&
							typeof initialData === "object" &&
							"availableListNames" in (initialData as Record<string, unknown>)
								? (initialData as { availableListNames?: string[] })
										.availableListNames
								: undefined
						}
						availableFields={
							initialData &&
							typeof initialData === "object" &&
							"availableFields" in (initialData as Record<string, unknown>)
								? (initialData as { availableFields?: string[] })
										.availableFields
								: undefined
						}
						availableLists={
							initialData &&
							typeof initialData === "object" &&
							"availableLists" in (initialData as Record<string, unknown>)
								? (
										initialData as {
											availableLists?: { name: string; count: number }[];
										}
									).availableLists
								: undefined
						}
						availableLeadCount={
							initialData &&
							typeof initialData === "object" &&
							"availableLeadCount" in (initialData as Record<string, unknown>)
								? (initialData as { availableLeadCount?: number })
										.availableLeadCount
								: undefined
						}
						listCounts={
							initialData &&
							typeof initialData === "object" &&
							"listCounts" in (initialData as Record<string, unknown>)
								? (initialData as { listCounts?: Record<string, number> })
										.listCounts
								: undefined
						}
					/>
				)}

				{currentFlow === "single" && (
					<SingleTraceFlow
						onClose={handleClose}
						onBack={handleBack}
						initialData={
							initialData &&
							typeof initialData === "object" &&
							"type" in initialData &&
							initialData.type === "single"
								? initialData
								: undefined
						}
						availableListNames={
							initialData &&
							typeof initialData === "object" &&
							"availableListNames" in (initialData as Record<string, unknown>)
								? (initialData as { availableListNames?: string[] })
										.availableListNames
								: undefined
						}
						availableLists={
							initialData &&
							typeof initialData === "object" &&
							"availableLists" in (initialData as Record<string, unknown>)
								? (
										initialData as {
											availableLists?: { name: string; count: number }[];
										}
									).availableLists
								: undefined
						}
						availableLeadCount={
							initialData &&
							typeof initialData === "object" &&
							"availableLeadCount" in (initialData as Record<string, unknown>)
								? (initialData as { availableLeadCount?: number })
										.availableLeadCount
								: undefined
						}
						listCounts={
							initialData &&
							typeof initialData === "object" &&
							"listCounts" in (initialData as Record<string, unknown>)
								? (initialData as { listCounts?: Record<string, number> })
										.listCounts
								: undefined
						}
					/>
				)}
			</div>
		</div>
	);

	if (typeof window !== "undefined" && typeof document !== "undefined") {
		return createPortal(content, document.body);
	}
	return content;
};

export default SkipTraceModalMain;
