import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import { City, State } from "country-state-city";
import type React from "react";
import type { UseFormReturn } from "react-hook-form";

interface PersonalInfoFieldsProps {
	form: UseFormReturn<ProfileFormValues>;
	loading: boolean;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
	form,
	loading,
}) => {
	const selectedState = form.watch("state");
	const countryCode = "US";
	const stateList =
		State.getStatesOfCountry(countryCode)?.map((st) => ({
			id: st.isoCode,
			name: st.name,
		})) || [];
	const cityList =
		City.getCitiesOfState(countryCode, selectedState)?.map((city) => ({
			id: city.name,
			name: city.name,
		})) || [];

	return (
		<>
			<FormField
				control={form.control}
				name="firstName"
				render={({ field }) => (
					<FormItem>
						<FormLabel>First Name</FormLabel>
						<FormControl>
							<Input disabled={loading} placeholder="John" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="lastName"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Last Name</FormLabel>
						<FormControl>
							<Input disabled={loading} placeholder="Doe" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="email"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Email</FormLabel>
						<FormControl>
							<Input
								disabled={loading}
								placeholder="johndoe@gmail.com"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="personalNum"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Personal Phone Number</FormLabel>
						<FormControl>
							<Input
								type="number"
								placeholder="Enter your phone number"
								disabled={loading}
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="state"
				render={({ field }) => (
					<FormItem>
						<FormLabel>State</FormLabel>
						<Select
							disabled={loading}
							onValueChange={field.onChange}
							value={field.value}
							defaultValue={field.value}
						>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder="Select a state" />
								</SelectTrigger>
							</FormControl>
							<SelectContent
								position="popper"
								side="bottom"
								avoidCollisions={false}
								className="max-h-56 overflow-y-auto"
							>
								{stateList.map((state) => (
									<SelectItem key={state.id} value={state.id}>
										{state.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="city"
				render={({ field }) => (
					<FormItem>
						<FormLabel>City</FormLabel>
						<Select
							disabled={loading}
							onValueChange={field.onChange}
							value={field.value}
							defaultValue={field.value}
						>
							<FormControl>
								<SelectTrigger>
									<SelectValue
										defaultValue={field.value}
										placeholder="Select a city"
									/>
								</SelectTrigger>
							</FormControl>
							<SelectContent
								position="popper"
								side="bottom"
								avoidCollisions={false}
								className="max-h-64 overflow-y-auto"
							>
								{cityList.map((city) => (
									<SelectItem key={city.id} value={city.id}>
										{city.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
