import { useCallback, useEffect, useMemo, useState } from "react";
import {
	validateLeadStep,
	type LeadListMode,
	type LeadValidationInput,
} from "../utils/leadValidation";

export function useLeadModalState(
	initialListMode: LeadListMode,
	isOpen: boolean,
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

	// ui
	const [step, setStep] = useState(0);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// reset on open + incoming mode change
	useEffect(() => {
		if (isOpen) {
			setStep(0);
			setListMode(initialListMode);
		}
	}, [isOpen, initialListMode]);

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
		// ui
		step,
		setStep,
		errors,
		setErrors,
		validateStepNow,
	};
}
