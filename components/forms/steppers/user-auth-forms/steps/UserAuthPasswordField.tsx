import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

interface UserAuthPasswordFieldProps {
	loading: boolean;
}

// * Uses useFormContext() to access form control from React Hook Form context
export const UserAuthPasswordField: React.FC<UserAuthPasswordFieldProps> = ({
	loading,
}) => {
	const { control } = useFormContext();
	return (
		<FormField
			control={control}
			name="password"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Password</FormLabel>
					<FormControl>
						<Input
							disabled={loading}
							placeholder="Password"
							type="password"
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
