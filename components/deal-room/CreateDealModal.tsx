"use client";

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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { dealTemplates } from "@/constants/dealRoomData";
import { useDealRoomStore } from "@/lib/stores/dealRoom";
import type { DealType } from "@/types/_dashboard/dealRoom";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateDealModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function CreateDealModal({ isOpen, onClose }: CreateDealModalProps) {
	const router = useRouter();
	const addDeal = useDealRoomStore((state) => state.addDeal);

	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		propertyAddress: "",
		propertyCity: "",
		propertyState: "",
		propertyZip: "",
		dealType: "single-family-rental" as DealType,
		purchasePrice: "",
		estimatedARV: "",
	});

	const handleNext = () => {
		if (step === 1) {
			if (
				!formData.propertyAddress ||
				!formData.propertyCity ||
				!formData.propertyState
			) {
				toast.error("Please fill in all required property fields");
				return;
			}
		}

		if (step === 2) {
			if (!formData.purchasePrice || Number(formData.purchasePrice) <= 0) {
				toast.error("Please enter a valid purchase price");
				return;
			}
		}

		setStep(step + 1);
	};

	const handleBack = () => {
		setStep(step - 1);
	};

	const handleCreate = () => {
		const purchasePrice = Number(formData.purchasePrice);
		const estimatedARV = formData.estimatedARV
			? Number(formData.estimatedARV)
			: undefined;
		const projectedROI = estimatedARV
			? Math.round(((estimatedARV - purchasePrice) / purchasePrice) * 100)
			: undefined;

		const dealId = addDeal({
			propertyAddress: formData.propertyAddress,
			propertyCity: formData.propertyCity,
			propertyState: formData.propertyState,
			propertyZip: formData.propertyZip,
			dealType: formData.dealType,
			status: "pre-offer",
			purchasePrice,
			estimatedARV,
			projectedROI,
			closingDate: undefined,
			daysUntilClosing: undefined,
			completionPercentage: 0,
			ownerId: "user-1",
			ownerName: "Current User",
		});

		toast.success("Deal created!", {
			description: "Redirecting to deal room...",
		});

		// Reset and close
		setFormData({
			propertyAddress: "",
			propertyCity: "",
			propertyState: "",
			propertyZip: "",
			dealType: "single-family-rental",
			purchasePrice: "",
			estimatedARV: "",
		});
		setStep(1);
		onClose();

		// Navigate to the new deal
		router.push(`/dashboard/deal-room/${dealId}`);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Create New Deal</DialogTitle>
					<DialogDescription>
						Step {step} of 3:{" "}
						{step === 1
							? "Property Information"
							: step === 2
								? "Deal Details"
								: "Review & Create"}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{step === 1 && (
						<>
							<div className="space-y-2">
								<Label htmlFor="address">Property Address *</Label>
								<Input
									id="address"
									value={formData.propertyAddress}
									onChange={(e) =>
										setFormData({
											...formData,
											propertyAddress: e.target.value,
										})
									}
									placeholder="123 Main Street"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="city">City *</Label>
									<Input
										id="city"
										value={formData.propertyCity}
										onChange={(e) =>
											setFormData({ ...formData, propertyCity: e.target.value })
										}
										placeholder="Austin"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="state">State *</Label>
									<Input
										id="state"
										value={formData.propertyState}
										onChange={(e) =>
											setFormData({
												...formData,
												propertyState: e.target.value,
											})
										}
										placeholder="TX"
										maxLength={2}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="zip">ZIP Code</Label>
								<Input
									id="zip"
									value={formData.propertyZip}
									onChange={(e) =>
										setFormData({ ...formData, propertyZip: e.target.value })
									}
									placeholder="78701"
								/>
							</div>
						</>
					)}

					{step === 2 && (
						<>
							<div className="space-y-2">
								<Label htmlFor="dealType">Deal Type *</Label>
								<Select
									value={formData.dealType}
									onValueChange={(value: DealType) =>
										setFormData({ ...formData, dealType: value })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{dealTemplates.map((template) => (
											<SelectItem key={template.id} value={template.dealType}>
												{template.icon} {template.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="price">Purchase Price *</Label>
									<Input
										id="price"
										type="number"
										value={formData.purchasePrice}
										onChange={(e) =>
											setFormData({
												...formData,
												purchasePrice: e.target.value,
											})
										}
										placeholder="285000"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="arv">Estimated ARV</Label>
									<Input
										id="arv"
										type="number"
										value={formData.estimatedARV}
										onChange={(e) =>
											setFormData({ ...formData, estimatedARV: e.target.value })
										}
										placeholder="425000"
									/>
								</div>
							</div>
						</>
					)}

					{step === 3 && (
						<div className="space-y-4">
							<div className="rounded-lg border p-4">
								<h3 className="mb-2 font-semibold">Deal Summary</h3>
								<dl className="space-y-2 text-sm">
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Property:</dt>
										<dd className="font-medium">{formData.propertyAddress}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Location:</dt>
										<dd>
											{formData.propertyCity}, {formData.propertyState}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Deal Type:</dt>
										<dd className="capitalize">
											{formData.dealType.replace("-", " ")}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Purchase Price:</dt>
										<dd className="font-medium">
											${Number(formData.purchasePrice).toLocaleString()}
										</dd>
									</div>
									{formData.estimatedARV && (
										<>
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Est. ARV:</dt>
												<dd>
													${Number(formData.estimatedARV).toLocaleString()}
												</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-muted-foreground">
													Projected ROI:
												</dt>
												<dd className="font-semibold text-green-600 dark:text-green-400">
													{Math.round(
														((Number(formData.estimatedARV) -
															Number(formData.purchasePrice)) /
															Number(formData.purchasePrice)) *
															100,
													)}
													%
												</dd>
											</div>
										</>
									)}
								</dl>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					{step > 1 && (
						<Button variant="outline" onClick={handleBack}>
							Back
						</Button>
					)}
					{step < 3 ? (
						<Button onClick={handleNext}>Next</Button>
					) : (
						<Button onClick={handleCreate}>Create Deal</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
