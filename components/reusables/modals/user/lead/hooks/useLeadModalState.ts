import { useCallback, useEffect, useMemo, useState } from "react";
import {
	type LeadListMode,
	type LeadValidationInput,
	validateLeadStep,
} from "../utils/leadValidation";

export function useLeadModalState(
	initialListMode: LeadListMode,
	isOpen: boolean,
	hasCsvData?: boolean, // 🆕 New parameter to check if CSV data exists
) {
	// list step
	const [listMode, setListMode] = useState<LeadListMode>(initialListMode);
	const [selectedListId, setSelectedListId] = useState("");
	const [newListName, setNewListName] = useState("");

	// form fields
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
	const [preferCall, setPreferCall] = useState(false);
	const [preferSms, setPreferSms] = useState(false);
	const [bestContactTime, setBestContactTime] = useState<
		"morning" | "afternoon" | "evening" | "any"
	>("any");
	const [leadNotes, setLeadNotes] = useState("");
	const [listNotes, setListNotes] = useState("");
	// DNC and TCPA fields
	const [dncStatus, setDncStatus] = useState<boolean>(false);
	const [dncSource, setDncSource] = useState<string>("");
	const [tcpaOptedIn, setTcpaOptedIn] = useState<boolean>(false);

	// ui
	const [step, setStep] = useState(0);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// reset on open + incoming mode change
	useEffect(() => {
		if (isOpen) {
			// Smart step initialization based on CSV availability
			if (initialListMode === "create" && hasCsvData) {
				setStep(1); // Skip to field mapping if CSV data exists
			} else if (initialListMode === "create" && !hasCsvData) {
				setStep(0); // Start at list selection, CSV upload will be step 0.5
			} else {
				setStep(0); // For select mode, start at list selection
			}

			setListMode(initialListMode);
			// Reset DNC and TCPA fields
			setDncStatus(false);
			setDncSource("");
			setTcpaOptedIn(false);
		}
	}, [isOpen, initialListMode, hasCsvData]);

	const validationInput: LeadValidationInput = useMemo(
		() => ({
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
		}),
		[
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
		],
	);

	const validateStepNow = useCallback(
		() => validateLeadStep(validationInput),
		[validationInput],
	);

	return {
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
		// DNC and TCPA fields
		dncStatus,
		setDncStatus,
		dncSource,
		setDncSource,
		tcpaOptedIn,
		setTcpaOptedIn,
		// ui
		step,
		setStep,
		errors,
		setErrors,
		validateStepNow,
	};
}
