import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";

interface UserAuthPasswordFieldProps {
	form: UseFormReturn<any>;
	loading: boolean;
}

export const UserAuthPasswordField: React.FC<UserAuthPasswordFieldProps> = ({
	form,
	loading,
}) => (
	<FormField
		control={form.control}
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
