import { useState } from "react";
import LeadAddressStep from "./steps/LeadAddressStep";
import LeadBasicInfoStep from "./steps/LeadBasicInfoStep";
import LeadContactStep from "./steps/LeadContactStep";
import LeadSocialsStep from "./steps/LeadSocialsStep";
import LeadListSelectStep from "./steps/LeadListSelectStep";
import { LEAD_LISTS_MOCK } from "@/constants/dashboard/leadLists.mock";

// * Main Lead Modal Component: Combines all modular steps
interface LeadMainModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const LeadMainModal: React.FC<LeadMainModalProps> = ({ isOpen, onClose }) => {
	// Centralized state for all fields
	// Lead list selection/creation
	const [listMode, setListMode] = useState<"select" | "create">("create");
	const [selectedListId, setSelectedListId] = useState("");
	const [newListName, setNewListName] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [address, setAddress] = useState("");
	const [city, setCity] = useState("");
	const [stateValue, setStateValue] = useState("");
	const [zipCode, setZipCode] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [email, setEmail] = useState("");
	const [facebook, setFacebook] = useState("");
	const [linkedin, setLinkedin] = useState("");
	const [socialHandle, setSocialHandle] = useState("");
	const [socialSummary, setSocialSummary] = useState("");
	const [isIphone, setIsIphone] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [step, setStep] = useState(0);

	// Live validation handlers for each field
	const handleFirstNameChange = (value: string) => {
		setFirstName(value);
		setErrors((prev) => ({
			...prev,
			firstName: !value.trim()
				? "First name is required"
				: !nameRegex.test(value.trim())
					? "First name must be valid (letters only)"
					: "",
		}));
	};
	const handleLastNameChange = (value: string) => {
		setLastName(value);
		setErrors((prev) => ({
			...prev,
			lastName: !value.trim()
				? "Last name is required"
				: !nameRegex.test(value.trim())
					? "Last name must be valid (letters only)"
					: "",
		}));
	};
	const handleAddressChange = (value: string) => {
		setAddress(value);
		setErrors((prev) => ({
			...prev,
			address: !value.trim()
				? "Address is required"
				: !addressRegex.test(value.trim())
					? "Enter a valid address"
					: "",
		}));
	};
	const handleCityChange = (value: string) => {
		setCity(value);
		setErrors((prev) => ({
			...prev,
			city: !value.trim()
				? "City is required"
				: !cityRegex.test(value.trim())
					? "Enter a valid city name"
					: "",
		}));
	};
	const handleStateChange = (value: string) => {
		setStateValue(value);
		setErrors((prev) => ({
			...prev,
			state: !value.trim()
				? "State is required"
				: !stateRegex.test(value.trim())
					? "Enter a valid state name"
					: "",
		}));
	};
	const handleZipCodeChange = (value: string) => {
		setZipCode(value);
		setErrors((prev) => ({
			...prev,
			zipCode: !value.trim()
				? "Zip code is required"
				: !zipRegex.test(value.trim())
					? "Enter a valid zip code"
					: "",
		}));
	};
	const handlePhoneNumberChange = (value: string) => {
		setPhoneNumber(value);
		setErrors((prev) => ({
			...prev,
			phoneNumber: !value.trim()
				? "Phone number is required"
				: !phoneRegex.test(value.trim())
					? "Enter a valid phone number"
					: "",
		}));
	};
	const handleEmailChange = (value: string) => {
		setEmail(value);
		setErrors((prev) => ({
			...prev,
			email: !value.trim()
				? "Email is required"
				: !emailRegex.test(value.trim())
					? "Enter a valid email address"
					: "",
		}));
	};
	const handleFacebookChange = (value: string) => {
		setFacebook(value);
		setErrors((prev) => ({
			...prev,
			facebook: value && !urlRegex.test(value) ? "Invalid Facebook URL" : "",
			// Socials group error
			socials: [value, linkedin, socialHandle].every((s) => !s.trim())
				? "At least one social profile or handle is required"
				: "",
		}));
	};
	const handleLinkedinChange = (value: string) => {
		setLinkedin(value);
		setErrors((prev) => ({
			...prev,
			linkedin: value && !urlRegex.test(value) ? "Invalid LinkedIn URL" : "",
			socials: [facebook, value, socialHandle].every((s) => !s.trim())
				? "At least one social profile or handle is required"
				: "",
		}));
	};
	const handleSocialHandleChange = (value: string) => {
		setSocialHandle(value);
		setErrors((prev) => ({
			...prev,
			socials: [facebook, linkedin, value].every((s) => !s.trim())
				? "At least one social profile or handle is required"
				: "",
		}));
	};
	const handleSocialSummaryChange = (value: string) => {
		setSocialSummary(value);
	};

