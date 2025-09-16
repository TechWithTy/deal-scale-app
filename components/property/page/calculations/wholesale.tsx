"use client";

import { useState } from "react";

export default function WholesaleCalculator() {
	const [arv, setArv] = useState<number | "">(""); // After Repair Value
	const [repairs, setRepairs] = useState<number | "">(""); // Cost of Repairs
	const [assignmentFee, setAssignmentFee] = useState<number | "">(""); // Assignment Fee
	const [profitMargin, setProfitMargin] = useState<number>(0.7); // Profit Margin default to 70%

	// Calculate Max Allowable Offer
	const calculateMAO = () => {
		if (arv && repairs && assignmentFee !== "") {
			return arv * profitMargin - repairs - assignmentFee;
		}
		return 0;
	};

	const handleProfitMarginChange = (
		event: React.ChangeEvent<HTMLSelectElement>,
	) => {
		setProfitMargin(Number.parseFloat(event.target.value));
	};

	return (
		<div className="my-4 rounded-lg bg-card p-6 shadow-md text-card-foreground">
			<h2 className="mb-4 text-xl font-bold">Wholesale Calculator</h2>
			<p className="mb-4">
				Easily make the right wholesale offer with confidence.
			</p>

			{/* Responsive Grid */}
			<div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="flex flex-col">
					<label htmlFor="arv" className="mb-2 text-muted-foreground">
						After Repair Value (ARV)*
					</label>
					<input
						id="arv"
						name="arv"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2"
						placeholder="Enter the ARV"
						aria-label="After Repair Value"
						value={arv}
						onChange={(e) => setArv(Number(e.target.value))}
					/>
				</div>
				<div className="flex flex-col">
					<label htmlFor="repairs" className="mb-2 text-muted-foreground">
						Cost of Repairs*
					</label>
					<input
						type="number"
						className="rounded border border-input bg-background p-2"
						placeholder="Enter the repairs"
						value={repairs}
						onChange={(e) => setRepairs(Number(e.target.value))}
					/>
				</div>
				<div className="flex flex-col">
					<label htmlFor="assignmentFee" className="mb-2 text-muted-foreground">
						Assignment Fee*
					</label>
					<input
						type="number"
						className="rounded border border-input bg-background p-2"
						placeholder="Enter the assignment fee"
						value={assignmentFee}
						onChange={(e) => setAssignmentFee(Number(e.target.value))}
					/>
				</div>
				<div className="flex flex-col">
					<label htmlFor="profitMargin" className="mb-2 text-muted-foreground">
						Profit Margin*
					</label>
					<select
						className="rounded border border-input bg-background p-2"
						value={profitMargin}
						onChange={handleProfitMarginChange}
					>
						<option value={0.7}>70%</option>
						<option value={0.75}>75%</option>
						<option value={0.8}>80%</option>
					</select>
				</div>
			</div>

			<div className="mb-4 text-right">
				<span className="font-semibold text-muted-foreground">
					Max Allowable Offer (MAO):{" "}
				</span>
				<span className="font-bold">${calculateMAO().toLocaleString()}</span>
			</div>
		</div>
	);
}
