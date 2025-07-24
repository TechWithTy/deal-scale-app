"use client";

import type { FC } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { ContactField, ContactFieldType } from "@/types/contact";
import { X } from "lucide-react";

interface AddContactInfoModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (fields: ContactField[]) => void;
}

const fieldOptions: { value: ContactFieldType; label: string }[] = [
	{ value: "firstName", label: "First Name" },
	{ value: "lastName", label: "Last Name" },
	{ value: "address", label: "Mailing Address" },
	{ value: "email", label: "Email" },
	{ value: "phone", label: "Phone" },
	{ value: "social", label: "Social Media URL" },
	{ value: "domain", label: "Domain" },
];

export const AddContactInfoModal: FC<AddContactInfoModalProps> = ({
	isOpen,
	onClose,
	onSave,
}) => {
	const [fields, setFields] = useState<ContactField[]>([]);

	const addField = (type: ContactFieldType) => {
		const newField: ContactField = {
			id: `field_${Date.now()}`,
			type,
			value: "",
			label: fieldOptions.find((opt) => opt.value === type)?.label || "",
		};
		setFields([...fields, newField]);
	};

	const removeField = (id: string) => {
		setFields(fields.filter((field) => field.id !== id));
	};

	const handleFieldValueChange = (id: string, value: string) => {
		setFields(
			fields.map((field) => (field.id === id ? { ...field, value } : field)),
		);
	};

	const handleSave = () => {
		onSave(fields);
		onClose();
		setFields([]); // * Reset fields after saving
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Add Contact Information</DialogTitle>
					<DialogDescription>
						Add new contact details. You can add multiple fields at once.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					{fields.map((field) => (
						<div key={field.id} className="flex items-center gap-2">
							<Input
								placeholder={field.label}
								value={field.value}
								onChange={(e) =>
									handleFieldValueChange(field.id, e.target.value)
								}
								className="flex-grow"
							/>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => removeField(field.id)}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					))}
					<div className="flex items-center gap-2">
						<Select
							onValueChange={(value) => addField(value as ContactFieldType)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a field to add" />
							</SelectTrigger>
							<SelectContent>
								{fieldOptions.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={fields.length === 0}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
