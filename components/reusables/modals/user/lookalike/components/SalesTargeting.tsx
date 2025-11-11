/**
 * Sales & Audience Targeting Component
 * Filters for buyer personas, motivation, budget, and investment profile
 * @module lookalike/components
 */

"use client";

import { AccordionContent } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import { BUYER_PERSONAS, type FormValues, MOTIVATION_LEVELS } from "../types";
import { SalesAdvanced } from "./advanced/SalesAdvanced";
import { SalesEfficiency } from "./advanced/SalesEfficiency";

interface SalesTargetingProps {
	form: UseFormReturn<FormValues>;
}

/**
 * Renders sales and audience targeting filters
 * Includes buyer persona, motivation, timeline, and financial filters
 */
export function SalesTargeting({ form }: SalesTargetingProps) {
	return (
		<AccordionContent className="space-y-4 pt-4">
			<div className="space-y-3">
				<div>
					<Label htmlFor="buyerPersona">Buyer Personas (comma-separated)</Label>
					<Input
						id="buyerPersona"
						placeholder="Investor, Wholesaler, Lender, Agent, Owner-Occupant"
						value={(form.watch("buyerPersona") || []).join(", ")}
						onChange={(e) => {
							const personas = e.target.value
								.split(",")
								.map((p) => p.trim())
								.filter(Boolean);
							form.setValue("buyerPersona", personas);
						}}
					/>
					<p className="mt-1 text-muted-foreground text-xs">
						Enter target buyer types separated by commas
					</p>
				</div>

				<div>
					<Label htmlFor="targetInterests">
						Target Interests (comma-separated)
					</Label>
					<Input
						id="targetInterests"
						placeholder="Real Estate Investing, Fix and Flip, Rental Properties"
						{...form.register("targetInterests")}
					/>
					<p className="mt-1 text-muted-foreground text-xs">
						Interests and topics relevant to your target audience
					</p>
				</div>

				<div>
					<Label htmlFor="targetIndustry">
						Target Industries (comma-separated)
					</Label>
					<Input
						id="targetIndustry"
						placeholder="Real Estate, Finance, Construction, Property Management"
						{...form.register("targetIndustry")}
					/>
					<p className="mt-1 text-muted-foreground text-xs">
						Industries or professions to target
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
				<div>
					<Label>Motivation Level</Label>
					<div className="mt-2 space-y-2">
						{MOTIVATION_LEVELS.map((level) => (
							<label key={level} className="flex items-center gap-2">
								<Checkbox
									checked={form.watch("motivationLevel")?.includes(level)}
									onCheckedChange={(checked) => {
										const current = form.watch("motivationLevel") || [];
										form.setValue(
											"motivationLevel",
											checked
												? [...current, level]
												: current.filter((l) => l !== level),
										);
									}}
								/>
								<span className="text-sm capitalize">{level}</span>
							</label>
						))}
					</div>
				</div>

				<div className="space-y-2">
					<Label>Quick Filters</Label>
					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("cashBuyerOnly")}
							onCheckedChange={(checked) =>
								form.setValue("cashBuyerOnly", Boolean(checked))
							}
						/>
						<span className="text-sm">Cash Buyers Only</span>
					</label>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
				<div>
					<Label htmlFor="timeline">Purchase Timeline</Label>
					<Select
						value={form.watch("purchaseTimeline") || ""}
						onValueChange={(value) => form.setValue("purchaseTimeline", value)}
					>
						<SelectTrigger id="timeline">
							<SelectValue placeholder="Any timeline" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">Any timeline</SelectItem>
							<SelectItem value="0-3months">0-3 months</SelectItem>
							<SelectItem value="3-6months">3-6 months</SelectItem>
							<SelectItem value="6-12months">6-12 months</SelectItem>
							<SelectItem value="12+months">12+ months</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label htmlFor="experience">Investment Experience</Label>
					<Select
						value={form.watch("investmentExperience") || ""}
						onValueChange={(value) =>
							form.setValue("investmentExperience", value)
						}
					>
						<SelectTrigger id="experience">
							<SelectValue placeholder="Any experience" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">Any experience</SelectItem>
							<SelectItem value="first-time">First-time</SelectItem>
							<SelectItem value="experienced">Experienced</SelectItem>
							<SelectItem value="professional">Professional</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
				<div>
					<Label>Budget Range</Label>
					<div className="mt-1 flex gap-2">
						<Input
							type="number"
							placeholder="Min"
							{...form.register("budgetMin", { valueAsNumber: true })}
						/>
						<Input
							type="number"
							placeholder="Max"
							{...form.register("budgetMax", { valueAsNumber: true })}
						/>
					</div>
				</div>

				<div>
					<Label>Credit Score Range</Label>
					<div className="mt-1 flex gap-2">
						<Input
							type="number"
							placeholder="Min"
							{...form.register("creditScoreMin", { valueAsNumber: true })}
						/>
						<Input
							type="number"
							placeholder="Max"
							{...form.register("creditScoreMax", { valueAsNumber: true })}
						/>
					</div>
				</div>
			</div>

			<div>
				<Label htmlFor="portfolio">Portfolio Size</Label>
				<Select
					value={form.watch("portfolioSize") || ""}
					onValueChange={(value) => form.setValue("portfolioSize", value)}
				>
					<SelectTrigger id="portfolio">
						<SelectValue placeholder="Any size" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">Any size</SelectItem>
						<SelectItem value="0-5">0-5 properties</SelectItem>
						<SelectItem value="5-20">5-20 properties</SelectItem>
						<SelectItem value="20-50">20-50 properties</SelectItem>
						<SelectItem value="50+">50+ properties</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Sales-Specific Nested Options */}
			<SalesEfficiency form={form} />
			<SalesAdvanced form={form} />
		</AccordionContent>
	);
}
