import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";

interface UserAuthEmailFieldProps {
	form: UseFormReturn<any>;
	loading: boolean;
}

export const UserAuthEmailField: React.FC<UserAuthEmailFieldProps> = ({
	form,
	loading,
}) => (
	<FormField
		control={form.control}
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
