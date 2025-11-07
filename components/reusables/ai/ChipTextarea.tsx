/**
 * Chip-based Textarea Component
 * A textarea that auto-converts {variable} and {{variable}} patterns to chips
 * with deletion support via backspace or clicking X
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import {
	type ChangeEvent,
	type ClipboardEvent,
	type KeyboardEvent,
	useCallback,
	useMemo,
	useRef,
} from "react";

export interface ChipItem {
	key: string;
	label: string;
	description?: string;
}

interface ChipTextareaProps {
	id?: string;
	label?: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	rows?: number;
	availableChips: ChipItem[];
	error?: string;
	helpText?: string;
	className?: string;
	disabled?: boolean;
	showChipsBelow?: boolean;
}

export function ChipTextarea({
	id = "chip-textarea",
	label,
	value,
	onChange,
	placeholder,
	rows = 4,
	availableChips,
	error,
	helpText,
	className = "",
	disabled = false,
	showChipsBelow = true,
}: ChipTextareaProps) {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	// Handle paste event - smart conversion that avoids nested braces
	const handlePaste = useCallback(
		(e: ClipboardEvent<HTMLTextAreaElement>) => {
			e.preventDefault();
			const pastedText = e.clipboardData.getData("text/plain");

			// Step 1: Smart conversion - only convert {word} that's NOT already {{word}}
			// Match {word} but NOT if it's already part of {{word}} or {{{word}}}
			// Use negative lookbehind and lookahead
			let normalizedText = pastedText.replace(
				/(?<!\{)\{(?!\{)(\w+)\}(?!\})/g,
				"{{$1}}",
			);

			// Step 2: Normalize {{ variable }} to {{variable}} (remove spaces around variable names)
			normalizedText = normalizedText.replace(/\{\{\s*(\w+)\s*\}\}/g, "{{$1}}");

			const textarea = e.currentTarget;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const currentValue = value || "";
			const newValue = `${currentValue.substring(0, start)}${normalizedText}${currentValue.substring(end)}`;

			onChange(newValue);

			setTimeout(() => {
				textarea.focus();
				const newPosition = start + normalizedText.length;
				textarea.setSelectionRange(newPosition, newPosition);
			}, 0);
		},
		[value, onChange],
	);

	// Handle textarea change - NO auto-conversion on keystroke to prevent nested braces
	const handleChange = useCallback(
		(e: ChangeEvent<HTMLTextAreaElement>) => {
			const inputValue = e.target.value;
			// Just pass through the value, let user type freely
			onChange(inputValue);
		},
		[onChange],
	);

	// Handle backspace to delete variable chips (only double braces)
	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Backspace") {
				const textarea = e.currentTarget;
				const start = textarea.selectionStart;
				const end = textarea.selectionEnd;

				// Only handle if cursor is at the same position (no selection)
				if (start === end && start > 0) {
					const text = value || "";
					const beforeCursor = text.substring(0, start);

					// Check if we're right after a valid {{variable}} pattern
					const variableMatch = beforeCursor.match(/\{\{(\w+)\}\}$/);
					if (variableMatch) {
						e.preventDefault();
						const varLength = variableMatch[0].length;
						const newText =
							beforeCursor.substring(0, beforeCursor.length - varLength) +
							text.substring(start);
						onChange(newText);

						setTimeout(() => {
							textarea.focus();
							const newPosition = start - varLength;
							textarea.setSelectionRange(newPosition, newPosition);
						}, 0);
					}
				}
			}
		},
		[value, onChange],
	);

	// Delete variable chip
	const deleteVariable = useCallback(
		(variableKey: string, index: number) => {
			const text = value || "";
			// Find and remove the variable occurrence at the given index (only double braces)
			const variableRegex = new RegExp(`\\{\\{${variableKey}\\}\\}`, "g");
			let match;
			let currentIndex = 0;
			let lastIndex = 0;
			let newText = "";

			while ((match = variableRegex.exec(text)) !== null) {
				if (currentIndex === index) {
					// Skip this occurrence
					newText += text.substring(lastIndex, match.index);
					lastIndex = match.index + match[0].length;
					break;
				}
				currentIndex++;
			}

			if (newText !== "" || lastIndex > 0) {
				newText += text.substring(lastIndex);
				onChange(newText);
			} else {
				// Fallback: remove all occurrences
				const fallbackText = text.replace(variableRegex, "");
				onChange(fallbackText);
			}
		},
		[value, onChange],
	);

	// Extract unique variables from description for chip display with type detection
	const variablesInText = useMemo(() => {
		const text = value || "";
		const variableMap = new Map<
			string,
			{ indices: number[]; chip: ChipItem }
		>();

		// Match {{variable}} with optional spaces: {{ variable }}, {{variable}}, etc.
		const variableRegex = /\{\{\s*(\w+)\s*\}\}/g;
		let match;
		let index = 0;

		while ((match = variableRegex.exec(text)) !== null) {
			const varKey = match[1]; // Captured group is the variable name (no spaces)

			// ONLY add if this variable exists in available chips
			const chip = availableChips.find((v) => v.key === varKey);
			if (!chip) {
				index++;
				continue; // Skip invalid variables
			}

			if (!variableMap.has(varKey)) {
				variableMap.set(varKey, { indices: [], chip });
			}
			variableMap.get(varKey)!.indices.push(index);
			index++;
		}

		// Return only valid variables
		return Array.from(variableMap.entries()).map(
			([key, { indices, chip }]) => ({
				key,
				indices,
				chip,
			}),
		);
	}, [value, availableChips]);

	return (
		<div className={className}>
			{label && (
				<Label htmlFor={id} className="text-sm">
					{label}
				</Label>
			)}
			<Textarea
				id={id}
				ref={textareaRef}
				placeholder={placeholder}
				rows={rows}
				className="mt-2 font-mono text-sm"
				value={value}
				onChange={handleChange}
				onPaste={handlePaste}
				onKeyDown={handleKeyDown}
				disabled={disabled}
			/>
			{/* Display variables as chips below textarea */}
			{showChipsBelow && variablesInText.length > 0 && (
				<div className="mt-2">
					<p className="mb-2 text-muted-foreground text-xs">
						Context in your prompt:
					</p>
					<div className="overflow-x-auto">
						<div className="flex min-w-max flex-nowrap gap-2 rounded-lg border bg-muted/30 p-2 sm:flex-wrap sm:min-w-0">
							{variablesInText.map(({ key, indices, chip }) => {
								// All chips here are guaranteed to be valid
								return indices.map((index) => (
									<Badge
										key={`${key}-${index}`}
										variant="secondary"
										className="shrink-0 gap-1 hover:bg-primary/20"
										title={chip.description}
									>
										{`{{${key}}}`}
										<X
											className="h-3 w-3 cursor-pointer hover:text-destructive"
											onClick={() => deleteVariable(key, index)}
										/>
									</Badge>
								));
							})}
						</div>
					</div>
				</div>
			)}
			{error && <p className="mt-1 text-destructive text-xs">{error}</p>}
			{helpText && (
				<p className="mt-1 text-muted-foreground text-xs">{helpText}</p>
			)}
		</div>
	);
}