	// ! Validation helpers
	const isValidUrl = (url: string) => {
		if (!url) return true;
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	};

	const nameRegex = /^[A-Za-z\s'-]{2,}$/;
	const addressRegex = /^[\w\s.,#'-]{5,}$/;
	const cityRegex = /^[A-Za-z\s'-]{2,}$/;
	const stateRegex = /^[A-Za-z\s'-]{2,}$/;
	const zipRegex = /^\d{5}(-\d{4})?$/;
	const phoneRegex = /^\+?\d{10,15}$/;
	const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
	const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z\.]{2,6})([\/\w .-]*)*\/?$/i;

	const validateStep = (currentStep: number): Record<string, string> => {
		const newErrors: Record<string, string> = {};
		if (currentStep === 0) {
			// Lead list step
			if (listMode === "create") {
				if (!newListName.trim()) newErrors.list = "List name is required";
			} else {
				if (!selectedListId) newErrors.list = "Please select a list";
			}
		}
		if (currentStep === 1) {
			if (!firstName.trim()) newErrors.firstName = "First name is required";
			else if (!nameRegex.test(firstName.trim()))
				newErrors.firstName = "First name must be valid (letters only)";
			if (!lastName.trim()) newErrors.lastName = "Last name is required";
			else if (!nameRegex.test(lastName.trim()))
				newErrors.lastName = "Last name must be valid (letters only)";
		}
		if (currentStep === 2) {
			if (!address.trim()) newErrors.address = "Address is required";
			else if (!addressRegex.test(address.trim()))
				newErrors.address = "Enter a valid address";
			if (!city.trim()) newErrors.city = "City is required";
			else if (!cityRegex.test(city.trim()))
				newErrors.city = "Enter a valid city name";
			if (!stateValue.trim()) newErrors.state = "State is required";
			else if (!stateRegex.test(stateValue.trim()))
				newErrors.state = "Enter a valid state name";
			if (!zipCode.trim()) newErrors.zipCode = "Zip code is required";
			else if (!zipRegex.test(zipCode.trim()))
				newErrors.zipCode = "Enter a valid zip code";
		}
		if (currentStep === 3) {
			if (!phoneNumber.trim())
				newErrors.phoneNumber = "Phone number is required";
			else if (!phoneRegex.test(phoneNumber.trim()))
				newErrors.phoneNumber = "Enter a valid phone number";
			if (!email.trim()) newErrors.email = "Email is required";
			else if (!emailRegex.test(email.trim()))
				newErrors.email = "Enter a valid email address";
		}
		if (currentStep === 4) {
			const socials = [facebook, linkedin, socialHandle];
			if (socials.every((s) => !s.trim())) {
				newErrors.socials = "At least one social profile or handle is required";
			}
			if (facebook && !urlRegex.test(facebook))
				newErrors.facebook = "Invalid Facebook URL";
			if (linkedin && !urlRegex.test(linkedin))
				newErrors.linkedin = "Invalid LinkedIn URL";
		}
		return newErrors;
	};

	// ! Handles final submission of the lead form
	const handleAddLead = () => {
		const stepErrors = validateStep(step);
		if (Object.keys(stepErrors).length > 0) {
			setErrors(stepErrors);
			return;
		}
		// todo: Integrate with API or parent state here
		const targetList =
			listMode === "create"
				? { mode: "create" as const, name: newListName.trim() }
				: { mode: "select" as const, id: selectedListId };
		console.log("Add lead payload", {
			list: targetList,
			lead: {
				firstName,
				lastName,
				address,
				city,
				state: stateValue,
				zipCode,
				phoneNumber,
				isIphone,
				email,
				socials: { facebook, linkedin, socialHandle, socialSummary },
			},
		});
		setFirstName("");
		setLastName("");
		setAddress("");
		setCity("");
		setStateValue("");
		setZipCode("");
		setPhoneNumber("");
		setEmail("");
		setFacebook("");
		setLinkedin("");
		setSocialHandle("");
		setSocialSummary("");
		setIsIphone(false);
		setSelectedListId("");
		setNewListName("");
		setListMode("create");
		setErrors({});
		onClose();
	};
	const handleNext = () => {
		const stepErrors = validateStep(step);
		if (Object.keys(stepErrors).length > 0) {
			setErrors(stepErrors);
			return;
		}
		setErrors({});
		setStep((s) => Math.min(4, s + 1));
	};

	const handleBack = () => {
		setErrors({});
		setStep((s) => Math.max(0, s - 1));
	};

	// * Sorted classnames for Biome compliance
	const buttonClass =
		"rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";
	const navClass = "mt-6 flex items-center justify-between";

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="relative mx-auto w-full max-w-lg rounded-lg bg-card p-6 shadow-lg border border-border text-foreground">
				<button
					type="button"
					className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
					onClick={onClose}
					aria-label="Close"
				>
					&times;
				</button>
				{step === 0 && (
					<LeadListSelectStep
						mode={listMode}
						onModeChange={setListMode}
						listName={newListName}
						onListNameChange={setNewListName}
						selectedListId={selectedListId}
						onSelectedListIdChange={setSelectedListId}
						existingLists={LEAD_LISTS_MOCK}
						errors={errors}
					/>
				)}
				{step === 1 && (
					<LeadBasicInfoStep
						firstName={firstName}
						lastName={lastName}
						onFirstNameChange={handleFirstNameChange}
						onLastNameChange={handleLastNameChange}
						errors={errors}
					/>
				)}
				{step === 2 && (
					<LeadAddressStep
						address={address}
						city={city}
						state={stateValue}
						zipCode={zipCode}
						onAddressChange={handleAddressChange}
						onCityChange={handleCityChange}
						onStateChange={handleStateChange}
						onZipCodeChange={handleZipCodeChange}
						errors={errors}
					/>
				)}
				{step === 3 && (
					<LeadContactStep
						phoneNumber={phoneNumber}
						email={email}
						isIphone={isIphone}
						onPhoneNumberChange={handlePhoneNumberChange}
						onEmailChange={handleEmailChange}
						onIsIphoneChange={setIsIphone}
						errors={errors}
					/>
				)}
				{step === 4 && (
					<>
						<LeadSocialsStep
							facebook={facebook}
							linkedin={linkedin}
							socialHandle={socialHandle}
							socialSummary={socialSummary}
							onFacebookChange={handleFacebookChange}
							onLinkedinChange={handleLinkedinChange}
							onSocialHandleChange={handleSocialHandleChange}
							onSocialSummaryChange={handleSocialSummaryChange}
							errors={errors}
						/>
						{errors.socials && (
							<p className="mt-2 text-destructive text-sm">{errors.socials}</p>
						)}
					</>
				)}

				<div className={navClass}>
					{step !== 0 && (
						<button type="button" className={buttonClass} onClick={handleBack}>
							Back
						</button>
					)}
					{step !== 4 ? (
						<button
							type="button"
							className={buttonClass}
							onClick={handleNext}
							disabled={Object.keys(validateStep(step)).length > 0}
						>
							Next
						</button>
					) : (
						<button
							type="button"
							className={buttonClass}
							onClick={handleAddLead}
							disabled={Object.keys(validateStep(step)).length > 0}
						>
							Add Lead
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default LeadMainModal;
