/**
 * Sales & Audience Targeting Component
 * Filters for buyer personas, motivation, budget, and investment profile
 * @module lookalike/components
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import { AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { BUYER_PERSONAS, MOTIVATION_LEVELS, type FormValues } from "../types";

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
			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label>Buyer Persona</Label>
					<div className="space-y-2 mt-2">
						{BUYER_PERSONAS.map((persona) => (
							<label key={persona} className="flex items-center gap-2">
								<Checkbox
									checked={form.watch("buyerPersona")?.includes(persona)}
									onCheckedChange={(checked) => {
										const current = form.watch("buyerPersona") || [];
										form.setValue(
											"buyerPersona",
											checked
												? [...current, persona]
												: current.filter((p) => p !== persona),
										);
									}}
								/>
								<span className="text-sm capitalize">
									{persona.replace("-", " ")}
								</span>
							</label>
						))}
					</div>
				</div>

				<div>
					<Label>Motivation Level</Label>
					<div className="space-y-2 mt-2">
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
			</div>

			<div className="grid grid-cols-2 gap-4">
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

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label>Budget Range</Label>
					<div className="flex gap-2 mt-1">
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
					<div className="flex gap-2 mt-1">
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

			<div className="flex items-center gap-4">
				<label className="flex items-center gap-2">
					<Checkbox
						checked={form.watch("cashBuyerOnly")}
						onCheckedChange={(checked) =>
							form.setValue("cashBuyerOnly", Boolean(checked))
						}
					/>
					<span className="text-sm">Cash Buyers Only</span>
				</label>

				<div className="flex-1">
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
			</div>
		</AccordionContent>
	);
}
