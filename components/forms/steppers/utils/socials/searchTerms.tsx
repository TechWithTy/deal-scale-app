import {
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { XIcon, Search } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface SearchTermsInputProps {
	form: any; // Form control object from react-hook-form
	loading: boolean; // Loading state
	minTerms?: number; // Minimum number of search terms required
	maxTerms?: number; // Maximum number of search terms allowed
	required?: boolean; // Whether this field is required
	fieldName?: string; // Form field name (defaults to "searchTerms")
}

/**
 * SearchTermsInput Component
 *
 * Allows users to enter search terms/keywords for SEO and campaign targeting.
 * Supports comma-separated values for bulk entry.
 *
 * @example
 * // Single entry
 * "real estate investing" → ["real estate investing"]
 *
 * @example
 * // Comma-separated
 * "wholesale deals, fix and flip, rental property" →
 * ["wholesale deals", "fix and flip", "rental property"]
 */
const SearchTermsInput: React.FC<SearchTermsInputProps> = ({
	form,
	loading,
	minTerms = 3,
	maxTerms = 15,
	required = false,
	fieldName = "searchTerms",
}) => {
	const [searchTerms, setSearchTerms] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState<string>("");

	// Load initial search terms from the form state
	useEffect(() => {
		const initialTerms = form.getValues(fieldName) || [];
		if (initialTerms.length > 0) {
			setSearchTerms(initialTerms);
		}
	}, [form, fieldName]);

	// Update form state when search terms change
	const updateFormSearchTerms = (updatedTerms: string[]) => {
		setSearchTerms(updatedTerms);
		form.setValue(fieldName, updatedTerms);
	};

	// Handle adding search term(s) - supports comma-separated values
	const handleAddSearchTerm = () => {
		const rawInput = inputValue.trim();
		if (!rawInput) return;

		// Split by comma to support CSV input
		const inputTerms = rawInput.split(",").map((term) => term.trim());

		const newSearchTerms: string[] = [];

		for (let term of inputTerms) {
			// Clean up the term
			term = term.trim();

			// Skip empty or duplicate terms
			if (
				!term ||
				searchTerms.includes(term) ||
				newSearchTerms.includes(term) // Prevent duplicates within this batch
			) {
				continue;
			}

			// Add term only if limit is not reached
			if (searchTerms.length + newSearchTerms.length < maxTerms) {
				newSearchTerms.push(term);
			} else {
				break; // Stop adding once limit is reached
			}
		}

		// Update search terms if any valid terms were found
		if (newSearchTerms.length > 0) {
			const updatedTerms = [...searchTerms, ...newSearchTerms];
			updateFormSearchTerms(updatedTerms);
			setInputValue(""); // Reset input after adding
		}
	};

	// Handle removing a search term
	const handleRemoveSearchTerm = (termToRemove: string) => {
		const updatedTerms = searchTerms.filter((term) => term !== termToRemove);
		updateFormSearchTerms(updatedTerms);
	};

	// Handle Enter key press for adding search terms
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddSearchTerm();
		}
		// Support backspace to delete last term when input is empty
		if (e.key === "Backspace" && inputValue === "" && searchTerms.length > 0) {
			e.preventDefault();
			handleRemoveSearchTerm(searchTerms[searchTerms.length - 1]);
		}
	};

	return (
		<FormField
			control={form.control}
			name={fieldName}
			render={({ field, fieldState: { error } }) => (
				<FormItem>
					<FormLabel className="flex items-center gap-2">
						<Search className="h-4 w-4" />
						{required
							? "Search Terms / Keywords (Required)"
							: "Search Terms / Keywords (Optional)"}
						<span className="ml-2 text-gray-500 text-xs dark:text-gray-400">
							{searchTerms.length}/{maxTerms} terms
						</span>
					</FormLabel>

					{/* Search Terms Input & Button */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<input
								type="text"
								placeholder="Enter keywords (comma-separated or press Enter)"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								onKeyDown={handleKeyPress}
								disabled={loading || searchTerms.length >= maxTerms}
								className="block w-full rounded border border-gray-300 px-3 py-2 text-gray-700 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
							/>
							<button
								type="button"
								onClick={handleAddSearchTerm}
								disabled={loading || searchTerms.length >= maxTerms}
								className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
							>
								+
							</button>
						</div>
						<p className="text-muted-foreground text-xs">
							💡 Tip: Add keywords your target audience searches for (e.g.
							"wholesale real estate, investment properties, fix and flip")
						</p>
					</div>

					{/* Display search terms */}
					<div className="mt-2 flex flex-wrap gap-2">
						{searchTerms.map((term, index) => (
							<div
								key={index}
								className="flex items-center rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5"
							>
								<Search className="mr-1.5 h-3 w-3 text-primary" />
								<span className="text-foreground text-sm">{term}</span>
								<button
									type="button"
									onClick={() => handleRemoveSearchTerm(term)}
									className="ml-2 text-muted-foreground hover:text-foreground"
								>
									<XIcon className="h-4 w-4" />
								</button>
							</div>
						))}
					</div>

					{/* Validation & Error Messages */}
					{searchTerms.length < minTerms && required && (
						<p className="text-red-500 text-sm">
							Please add at least {minTerms} search terms.
						</p>
					)}
					{error && <FormMessage>{error.message}</FormMessage>}

					{/* Helper Text */}
					{searchTerms.length === 0 && (
						<div className="mt-3 rounded-md bg-muted/50 p-3">
							<p className="font-medium text-sm">What are search terms?</p>
							<p className="mt-1 text-muted-foreground text-xs leading-relaxed">
								Search terms are keywords your target audience uses when
								searching online. They help optimize your content for search
								engines (SEO) and improve ad targeting. Examples: "real estate
								investing", "wholesale properties", "fix and flip loans"
							</p>
						</div>
					)}
				</FormItem>
			)}
		/>
	);
};

export default SearchTermsInput;
