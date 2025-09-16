"use client";

import { AddContactInfoModal } from "@/components/reusables/modals/addContactInfo";
import SkipTraceModalMain from "@/components/reusables/modals/user/skipTrace/SkipTraceModalMain";
import { Button } from "@/components/ui/button";
import searchAnimation from "@/public/lottie/SearchPing.json";
import type { ContactField } from "@/types/contact";
import type { Property, RealtorProperty } from "@/types/_dashboard/property";
import { isRealtorProperty } from "@/types/_dashboard/property";
import Lottie from "lottie-react";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { useState } from "react";

interface ContactCardProps {
	property: Property; // The property data passed as a prop
}

export const ContactCard: React.FC<ContactCardProps> = ({ property }) => {
	// Extract contact info based on property type
	const getContactInfo = () => {
		if (isRealtorProperty(property)) {
			const agent = property.metadata.agent;
			return {
				name: agent?.name || null,
				email: agent?.email || null,
				phones: agent?.phones || [],
			};
		}
		// RentCast properties don't have agent info in the current schema
		return { name: null, email: null, phones: [] };
	};

	const { name, email, phones } = getContactInfo();
	const searchParams = useSearchParams();

	// State to handle modal visibility for both AddContact and SkipTrace
	const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
	const [isSkipTraceModalOpen, setIsSkipTraceModalOpen] = useState(false);

	// Check if contact info is available
	const isContactInfoAvailable = name || email || (phones && phones.length > 0);

	// Handlers to open and close the modals
	const openAddContactModal = () => setIsAddContactModalOpen(true);
	const closeAddContactModal = () => setIsAddContactModalOpen(false);

	const openSkipTraceModal = () => setIsSkipTraceModalOpen(true);
	const closeSkipTraceModal = () => setIsSkipTraceModalOpen(false);

	// Submit handler for adding contact info
	const handleAddContactInfo = (fields: ContactField[]) => {
		// TODO: Implement logic to save the new contact fields
		console.log("New contact fields:", fields);
		closeAddContactModal(); // Close modal after submitting
	};

	// Prepare initial data for the skip trace modal, prioritizing URL params
	const nameParts = name?.split(" ") ?? [];
	const propFirstName = nameParts[0] ?? "";
	const propLastName = nameParts.slice(1).join(" ") ?? "";

	const skipTraceInitialData = {
		type: "single" as const,
		firstName: searchParams.get("firstName") || propFirstName,
		lastName: searchParams.get("lastName") || propLastName,
		address: searchParams.get("address") || property.address.fullStreetLine,
		email: searchParams.get("email") || email || "",
		phone: searchParams.get("phone") || phones?.[0]?.number || "",
		socialMedia: searchParams.get("social") || "",
		domain: searchParams.get("domain") || "",
	};

	return (
		<div className="my-2 w-full rounded-lg bg-card p-4 shadow-sm">
			{/* Title and buttons container */}
			<div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
				{/* Title */}
				<h2 className="text-lg font-semibold text-foreground">
					Contact Information
				</h2>

				{/* Buttons */}
				<div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
					{!isContactInfoAvailable && (
						<>
							<Button variant="outline" onClick={openAddContactModal}>
								Add Contact Info
							</Button>
							<Button variant="outline" onClick={openSkipTraceModal}>
								Skip Trace
							</Button>
						</>
					)}
				</div>
			</div>

			{isContactInfoAvailable ? (
				<div className="mt-4">
					<table className="min-w-full table-auto border-collapse">
						<thead>
							<tr className="border-b">
								<th className="p-2 text-left text-muted-foreground">Agent</th>
								<th className="p-2 text-left text-muted-foreground">Email</th>
								<th className="p-2 text-left text-muted-foreground">Phones</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b">
								<td className="p-2 text-foreground">{name || "N/A"}</td>
								<td className="p-2 text-foreground">{email || "N/A"}</td>
								<td className="p-2 text-foreground">
									{phones?.length ? (
										<ul>
											{phones.map((phone, index) => (
												<li key={`${phone.number}-${index}`}>
													{phone.number
														? `${phone.number} (${phone.type || "N/A"})`
														: "N/A"}
												</li>
											))}
										</ul>
									) : (
										"N/A"
									)}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			) : (
				<div className="mt-8 flex flex-col items-center justify-center">
					<Lottie
						animationData={searchAnimation}
						loop={true}
						className="h-32 w-32"
					/>
					<p className="mt-4 text-muted-foreground">
						No contact information found
					</p>
				</div>
			)}

			{/* Modal for Adding Contact Info */}
			<AddContactInfoModal
				isOpen={isAddContactModalOpen}
				onClose={closeAddContactModal}
				onSave={handleAddContactInfo}
			/>

			{/* Modal for Skip Trace */}
			<SkipTraceModalMain
				isOpen={isSkipTraceModalOpen}
				onClose={closeSkipTraceModal}
				initialData={skipTraceInitialData}
			/>
		</div>
	);
};

export default ContactCard;
