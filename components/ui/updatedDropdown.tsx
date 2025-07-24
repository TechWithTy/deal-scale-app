import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FormItem, FormLabel, FormControl, FormMessage } from "./form";

interface UpdatedDropdownProps {
	label: string;
	placeholder: string;
	options: { id: string; name: string }[];
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	error?: string;
}

const UpdatedDropdown: React.FC<UpdatedDropdownProps> = ({
	label,
	placeholder,
	options,
	value,
	onChange,
	disabled,
	error,
}) => (
	<FormItem>
		<FormLabel>{label}</FormLabel>
		<Select
			disabled={disabled}
			onValueChange={onChange}
			value={value}
			defaultValue={value}
		>
			<FormControl>
				<SelectTrigger>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
			</FormControl>
			<SelectContent
				position="popper"
				side="bottom"
				avoidCollisions={false}
				className="max-h-56 overflow-y-auto"
			>
				{options.map((opt) => (
					<SelectItem key={opt.id} value={opt.id}>
						{opt.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
		<FormMessage>{error}</FormMessage>
	</FormItem>
);

export default UpdatedDropdown;
