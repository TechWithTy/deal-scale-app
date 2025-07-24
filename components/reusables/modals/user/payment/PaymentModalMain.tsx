import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BillingAddressStep from "./steps/BillingAddressStep";
import CardInfoStep from "./steps/CardInfoStep";

// Zod schema for Payment Modal
const paymentSchema = z.object({
	nameOnCard: z.string().min(1, "Name on card is required"),
	cardNumber: z
		.string()
		.min(16, "Card number must be 16 digits")
		.max(16, "Card number must be 16 digits"),
	exp: z
		.string()
		.min(5, "Expiration date must be in MM/YY format")
		.regex(/^\d{2}\/\d{2}$/, "Invalid format"),
	cvv: z
		.string()
		.min(3, "CVV must be at least 3 digits")
		.max(4, "CVV cannot be longer than 4 digits"),
	fullName: z.string().min(1, "Full name is required"),
	country: z.string().min(1, "Country is required"),
	addressLine1: z.string().min(1, "Address is required"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const PaymentModalMain: FC<{ open?: boolean; onClose?: () => void }> = ({
	open = true,
	onClose,
}) => {
	// Centralized state for all fields
	const [step, setStep] = useState(0);
	const {
		register,
		handleSubmit,
		setValue,
		getValues,
		formState: { errors },
	} = useForm<PaymentFormData>({ resolver: zodResolver(paymentSchema) });

	// Handlers to update field values for modular steps
	const handleFieldChange = (field: keyof PaymentFormData) => (value: string) =>
		setValue(field, value, { shouldValidate: true });

	const onSubmit = (data: PaymentFormData) => {
		if (onClose) onClose();
		// todo: handle actual payment submission
	};

	// * Sorted classnames for Biome compliance
	const buttonClass =
		"rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90";
	const navClass = "mt-6 flex items-center justify-between";

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-3xl" style={{ zIndex: 10000 }}>
				<DialogHeader>
					<DialogTitle>Add New Payment Method</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{step === 0 && (
						<CardInfoStep
							nameOnCard={getValues("nameOnCard") || ""}
							cardNumber={getValues("cardNumber") || ""}
							exp={getValues("exp") || ""}
							cvv={getValues("cvv") || ""}
							onNameOnCardChange={handleFieldChange("nameOnCard")}
							onCardNumberChange={handleFieldChange("cardNumber")}
							onExpChange={handleFieldChange("exp")}
							onCvvChange={handleFieldChange("cvv")}
							errors={errors as Record<string, string>}
						/>
					)}
					{step === 1 && (
						<BillingAddressStep
							fullName={getValues("fullName") || ""}
							country={getValues("country") || ""}
							addressLine1={getValues("addressLine1") || ""}
							onFullNameChange={handleFieldChange("fullName")}
							onCountryChange={handleFieldChange("country")}
							onAddressLine1Change={handleFieldChange("addressLine1")}
							errors={errors as Record<string, string>}
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
						{step < 1 ? (
							<button
								type="button"
								className={buttonClass}
								onClick={() => setStep((s) => Math.min(1, s + 1))}
							>
								Next
							</button>
						) : (
							<Button type="submit" className="w-full bg-blue-600 text-white">
								Add New Payment Method
							</Button>
						)}
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default PaymentModalMain;
