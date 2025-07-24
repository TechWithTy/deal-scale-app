import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; // Assuming Input is imported
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

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

// Payment Modal Component
export const PaymentModal: React.FC<{ closePaymentModal: () => void }> = ({
	closePaymentModal,
}) => {
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof paymentSchema>>({
		resolver: zodResolver(paymentSchema),
	});

	const onSubmit = (data: z.infer<typeof paymentSchema>) => {
		closePaymentModal(); // Close modal on successful submission
	};

	return (
		<Dialog open={true} onOpenChange={closePaymentModal}>
			<DialogContent className="sm:max-w-3xl" style={{ zIndex: 10000 }}>
				<DialogHeader>
					<DialogTitle>Add New Payment Method</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit(
						onSubmit as unknown as SubmitHandler<z.infer<typeof paymentSchema>>,
					)}
					className="space-y-4"
				>
					{/* Name on Card */}
					<Controller
						name="nameOnCard"
						control={control}
						render={({ field }) => (
							<div>
								<label
									htmlFor="nameOnCard"
									className="block font-medium text-sm"
								>
									Name on card*
								</label>
								<Input
									{...field}
									id="nameOnCard"
									type="text"
									placeholder="Olivia Rhye"
									autoComplete="cc-name"
								/>
								{errors.nameOnCard?.message && (
									<p className="text-red-500 text-sm">
										{String(errors.nameOnCard.message)}
									</p>
								)}
							</div>
						)}
					/>

					{/* Card Number and Expiration */}
					<div className="grid grid-cols-2 gap-4">
						<Controller
							name="cardNumber"
							control={control}
							render={({ field }) => (
								<div>
									<label
										htmlFor="cardNumber"
										className="block font-medium text-sm"
									>
										Card number*
									</label>
									<Input
										{...field}
										id="cardNumber"
										type="text"
										placeholder="1234 1234 1234 1234"
									/>
									{errors.cardNumber?.message && (
										<p className="text-red-500 text-sm">
											{String(errors.cardNumber.message)}
										</p>
									)}
								</div>
							)}
						/>

						<Controller
							name="exp"
							control={control}
							render={({ field }) => (
								<div>
									<label htmlFor="exp" className="block font-medium text-sm">
										Exp*
									</label>
									<Input
										{...field}
										id="exp"
										type="text"
										placeholder="MM / YY"
									/>
									{errors.exp?.message && (
										<p className="text-red-500 text-sm">
											{String(errors.exp.message)}
										</p>
									)}
								</div>
							)}
						/>
					</div>

					{/* CVV */}
					<Controller
						name="cvv"
						control={control}
						render={({ field }) => (
							<div>
								<label htmlFor="cvv" className="block font-medium text-sm">
									CVV*
								</label>
								<Input
									{...field}
									id="cvv"
									type="text"
									placeholder="CVC"
									autoComplete="cc-csc"
								/>
								{errors.cvv?.message && (
									<p className="text-red-500 text-sm">
										{String(errors.cvv.message)}
									</p>
								)}
							</div>
						)}
					/>

					<Separator />

					{/* Full name */}
					<Controller
						name="fullName"
						control={control}
						render={({ field }) => (
							<div>
								<label htmlFor="fullName" className="block font-medium text-sm">
									Full name
								</label>
								<Input
									{...field}
									id="fullName"
									type="text"
									placeholder="First and last name"
									autoComplete="name"
								/>
								{errors.fullName?.message && (
									<p className="text-red-500 text-sm">
										{String(errors.fullName.message)}
									</p>
								)}
							</div>
						)}
					/>

					{/* Country */}
					<Controller
						name="country"
						control={control}
						render={({ field }) => (
							<div>
								<label htmlFor="country" className="block font-medium text-sm">
									Country or region
								</label>
								<Input
									{...field}
									id="country"
									type="text"
									placeholder="United States"
									autoComplete="country"
								/>
								{errors.country?.message && (
									<p className="text-red-500 text-sm">
										{String(errors.country.message)}
									</p>
								)}
							</div>
						)}
					/>

					{/* Address Line 1 */}
					<Controller
						name="addressLine1"
						control={control}
						render={({ field }) => (
							<div>
								<label
									htmlFor="addressLine1"
									className="block font-medium text-sm"
								>
									Address line 1
								</label>
								<Input
									{...field}
									id="addressLine1"
									type="text"
									placeholder="Street address"
									autoComplete="address-line1"
								/>
								{errors.addressLine1?.message && (
									<p className="text-red-500 text-sm">
										{String(errors.addressLine1.message)}
									</p>
								)}
							</div>
						)}
					/>
					{/*!
            ! Do not store card data in plaintext or logs.
            * This button submits the form and triggers validation.
          */}
					<Button type="submit" className="w-full bg-blue-600 text-white">
						Add New Payment Method
					</Button>
					{/* todo: Add support for address line 2 and postal code in future iterations. */}
				</form>
			</DialogContent>
		</Dialog>
	);
};
