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
import { useFormContext } from "react-hook-form";

interface PersonalInfoFieldsProps {
	loading: boolean;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
	loading,
}) => {
	const form = useFormContext<ProfileFormValues>();
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

	// Helpers to map stored values (codes/ids) to human-readable labels
	const getStateNameByCode = (code?: string) =>
		stateList.find((s) => s.id === code)?.name ?? "";
	const getCityNameById = (id?: string) =>
		cityList.find((c) => c.id === id)?.name ?? "";

	return (
		<>
			<FormField
				control={form.control}
				name="firstName"
				render={({ field }) => (
					<FormItem>
						<FormLabel>First Name</FormLabel>
						<FormControl>
							<Input
								disabled={loading}
								placeholder="John"
								autoComplete="off"
								inputMode="text"
								{...field}
							/>
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
							<Input
								disabled={loading}
								placeholder="Doe"
								autoComplete="off"
								inputMode="text"
								{...field}
							/>
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
								type="email"
								autoComplete="off"
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
								type="tel"
								placeholder="Enter your phone number"
								disabled={loading}
								autoComplete="off"
								inputMode="tel"
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
									<SelectValue placeholder="Select a state">
										{field.value ? getStateNameByCode(field.value) : ""}
									</SelectValue>
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
									>
										{field.value ? getCityNameById(field.value) : ""}
									</SelectValue>
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
