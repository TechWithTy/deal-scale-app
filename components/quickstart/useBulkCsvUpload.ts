"use client";

import { useCallback } from "react";
import type { ChangeEvent } from "react";
import { toast } from "sonner";

interface UseBulkCsvUploadParams {
	readonly onFileChange: (file: File | null) => void;
	readonly onHeadersParsed: (headers: string[]) => void;
	readonly onShowModal: () => void;
}

export const useBulkCsvUpload = ({
	onFileChange,
	onHeadersParsed,
	onShowModal,
}: UseBulkCsvUploadParams) =>
	useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			if (!file.name.endsWith(".csv") && !file.type.includes("csv")) {
				toast.error("Please select a CSV file");
				return;
			}

			onFileChange(file);

			const reader = new FileReader();
			reader.onload = (e) => {
				const csvText = e.target?.result as string;
				if (!csvText) return;

				const lines = csvText.split("\n").filter((line) => line.trim().length);
				if (lines.length === 0) {
					toast.error("CSV file appears to be empty");
					return;
				}

				const headers = lines[0]
					.split(",")
					.map((header) => header.trim().replace(/"/g, ""))
					.filter((header) => header.length > 0)
					.slice(0, 50);

				if (headers.length === 0) {
					toast.error("No valid headers found in CSV file");
					return;
				}

				onHeadersParsed(headers);
				toast.success(
					`Found ${headers.length} columns in CSV: ${headers
						.slice(0, 3)
						.join(", ")}${headers.length > 3 ? "..." : ""}`,
				);

				onShowModal();
			};

			reader.onerror = () => {
				toast.error("Error reading CSV file");
			};

			reader.readAsText(file);
		},
		[onFileChange, onHeadersParsed, onShowModal],
	);
