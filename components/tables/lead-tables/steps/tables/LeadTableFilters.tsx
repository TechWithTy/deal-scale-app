import { Input } from "@/components/ui/input";
import type React from "react";

interface LeadTableFiltersProps {
	searchKey: string;
	searchValue: string;
	onChange: (value: string) => void;
}

export const LeadTableFilters: React.FC<LeadTableFiltersProps> = ({
	searchKey,
	searchValue,
	onChange,
}) => (
	<Input
		placeholder={`Search ${searchKey}...`}
		value={searchValue}
		onChange={(e) => onChange(e.target.value)}
		className="w-full md:max-w-sm"
	/>
);
