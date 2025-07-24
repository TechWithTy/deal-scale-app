"use client";

import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

interface AddContactInfoModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (contactType: "phone" | "email", contactInfo: string) => void;
}

export const AddContactInfoModal: React.FC<AddContactInfoModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
}) => {
	const [contactType, setContactType] = useState<"phone" | "email">("phone");
	const [contactInfo, setContactInfo] = useState("");

	const handleAddContact = () => {
		onSubmit(contactType, contactInfo);
		setContactInfo(""); // Reset input after submit
		onClose(); // Close modal after submission
	};

	return (
		<Dialog.Root open={isOpen} onOpenChange={onClose}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70" />
				<Dialog.Content className="fixed inset-0 flex items-center justify-center p-4">
					<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
						<Dialog.Title className="font-medium text-gray-900 text-lg dark:text-gray-100">
							Add Contact Info
						</Dialog.Title>
						<Dialog.Description className="mt-2 text-gray-500 text-sm dark:text-gray-300">
							Let`s add an email or phone number to your lead.
						</Dialog.Description>

						{/* Contact Type Selection */}
						<div className="mt-4 flex space-x-4">
							<Button
								variant={contactType === "phone" ? "default" : "outline"}
								onClick={() => setContactType("phone")}
							>
								Phone
							</Button>
							<Button
								variant={contactType === "email" ? "default" : "outline"}
								onClick={() => setContactType("email")}
							>
								Email
							</Button>
						</div>

						{/* Input Field */}
						<div className="mt-4">
							<label
								htmlFor="contactInfo"
								className="block font-medium text-gray-700 text-sm dark:text-gray-300"
							>
								{contactType === "phone" ? "Phone Number*" : "Email*"}
							</label>
							<input
								type={contactType === "phone" ? "tel" : "email"}
								id="contactInfo"
								name="contactInfo"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
								placeholder={
									contactType === "phone"
										? "Enter phone number"
										: "Enter email address"
								}
								value={contactInfo}
								onChange={(e) => setContactInfo(e.target.value)}
							/>
						</div>

						{/* Buttons */}
						<div className="mt-6 flex justify-end space-x-2">
							<Button variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button onClick={handleAddContact}>Add Contact Info</Button>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};
