import { cn } from "@/lib/_utils";
import type React from "react";

interface BareDropdownProps {
	value: string;
	onChange: (value: string) => void;
	options: string[];
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

const BareDropdown: React.FC<BareDropdownProps> = ({
	value,
	onChange,
	options,
	placeholder = "Select an option",
	className = "",
	disabled = false,
}) => (
	<select
		value={value}
		onChange={(e) => onChange(e.target.value)}
		className={cn(
			"mt-1 block w-full rounded-lg border border-border bg-background px-4 py-2 text-base text-foreground shadow-sm transition placeholder:text-muted-foreground hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary",
			className,
		)}
		disabled={disabled}
	>
		<option value="" disabled className="text-muted-foreground">
			{placeholder}
		</option>
		{options.map((option) => (
			<option
				key={option}
				value={option}
				className="cursor-pointer bg-card text-foreground hover:bg-primary/10"
			>
				{option}
			</option>
		))}
	</select>
);

export default BareDropdown;
