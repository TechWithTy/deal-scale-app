"use client";

import type { InputField } from "@/types/skip-trace/enrichment";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { useSkipTraceStore } from "@/lib/stores/user/skipTraceStore";
import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnrichmentStep } from "../steps/EnrichmentStep";
import ReviewAndSubmitStep from "../steps/ReviewAndSubmitStep";
import { LEAD_LISTS_MOCK } from "@/constants/dashboard/leadLists.mock";

interface ListItem {
	id?: string;
	count?: number;
	name: string;
}

interface SingleTraceFlowProps {
	onClose: () => void;
	onBack: () => void;
	initialData?: Partial<
		Record<InputField | "domain" | "listName" | "socialMedia", string>
	>;
	availableListNames?: string[];
	availableLists?: { name: string; count: number }[];
	availableLeadCount?: number;
	listCounts?: Record<string, number>;
}

const SingleTraceFlow: React.FC<SingleTraceFlowProps> = ({
	onBack,
	onClose,
	initialData = {},
	availableListNames,
	availableLists,
	availableLeadCount,
	listCounts,
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
	// Multi-select list selection for single/list flow unification
	const [listMode, setListMode] = useState<"select" | "create">("select");
	const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
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
		// accept alias from upstream payloads
		if (!initialData.socialTag && initialData.socialMedia)
			setSocialTag(initialData.socialMedia);
		if (initialData.domain) setDomain(initialData.domain);
		// Preselect lists by names if provided
		const names = availableListNames ?? [];
		if (names.length > 0) {
			// Build ID mapping from availableLists or fallback to name index
			const source =
				availableLists ??
				names.map((n, i) => ({ name: n, count: 0, id: String(i) as string }));
			const ids = source
				.filter((l) => names.includes(l.name))
				.map((l, i) =>
					"id" in l ? (l as unknown as { id: string }).id : String(i),
				);
			setSelectedListIds(ids);
			setListMode("select");
			setStep(1);
		}
	}, [initialData, availableListNames, availableLists]);

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
		if (listMode === "create") {
			if (!newListName.trim()) {
				setError("List name is required");
				return;
			}
		} else if (selectedListIds.length === 0) {
			setError("Please select one or more lists");
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
				: { mode: "select" as const, id: selectedListIds };
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
		if (availableListNames && availableListNames.length > 0) {
			if (step === 0) {
				return (
					<div className="space-y-4 p-4">
						<h3 className="font-medium text-lg">Choose Lead Lists</h3>
						<p className="text-muted-foreground text-sm">
							You'll run Skip Trace for the following list
							{availableListNames && availableListNames.length > 1 ? "s" : ""}:
						</p>
						<div className="space-y-2">
							{(availableListNames ?? []).map((name) => (
								<label
									key={name}
									className="flex items-center justify-between gap-2 text-sm"
								>
									<input
										type="checkbox"
										checked={selectedListIds.includes(name)}
										onChange={(e) => {
											setSelectedListIds((prev) => {
												if (e.target.checked)
													return Array.from(new Set([...prev, name]));
												return prev.filter((n) => n !== name);
											});
										}}
									/>
									<span className="flex-1">{name}</span>
									<span className="text-muted-foreground text-xs">
										{availableLists?.find((l) => l.name === name)?.count ?? 0}
									</span>
								</label>
							))}
						</div>
						<div className="pt-2 text-right text-muted-foreground text-xs">
							Total selected leads:{" "}
							<span className="font-medium text-foreground">
								{selectedListIds.length}
							</span>
						</div>
						<div className="flex justify-between pt-4">
							<Button variant="outline" onClick={onBack}>
								Back
							</Button>
							<Button
								onClick={handleListNext}
								disabled={selectedListIds.length === 0}
							>
								Next
							</Button>
						</div>
					</div>
				);
			}
			return (
				<EnrichmentStep
					onNext={handleEnrichmentNext}
					onBack={prevStep}
					leadCountOverride={selectedListIds.length}
				/>
			);
		}

		if (step === 0) {
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
		}

		if (step === 1) {
			return (
				<div className="space-y-4 p-4">
					<h3 className="font-medium text-lg">Choose Lead Lists</h3>
					<div className="flex items-center gap-4">
						<label className="flex items-center gap-2 text-sm">
							<input
								type="radio"
								checked={listMode === "select"}
								onChange={() => setListMode("select")}
							/>
							Select existing lists
						</label>
						<label className="flex items-center gap-2 text-sm">
							<input
								type="radio"
								checked={listMode === "create"}
								onChange={() => setListMode("create")}
							/>
							Create new list
						</label>
					</div>
					{listMode === "create" ? (
						<div className="space-y-2">
							<label className="text-sm" htmlFor="newListName">
								New list name
							</label>
							<Input
								id="newListName"
								value={newListName}
								onChange={(e) => setNewListName(e.target.value)}
							/>
						</div>
					) : (
						<div className="space-y-2">
							{(
								availableLists ??
								(availableListNames ?? LEAD_LISTS_MOCK.map((l) => l.name)).map(
									(name, i) => ({ name, count: 0, id: String(i) }),
								)
							).map((l: ListItem, idx) => {
								const id = l.id ?? String(idx);
								const count = l.count ?? 0;
								const name = l.name as string;
								return (
									<label
										key={id}
										className="flex items-center justify-between gap-2 text-sm"
									>
										<input
											type="checkbox"
											checked={selectedListIds.includes(id)}
											onChange={(e) => {
												setSelectedListIds((prev) => {
													if (e.target.checked)
														return Array.from(new Set([...prev, id]));
													return prev.filter((x) => x !== id);
												});
											}}
										/>
										<span className="flex-1">{name}</span>
										<span className="text-muted-foreground text-xs">
											{count}
										</span>
									</label>
								);
							})}
						</div>
					)}
					<div className="pt-2 text-right text-muted-foreground text-xs">
						Total selected leads:{" "}
						<span className="font-medium text-foreground">
							{(listMode === "select"
								? (availableLists ?? [])
										.filter((l: ListItem, idx: number) =>
											selectedListIds.includes(l.id ?? String(idx)),
										)
										.reduce((sum, l: ListItem) => sum + (l.count ?? 0), 0)
								: 0
							).toLocaleString()}
						</span>
					</div>
					<div className="flex justify-between pt-6">
						<Button variant="outline" onClick={prevStep}>
							Back
						</Button>
						<Button onClick={handleListNext}>Next</Button>
					</div>
				</div>
			);
		}

		if (step === 2) {
			return (
				<EnrichmentStep
					onNext={handleEnrichmentNext}
					onBack={prevStep}
					leadCountOverride={(availableLists ?? []).reduce(
						(sum, l: ListItem, idx: number) => {
							const id = l.id ?? String(idx);
							if (selectedListIds.includes(id)) return sum + (l.count ?? 0);
							return sum;
						},
						0,
					)}
				/>
			);
		}

		if (step === 3) {
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
		}

		return null;
	};

	return <>{renderStep()}</>;
};

export default SingleTraceFlow;
