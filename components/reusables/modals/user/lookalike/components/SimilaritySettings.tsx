/**
 * Similarity Settings Component
 * Controls for similarity threshold and target audience size
 * @module lookalike/components
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, Users } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "../types";

interface SimilaritySettingsProps {
	form: UseFormReturn<FormValues>;
	estimatedSize: number | null;
	isEstimating: boolean;
}

/**
 * Renders similarity threshold slider and target size input
 * Shows estimated audience size when available
 */
export function SimilaritySettings({
	form,
	estimatedSize,
	isEstimating,
}: SimilaritySettingsProps) {
	return (
		<div className="space-y-4 rounded-lg border p-4">
			<div className="flex items-center justify-between">
				<Label className="font-semibold text-base">Similarity Settings</Label>
				{estimatedSize !== null && (
					<Badge variant="secondary" className="gap-2 whitespace-nowrap">
						<Users className="h-3 w-3 shrink-0" />
						<span className="whitespace-nowrap">
							~{estimatedSize.toLocaleString()} leads
						</span>
						{isEstimating && (
							<Loader2 className="h-3 w-3 shrink-0 animate-spin" />
						)}
					</Badge>
				)}
			</div>

			<div className="space-y-3">
				<div>
					<Label htmlFor="threshold">
						Similarity Threshold: {form.watch("similarityThreshold")}%
					</Label>
					<Slider
						id="threshold"
						min={60}
						max={95}
						step={1}
						value={[form.watch("similarityThreshold")]}
						onValueChange={([value]) =>
							form.setValue("similarityThreshold", value)
						}
						className="mt-2"
					/>
					<p className="mt-1 text-muted-foreground text-xs">
						Higher = more similar (fewer results), Lower = broader reach (more
						results)
					</p>
				</div>

				<div>
					<Label htmlFor="targetSize">Target Audience Size</Label>
					<Input
						id="targetSize"
						type="number"
						min={10}
						max={10000}
						{...form.register("targetSize", { valueAsNumber: true })}
						placeholder="100"
					/>
				</div>
			</div>
		</div>
	);
}
