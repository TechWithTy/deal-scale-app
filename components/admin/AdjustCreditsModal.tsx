"use client";

import { useForm } from "react-hook-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export interface AdjustCreditsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	onSuccess?: (delta: number, type: string) => void;
}

interface FormValues {
	type: "ai" | "leads" | "skipTraces";
	amount: number; // positive or negative
	reason: string;
}

export default function AdjustCreditsModal({
	open,
	onOpenChange,
	userId,
	onSuccess,
}: AdjustCreditsModalProps) {
	const { register, handleSubmit, reset } = useForm<FormValues>({
		defaultValues: { type: "ai", amount: 0, reason: "" },
	});
	const [busy, setBusy] = useState(false);

	const onSubmit = async (values: FormValues) => {
		setBusy(true);
		try {
			// Mock API call
			await new Promise((r) => setTimeout(r, 600));
			// In real impl: await fetch(`/api/v1/admin/users/${userId}/adjust-credits`, { method: 'POST', body: JSON.stringify(values) })
			if (onSuccess) onSuccess(values.amount, values.type);
			// rudimentary feedback
			if (typeof window !== "undefined") {
				// eslint-disable-next-line no-alert
				window.alert("Credits adjusted successfully");
			}
			onOpenChange(false);
			reset({ type: "ai", amount: 0, reason: "" });
		} finally {
			setBusy(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				if (!busy) onOpenChange(v);
			}}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Adjust Credits</DialogTitle>
				</DialogHeader>
				<form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
					<div className="grid gap-1">
						<Label htmlFor="type">Credit Type</Label>
						<select
							id="type"
							className="h-9 rounded-md border bg-background px-2 text-sm"
							{...register("type")}
						>
							<option value="ai">AI</option>
							<option value="leads">Leads</option>
							<option value="skipTraces">Skip Traces</option>
						</select>
					</div>
					<div className="grid gap-1">
						<Label htmlFor="amount">Amount (use negative to deduct)</Label>
						<Input
							id="amount"
							type="number"
							step="1"
							{...register("amount", { valueAsNumber: true })}
						/>
					</div>
					<div className="grid gap-1">
						<Label htmlFor="reason">Reason</Label>
						<Input
							id="reason"
							placeholder="Why are you adjusting credits?"
							{...register("reason")}
						/>
					</div>
					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
							disabled={busy}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={busy}>
							Save
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
