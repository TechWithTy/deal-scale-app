/**
 * Inline Chip Editor Component
 * A rich text editor that renders variables and tools as inline chips
 * with color-coding and single-element deletion
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
	type ClipboardEvent,
	type KeyboardEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/_utils";

export type ChipType =
	| "variable"
	| "tool"
	| "function"
	| "parameter"
	| "script"
	| "agent"
	| "resource"
	| "automation";

export interface ChipDefinition {
	key: string;
	label: string;
	description?: string;
	type: ChipType;
	icon?: React.ReactNode;
}

interface InlineChipEditorProps {
	id?: string;
	label?: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	availableChips: ChipDefinition[];
	error?: string;
	helpText?: string;
	className?: string;
	disabled?: boolean;
	minHeight?: string;
	maxHeight?: string;
}

// Color schemes for different chip types using theme-aware variants
const chipColorMap: Record<
	ChipType,
	{ variant: string; label: string; hue: string }
> = {
	variable: {
		variant: "chip-variant-variable",
		label: "Variable",
		hue: "blue", // Blue variant - keys/leads/data
	},
	tool: {
		variant: "chip-variant-tool",
		label: "Tool",
		hue: "green", // Green variant - actions/tools
	},
	function: {
		variant: "chip-variant-function",
		label: "Function",
		hue: "purple", // Purple variant - resource calls/functions
	},
	parameter: {
		variant: "chip-variant-parameter",
		label: "Parameter",
		hue: "orange", // Orange variant - parameters
	},
	script: {
		variant: "chip-variant-script",
		label: "Script",
		hue: "rose", // Rose/pink variant - sales scripts/prompts
	},
	agent: {
		variant: "chip-variant-agent",
		label: "Agent",
		hue: "orange", // Orange variant - A2A agents
	},
	resource: {
		variant: "chip-variant-resource",
		label: "Resource",
		hue: "cyan", // Cyan variant - knowledge base/files
	},
	automation: {
		variant: "chip-variant-automation",
		label: "Automation",
		hue: "indigo", // Indigo variant - workflows/automations
	},
};

interface Segment {
	type: "text" | "chip";
	content: string;
	chipDef?: ChipDefinition;
	index: number;
}

export function InlineChipEditor({
	id = "inline-chip-editor",
	label,
	value,
	onChange,
	placeholder = "Type or insert chips...",
	availableChips,
	error,
	helpText,
	className = "",
	disabled = false,
	minHeight = "100px",
	maxHeight = "300px",
}: InlineChipEditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);
	const [cursorPosition, setCursorPosition] = useState(0);
	const [isFocused, setIsFocused] = useState(false);

	// Parse text to extract segments (text and chips)
	const segments = useMemo<Segment[]>(() => {
		const result: Segment[] = [];
		let lastIndex = 0;
		let segmentIndex = 0;

		// Match both {variable} and {{variable}} patterns
		const chipRegex = /\{\{?(\w+)\}?\}/g;
		let match;

		while ((match = chipRegex.exec(value)) !== null) {
			// Add text before the chip
			if (match.index > lastIndex) {
				result.push({
					type: "text",
					content: value.substring(lastIndex, match.index),
					index: segmentIndex++,
				});
			}

			// Add the chip
			const chipKey = match[1];
			const chipDef = availableChips.find((c) => c.key === chipKey);
			result.push({
				type: "chip",
				content: chipKey,
				chipDef,
				index: segmentIndex++,
			});

			lastIndex = match.index + match[0].length;
		}

		// Add remaining text
		if (lastIndex < value.length) {
			result.push({
				type: "text",
				content: value.substring(lastIndex),
				index: segmentIndex++,
			});
		}

		// If no content, add empty text segment
		if (result.length === 0) {
			result.push({
				type: "text",
				content: "",
				index: 0,
			});
		}

		return result;
	}, [value, availableChips]);

	// Handle contentEditable input
	const handleInput = useCallback(
		(e: React.FormEvent<HTMLDivElement>) => {
			const text = e.currentTarget.textContent || "";
			// Auto-convert {variable} to {{variable}}
			const normalized = text.replace(/\{(\w+)\}/g, "{{$1}}");
			if (normalized !== value) {
				onChange(normalized);
			}
		},
		[value, onChange],
	);

	// Handle paste
	const handlePaste = useCallback((e: ClipboardEvent<HTMLDivElement>) => {
		e.preventDefault();
		const pastedText = e.clipboardData.getData("text/plain");

		// Convert {variable} to {{variable}}
		const normalized = pastedText.replace(/\{(\w+)\}/g, "{{$1}}");

		// Insert at cursor position
		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			range.deleteContents();
			const textNode = document.createTextNode(normalized);
			range.insertNode(textNode);
			range.setStartAfter(textNode);
			range.collapse(true);
			selection.removeAllRanges();
			selection.addRange(range);

			// Trigger input event
			if (editorRef.current) {
				const event = new Event("input", { bubbles: true });
				editorRef.current.dispatchEvent(event);
			}
		}
	}, []);

	// Handle keydown for chip deletion
	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLDivElement>) => {
			if (e.key === "Backspace" || e.key === "Delete") {
				const selection = window.getSelection();
				if (!selection || selection.rangeCount === 0) return;

				const range = selection.getRangeAt(0);
				const { startContainer, startOffset } = range;

				// Check if we're about to delete a chip
				if (e.key === "Backspace" && startOffset === 0) {
					const prevNode = startContainer.previousSibling;
					if (
						prevNode &&
						prevNode.nodeType === Node.ELEMENT_NODE &&
						(prevNode as HTMLElement).hasAttribute("data-chip-key")
					) {
						e.preventDefault();
						const chipKey = (prevNode as HTMLElement).getAttribute(
							"data-chip-key",
						);
						if (chipKey) {
							// Remove first occurrence of chip
							const regex = new RegExp(`\\{\\{?${chipKey}\\}?\\}`, "");
							onChange(value.replace(regex, ""));
						}
						return;
					}
				}

				// Check if cursor is at a chip boundary
				const text = value;
				let textPosition = 0;
				for (const segment of segments) {
					if (segment.type === "chip") {
						const chipLength = `{{${segment.content}}}`.length;
						if (e.key === "Backspace" && textPosition === startOffset) {
							e.preventDefault();
							const regex = new RegExp(`\\{\\{?${segment.content}\\}?\\}`, "");
							onChange(value.replace(regex, ""));
							return;
						}
						textPosition += chipLength;
					} else {
						textPosition += segment.content.length;
					}
				}
			}
		},
		[value, segments, onChange],
	);

	// Delete specific chip
	const deleteChip = useCallback(
		(chipKey: string, occurrence: number) => {
			const regex = new RegExp(`\\{\\{?${chipKey}\\}?\\}`, "g");
			let count = 0;
			const newValue = value.replace(regex, (match) => {
				if (count === occurrence) {
					count++;
					return "";
				}
				count++;
				return match;
			});
			onChange(newValue);
		},
		[value, onChange],
	);

	// Sync content when value changes externally
	useEffect(() => {
		if (editorRef.current && document.activeElement !== editorRef.current) {
			const currentText = editorRef.current.textContent || "";
			// Only update if the text content is different
			const textWithoutChips = value.replace(/\{\{?\w+\}?\}/g, "");
			if (currentText !== value && !currentText.includes("{{")) {
				// Don't override while user is typing
				return;
			}
		}
	}, [value]);

	// Track which occurrence of each chip we're rendering
	const chipOccurrences = useMemo(() => {
		const occurrences = new Map<string, number>();
		return segments.map((segment) => {
			if (segment.type === "chip") {
				const key = segment.content;
				const occurrence = occurrences.get(key) || 0;
				occurrences.set(key, occurrence + 1);
				return occurrence;
			}
			return 0;
		});
	}, [segments]);

	return (
		<div className={className}>
			{label && (
				<Label htmlFor={id} className="text-sm">
					{label}
				</Label>
			)}
			<div
				ref={editorRef}
				id={id}
				contentEditable={!disabled}
				suppressContentEditableWarning
				onInput={handleInput}
				onPaste={handlePaste}
				onKeyDown={handleKeyDown}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				className={cn(
					"mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
					"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
					"overflow-y-auto whitespace-pre-wrap break-words",
					"font-mono leading-relaxed",
					disabled && "cursor-not-allowed opacity-50",
					error && "border-destructive focus-visible:ring-destructive",
				)}
				style={{
					minHeight,
					maxHeight,
				}}
			>
				{segments.length === 0 ||
				(segments.length === 1 && !segments[0].content)
					? // Show placeholder when empty
						!isFocused && (
							<span className="text-muted-foreground pointer-events-none select-none">
								{placeholder}
							</span>
						)
					: // Render segments with chips
						segments.map((segment, idx) => {
							if (segment.type === "chip" && segment.chipDef) {
								const colorConfig =
									chipColorMap[segment.chipDef.type] || chipColorMap.variable;
								const occurrence = chipOccurrences[idx];

								return (
									<span
										key={`${segment.content}-${segment.index}`}
										contentEditable={false}
										data-chip-key={segment.content}
										data-chip-occurrence={occurrence}
										data-chip-type={segment.chipDef.type}
										data-chip-hue={colorConfig.hue}
										className={cn(
											colorConfig.variant,
											"inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 mx-0.5 align-middle",
											"text-xs font-semibold cursor-pointer select-none",
											"hover:opacity-80 transition-all",
											"group relative",
										)}
										style={{
											backgroundColor: `hsl(var(--chip-bg) / 0.2)`,
											color: `hsl(var(--chip-text))`,
											borderColor: `hsl(var(--chip-border) / 0.4)`,
										}}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											deleteChip(segment.content, occurrence);
										}}
										title={`${colorConfig.label}: ${segment.chipDef.description}`}
									>
										{segment.chipDef.icon && (
											<span className="inline-flex shrink-0 items-center justify-center">
												{segment.chipDef.icon}
											</span>
										)}
										<span className="font-mono">{`{{${segment.content}}}`}</span>
										<X className="h-2.5 w-2.5 inline-flex shrink-0 ml-0.5 opacity-60 group-hover:opacity-100 hover:text-destructive transition-opacity" />
									</span>
								);
							}
							return (
								<span key={`text-${segment.index}`} data-text-segment>
									{segment.content}
								</span>
							);
						})}
			</div>
			{error && <p className="mt-1 text-destructive text-xs">{error}</p>}
			{helpText && (
				<p className="mt-1 text-muted-foreground text-xs">{helpText}</p>
			)}
		</div>
	);
}
