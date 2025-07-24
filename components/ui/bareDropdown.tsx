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
		className={`mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-gray-900 shadow-sm transition hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 ${className}`}
		disabled={disabled}
	>
		<option value="" disabled className="text-gray-400 dark:text-gray-500">
			{placeholder}
		</option>
		{options.map((option) => (
			<option
				key={option}
				value={option}
				className="cursor-pointer bg-white text-gray-900 hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-blue-900"
			>
				{option}
			</option>
		))}
	</select>
);

export default BareDropdown;
