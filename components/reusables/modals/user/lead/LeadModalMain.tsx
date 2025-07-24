import { useState } from "react";
import LeadAddressStep from "./steps/LeadAddressStep";
import LeadBasicInfoStep from "./steps/LeadBasicInfoStep";
import LeadContactStep from "./steps/LeadContactStep";
import LeadSocialsStep from "./steps/LeadSocialsStep";

// * Main Lead Modal Component: Combines all modular steps
interface LeadMainModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const LeadMainModal: React.FC<LeadMainModalProps> = ({ isOpen, onClose }) => {
	// Centralized state for all fields
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
	const [instagram, setInstagram] = useState("");
	const [twitter, setTwitter] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [step, setStep] = useState(0);

	// todo: Add validation logic and submission handler

	// * Sorted classnames for Biome compliance
	const buttonClass =
		"rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90";
	const navClass = "mt-6 flex items-center justify-between";

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="relative mx-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
				<button
					type="button"
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
					onClick={onClose}
					aria-label="Close"
				>
					&times;
				</button>
				{step === 0 && (
					<LeadBasicInfoStep
						firstName={firstName}
						lastName={lastName}
						onFirstNameChange={setFirstName}
						onLastNameChange={setLastName}
						errors={errors}
					/>
				)}
				{step === 1 && (
					<LeadAddressStep
						address={address}
						city={city}
						state={stateValue}
						zipCode={zipCode}
						onAddressChange={setAddress}
						onCityChange={setCity}
						onStateChange={setStateValue}
						onZipCodeChange={setZipCode}
						errors={errors}
					/>
				)}
				{step === 2 && (
					<LeadContactStep
						phoneNumber={phoneNumber}
						email={email}
						onPhoneNumberChange={setPhoneNumber}
						onEmailChange={setEmail}
						errors={errors}
					/>
				)}
				{step === 3 && (
					<LeadSocialsStep
						facebook={facebook}
						linkedin={linkedin}
						instagram={instagram}
						twitter={twitter}
						onFacebookChange={setFacebook}
						onLinkedinChange={setLinkedin}
						onInstagramChange={setInstagram}
						onTwitterChange={setTwitter}
						errors={errors}
					/>
				)}
				<div className={navClass}>
					<button
						type="button"
						className={buttonClass}
						disabled={step === 0}
						onClick={() => setStep((s) => Math.max(0, s - 1))}
					>
						Back
					</button>
					<button
						type="button"
						className={buttonClass}
						onClick={() => setStep((s) => Math.min(3, s + 1))}
						disabled={step === 3}
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
};

export default LeadMainModal;
