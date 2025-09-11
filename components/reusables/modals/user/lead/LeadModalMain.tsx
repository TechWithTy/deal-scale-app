"use client";

import LeadAddressStep from "./steps/LeadAddressStep";
import LeadBasicInfoStep from "./steps/LeadBasicInfoStep";
import LeadContactStep from "./steps/LeadContactStep";
import LeadSocialsStep from "./steps/LeadSocialsStep";
import LeadListSelectStep from "./steps/LeadListSelectStep";
import { LEAD_LISTS_MOCK } from "@/constants/dashboard/leadLists.mock";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLeadModalState } from "./hooks/useLeadModalState";

// * Main Lead Modal Component: Combines all modular steps
interface LeadMainModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialListMode?: "select" | "create";
}

function LeadMainModal({
	isOpen,
	onClose,
	initialListMode = "create",
}: LeadMainModalProps) {
	// Centralized state via hook
	const {
		// list
		listMode,
		setListMode,
		selectedListId,
		setSelectedListId,
		newListName,
		setNewListName,
		// form
		firstName,
		setFirstName,
		lastName,
		setLastName,
		address,
		setAddress,
		city,
		setCity,
		stateValue,
		setStateValue,
		zipCode,
		setZipCode,
		phoneNumber,
		setPhoneNumber,
		email,
		setEmail,
		facebook,
		setFacebook,
		linkedin,
		setLinkedin,
		socialHandle,
		setSocialHandle,
		socialSummary,
		setSocialSummary,
		isIphone,
		setIsIphone,
		preferCall,
		setPreferCall,
		preferSms,
		setPreferSms,
		bestContactTime,
		setBestContactTime,
		leadNotes,
		setLeadNotes,
		listNotes,
		setListNotes,
		// ui
		step,
		setStep,
		errors,
		setErrors,
		validateStepNow,
	} = useLeadModalState(initialListMode, isOpen);

	// Simple setters (live validation handled on step/submit)
	const handleFirstNameChange = (v: string) => setFirstName(v);
	const handleLastNameChange = (v: string) => setLastName(v);
	const handleAddressChange = (v: string) => setAddress(v);
	const handleCityChange = (v: string) => setCity(v);
	const handleStateChange = (v: string) => setStateValue(v);
	const handleZipCodeChange = (v: string) => setZipCode(v);
	const handlePhoneNumberChange = (v: string) => setPhoneNumber(v);
	const handleEmailChange = (v: string) => setEmail(v);
	const handleFacebookChange = (v: string) => setFacebook(v);
	const handleLinkedinChange = (v: string) => setLinkedin(v);
	const handleSocialHandleChange = (v: string) => setSocialHandle(v);
	const handleSocialSummaryChange = (v: string) => setSocialSummary(v);
	const handleBestTimeChange = (
		v: "morning" | "afternoon" | "evening" | "any",
	) => setBestContactTime(v);

	// Validation
	const validateStep = () => validateStepNow();

	const handleAddLead = () => {
		const targetList =
			listMode === "create"
				? { mode: "create" as const, name: newListName.trim() }
				: { mode: "select" as const, id: selectedListId };

		const payload = {
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
				communication: { preferCall, preferSms },
				socials: { facebook, linkedin, socialHandle, socialSummary },
			},
		};
		console.log("Add lead payload", payload);
		onClose();
	};

	const handleNext = () => {
		const problems = validateStep();
		setErrors(problems);
		if (Object.keys(problems).length === 0) setStep((s) => Math.min(4, s + 1));
	};

	const handleBack = () => setStep((s) => Math.max(0, s - 1));

	const buttonClass =
		"px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50";
	const navClass = "mt-6 flex items-center justify-between";

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="max-w-2xl">
				<div className="space-y-6">
					{step === 0 && (
						<LeadListSelectStep
							mode={listMode}
							onModeChange={setListMode}
							listName={newListName}
							onListNameChange={setNewListName}
							selectedListId={selectedListId}
							onSelectedListIdChange={setSelectedListId}
							existingLists={LEAD_LISTS_MOCK}
							bestContactTime={bestContactTime}
							onBestContactTimeChange={handleBestTimeChange}
							listNotes={listNotes}
							onListNotesChange={setListNotes}
							showBestTime={false}
							showNotes={false}
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
							preferCall={preferCall}
							preferSms={preferSms}
							bestContactTime={bestContactTime}
							onPhoneNumberChange={handlePhoneNumberChange}
							onEmailChange={handleEmailChange}
							onIsIphoneChange={setIsIphone}
							onPreferCallChange={setPreferCall}
							onPreferSmsChange={setPreferSms}
							onBestContactTimeChange={handleBestTimeChange}
							leadNotes={leadNotes}
							onLeadNotesChange={setLeadNotes}
							showBestTime={false}
							showLeadNotes={false}
							errors={errors}
						/>
					)}

					{step === 4 && (
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
					)}

					{errors.socials && step === 4 && (
						<p className="mt-2 text-destructive text-sm">{errors.socials}</p>
					)}

					<div className={navClass}>
						{step !== 0 && (
							<button
								type="button"
								className={buttonClass}
								onClick={handleBack}
							>
								Back
							</button>
						)}
						{step !== 4 ? (
							<button
								type="button"
								className={buttonClass}
								onClick={handleNext}
								disabled={Object.keys(validateStep()).length > 0}
							>
								Next
							</button>
						) : (
							<button
								type="button"
								className={buttonClass}
								onClick={handleAddLead}
								disabled={Object.keys(validateStep()).length > 0}
							>
								Add Lead
							</button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default LeadMainModal;
