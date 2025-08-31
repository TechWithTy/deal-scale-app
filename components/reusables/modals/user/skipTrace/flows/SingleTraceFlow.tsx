"use client";

import type { InputField } from "@/types/skip-trace/enrichment";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { useSkipTraceStore } from "@/lib/stores/user/skipTraceStore";
import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnrichmentStep } from "../steps/EnrichmentStep";
import ReviewAndSubmitStep from "../steps/ReviewAndSubmitStep";
import LeadListSelectStep from "@/components/reusables/modals/user/lead/steps/LeadListSelectStep";
import { LEAD_LISTS_MOCK } from "@/constants/dashboard/leadLists.mock";
// no Select used in this step; contact prefs are edited in Review step

interface SingleTraceFlowProps {
	onClose: () => void;
	onBack: () => void;
	initialData?: Partial<Record<InputField | "domain", string>>;
}

const SingleTraceFlow: React.FC<SingleTraceFlowProps> = ({
	onBack,
	onClose,
	initialData = {},
}) => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [address, setAddress] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [socialTag, setSocialTag] = useState("");
	const [domain, setDomain] = useState("");
	const [error, setError] = useState("");
	const [step, setStep] = useState(0);
	const [selectedEnrichmentOptions, setSelectedEnrichmentOptions] = useState<
		string[]
	>([]);
	const [submitting, setSubmitting] = useState(false);
	// List selection/creation for single trace
	const [listMode, setListMode] = useState<"select" | "create">("create");
	const [selectedListId, setSelectedListId] = useState("");
	const [newListName, setNewListName] = useState("");
	const [contactNotes, setContactNotes] = useState("");
	const [bestContactTime, setBestContactTime] = useState<
		"morning" | "afternoon" | "evening" | "any"
	>("any");

	const { userProfile } = useUserProfileStore();
	const { setUserInput } = useSkipTraceStore();

	useEffect(() => {
		if (initialData.firstName) setFirstName(initialData.firstName);
		if (initialData.lastName) setLastName(initialData.lastName);
		if (initialData.address) setAddress(initialData.address);
		if (initialData.email) setEmail(initialData.email);
		if (initialData.phone) setPhone(initialData.phone);
		if (initialData.socialTag) setSocialTag(initialData.socialTag);
		if (initialData.domain) setDomain(initialData.domain);
	}, [initialData]);

	const availableCredits = userProfile?.subscription?.aiCredits
		? userProfile.subscription.aiCredits.allotted -
			userProfile.subscription.aiCredits.used
		: 0;

	const nextStep = () => setStep((prev) => prev + 1);
	const prevStep = () => setStep((prev) => prev - 1);

	const handleNextFromInput = () => {
		if (
			!firstName &&
			!lastName &&
			!address &&
			!email &&
			!phone &&
			!socialTag &&
			!domain
		) {
			setError(
				"Please fill in at least one field: Name, Address, Email, Phone, Social Tag, or Domain.",
			);
			return;
		}
		setError("");
		const userInput: Partial<Record<InputField, string>> = {
			firstName,
			lastName,
			address,
			email,
			phone,
			socialTag,
		};
		// ? Remove any empty fields so we don't overwrite existing data with blanks
		for (const key of Object.keys(userInput)) {
			if (!userInput[key as InputField]) {
				delete userInput[key as InputField];
			}
		}
		setUserInput(userInput);
		nextStep();
	};

	const handleListNext = () => {
		// simple validation similar to Lead modal
		if (listMode === "create") {
			if (!newListName.trim()) {
				setError("List name is required");
				return;
			}
		} else if (!selectedListId) {
			setError("Please select a list");
			return;
		}
		setError("");
		nextStep();
	};

	const handleEnrichmentNext = (options: string[]) => {
		setSelectedEnrichmentOptions(options);
		nextStep();
	};

	const handleFinalSubmit = () => {
		setSubmitting(true);
		// ! todo: Add submission logic and credit deduction
		const targetList =
			listMode === "create"
				? { mode: "create" as const, name: newListName.trim() }
				: { mode: "select" as const, id: selectedListId };
		console.log("Submitting single trace:", {
			list: targetList,
			firstName,
			lastName,
			address,
			email,
			phone,
			socialTag,
			domain,
			enrichments: selectedEnrichmentOptions,
			bestContactTime,
			contactNotes,
		});
		setTimeout(() => {
			setSubmitting(false);
			onClose(); // Close modal on success
		}, 2000);
	};

	const renderStep = () => {
		switch (step) {
			case 0:
				return (
					<div className="space-y-4 p-4">
						<h3 className="font-medium text-lg">Skip Trace a Single Contact</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
								/>
							</div>
							<div className="md:col-span-2">
								<Label htmlFor="address">Full Address</Label>
								<Input
									id="address"
									value={address}
									onChange={(e) => setAddress(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									type="email"
									id="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor="phone">Phone Number</Label>
								<Input
									type="tel"
									id="phone"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor="socialTag">Social Tag</Label>
								<Input
									id="socialTag"
									placeholder="e.g., @johndoe or linkedin.com/in/johndoe"
									value={socialTag}
									onChange={(e) => setSocialTag(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor="domain">Domain (Optional)</Label>
								<Input
									id="domain"
									placeholder="e.g., example.com"
									value={domain}
									onChange={(e) => setDomain(e.target.value)}
								/>
							</div>
						</div>
						{/* Contact preferences now captured in final Review step */}
						{error && <p className="text-red-600 text-sm">{error}</p>}
						<div className="flex justify-between pt-4">
							<Button variant="outline" onClick={onBack}>
								Back
							</Button>
							<Button onClick={handleNextFromInput}>Next</Button>
						</div>
					</div>
				);
			case 1:
				return (
					<div className="p-4">
						<LeadListSelectStep
							mode={listMode}
							onModeChange={setListMode}
							listName={newListName}
							onListNameChange={setNewListName}
							selectedListId={selectedListId}
							onSelectedListIdChange={setSelectedListId}
							existingLists={LEAD_LISTS_MOCK}
							bestContactTime={bestContactTime}
							onBestContactTimeChange={setBestContactTime}
							showBestTime={false}
							showNotes={false}
						/>
						<div className="flex justify-between pt-6">
							<Button variant="outline" onClick={prevStep}>
								Back
							</Button>
							<Button onClick={handleListNext}>Next</Button>
						</div>
					</div>
				);
			case 2:
				return (
					<EnrichmentStep onNext={handleEnrichmentNext} onBack={prevStep} />
				);
			case 3:
				return (
					<ReviewAndSubmitStep
						onSubmit={handleFinalSubmit}
						onBack={prevStep}
						availableCredits={availableCredits}
						bestContactTime={bestContactTime}
						onBestContactTimeChange={(v) => setBestContactTime(v)}
						contactNotes={contactNotes}
						onContactNotesChange={setContactNotes}
					/>
				);
			default:
				return null;
		}
	};

	return <>{renderStep()}</>;
};

export default SingleTraceFlow;
