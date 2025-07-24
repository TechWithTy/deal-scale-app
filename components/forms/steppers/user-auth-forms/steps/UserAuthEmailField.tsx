import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

interface UserAuthEmailFieldProps {
	loading: boolean;
}

// * Uses useFormContext() to access form control from React Hook Form context
export const UserAuthEmailField: React.FC<UserAuthEmailFieldProps> = ({
	loading,
}) => {
	const { control } = useFormContext();
	return (
		<FormField
			control={control}
			name="email"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Email</FormLabel>
					<FormControl>
						<Input
							disabled={loading}
							placeholder="Email"
							type="email"
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
