"use client";

import { AddContactInfoModal } from "@/components/reusables/modals/addContactInfo";
import SkipTraceModalMain from "@/components/reusables/modals/user/skipTrace/SkipTraceModalMain";
import { Button } from "@/components/ui/button";
import searchAnimation from "@/public/lottie/SearchPing.json"; // Lottie JSON file path
import type { PropertyDetails } from "@/types/_dashboard/maps";
import Lottie from "lottie-react";
import type React from "react";
import { useState } from "react";

interface ContactCardProps {
	property: PropertyDetails; // The property data passed as a prop
}

const ContactCard: React.FC<ContactCardProps> = ({ property }) => {
	const { agent, agent_email, agent_phones } = property;

	// State to handle modal visibility for both AddContact and SkipTrace
	const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
	const [isSkipTraceModalOpen, setIsSkipTraceModalOpen] = useState(false);

	// Check if contact info is available
	const isContactInfoAvailable =
		agent || agent_email || (agent_phones && agent_phones.length > 0);

	// Handlers to open and close the modals
	const openAddContactModal = () => setIsAddContactModalOpen(true);
	const closeAddContactModal = () => setIsAddContactModalOpen(false);

	const openSkipTraceModal = () => setIsSkipTraceModalOpen(true);
	const closeSkipTraceModal = () => setIsSkipTraceModalOpen(false);

	// Submit handler for adding contact info
	const handleAddContactInfo = (
		contactType: "phone" | "email",
		contactInfo: string,
	) => {
		closeAddContactModal(); // Close modal after submitting
	};

	return (
		<div className="my-2 w-full rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
			{/* Title and buttons container */}
			<div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
				{/* Title */}
				<h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
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
								<th className="p-2 text-left text-gray-700 dark:text-gray-300">
									Agent
								</th>
								<th className="p-2 text-left text-gray-700 dark:text-gray-300">
									Email
								</th>
								<th className="p-2 text-left text-gray-700 dark:text-gray-300">
									Phones
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b">
								<td className="p-2 text-gray-900 dark:text-gray-100">
									{agent || "N/A"}
								</td>
								<td className="p-2 text-gray-900 dark:text-gray-100">
									{agent_email || "N/A"}
								</td>
								<td className="p-2 text-gray-900 dark:text-gray-100">
									{agent_phones?.length ? (
										<ul>
											{agent_phones.map((phone) => (
												<li key={phone.number}>
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
					<p className="mt-4 text-gray-500 dark:text-gray-400">
						No contact information found
					</p>
				</div>
			)}

			{/* Modal for Adding Contact Info */}
			<AddContactInfoModal
				isOpen={isAddContactModalOpen}
				onClose={closeAddContactModal}
				onSubmit={handleAddContactInfo}
			/>

			{/* Modal for Skip Trace */}
			<SkipTraceModalMain
				isOpen={isSkipTraceModalOpen}
				onClose={closeSkipTraceModal}
			/>
		</div>
	);
};

export default ContactCard;
