/**
 * Similarity Settings Component
 * Controls for similarity threshold and target audience size
 * @module lookalike/components
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2 } from "lucide-react";
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
				<Label className="text-base font-semibold">Similarity Settings</Label>
				{estimatedSize !== null && (
					<Badge variant="secondary" className="gap-2">
						<Users className="h-3 w-3" />~{estimatedSize.toLocaleString()} leads
						{isEstimating && <Loader2 className="h-3 w-3 animate-spin" />}
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
					<p className="text-muted-foreground text-xs mt-1">
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
