export type LeadListMode = "select" | "create";

export type LeadValidationInput = {
	step: number;
	listMode: LeadListMode;
	newListName: string;
	selectedListId: string;
	firstName: string;
	lastName: string;
	address: string;
	city: string;
	stateValue: string;
	zipCode: string;
	phoneNumber: string;
	email: string;
	facebook: string;
	linkedin: string;
	socialHandle: string;
};

export const nameRegex = /^[A-Za-z\s'-]{2,}$/;
export const addressRegex = /^[\w\s.,#'-]{5,}$/;
export const cityRegex = /^[A-Za-z\s'-]{2,}$/;
export const stateRegex = /^[A-Za-z\s'-]{2,}$/;
export const zipRegex = /^\d{5}(-\d{4})?$/;
export const phoneRegex = /^\+?\d{10,15}$/;
export const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
export const urlRegex =
	/^(https?:\/\/)?([\w.-]+)\.([a-z\.]{2,6})([\/\w .-]*)*\/?$/i;

export function validateLeadStep(
	input: LeadValidationInput,
): Record<string, string> {
	const {
		step,
		listMode,
		newListName,
		selectedListId,
		firstName,
		lastName,
		address,
		city,
		stateValue,
		zipCode,
		phoneNumber,
		email,
		facebook,
		linkedin,
		socialHandle,
	} = input;

	const effectiveStep = listMode === "create" && step > 1 ? step - 1 : step;
	const isMappingStep = listMode === "create" && step === 1;
	const isSkipTraceStep = listMode === "create" && step === 2; // Skip trace summary step
	const errors: Record<string, string> = {};

	if (isMappingStep || isSkipTraceStep) {
		return errors; // No validation needed for mapping or skip trace steps
	}

	if (effectiveStep === 0) {
		if (listMode === "create") {
			if (!newListName.trim()) errors.list = "List name is required";
		} else if (!selectedListId) {
			errors.list = "Please select a list";
		}
	}

	if (effectiveStep === 1) {
		if (!firstName.trim()) errors.firstName = "First name is required";
		else if (!nameRegex.test(firstName.trim()))
			errors.firstName = "First name must be valid (letters only)";
		if (!lastName.trim()) errors.lastName = "Last name is required";
		else if (!nameRegex.test(lastName.trim()))
			errors.lastName = "Last name must be valid (letters only)";
	}

	if (effectiveStep === 2) {
		if (!address.trim()) errors.address = "Address is required";
		else if (!addressRegex.test(address.trim()))
			errors.address = "Enter a valid address";
		if (!city.trim()) errors.city = "City is required";
		else if (!cityRegex.test(city.trim()))
			errors.city = "Enter a valid city name";
		if (!stateValue.trim()) errors.state = "State is required";
		else if (!stateRegex.test(stateValue.trim()))
			errors.state = "Enter a valid state name";
		if (!zipCode.trim()) errors.zipCode = "Zip code is required";
		else if (!zipRegex.test(zipCode.trim()))
			errors.zipCode = "Enter a valid zip code";
	}

	if (effectiveStep === 3) {
		if (!phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
		else if (!phoneRegex.test(phoneNumber.trim()))
			errors.phoneNumber = "Enter a valid phone number";
		if (!email.trim()) errors.email = "Email is required";
		else if (!emailRegex.test(email.trim()))
			errors.email = "Enter a valid email address";
	}

	if (effectiveStep === 4) {
		const socials = [facebook, linkedin, socialHandle];
		if (socials.every((s) => !s.trim())) {
			errors.socials = "At least one social profile or handle is required";
		}
		if (facebook && !urlRegex.test(facebook))
			errors.facebook = "Invalid Facebook URL";
		if (linkedin && !urlRegex.test(linkedin))
			errors.linkedin = "Invalid LinkedIn URL";
	}

	return errors;
}
