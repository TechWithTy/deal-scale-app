import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { MapFormSchemaType } from "@/types/_dashboard/maps";
// * AdvancedFiltersDialog.tsx
// ! Dialog for advanced search filters in the leads search UI
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";

interface AdvancedFiltersDialogProps {
	open: boolean;
	onClose: () => void;
	control: Control<MapFormSchemaType>;
	errors: FieldErrors<MapFormSchemaType>;
}

const AdvancedFiltersDialog: React.FC<AdvancedFiltersDialogProps> = ({
	open,
	onClose,
	control,
	errors,
}) => (
	<Dialog open={open} onOpenChange={onClose}>
		<DialogContent className="max-w-lg">
			<DialogHeader>
				<DialogTitle>Advanced Filters</DialogTitle>
			</DialogHeader>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				{/* Radius */}
				<Controller
					name="advanced.radius"
					control={control}
					render={({ field }) => (
						<div className="flex flex-col">
							<Label htmlFor="radius" className="mb-2">
								Radius (miles)
							</Label>
							<Input
								id="radius"
								placeholder="e.g. 5"
								type="number"
								min={0}
								{...field}
								className="w-full"
								error={errors.advanced?.radius?.message as string}
							/>
						</div>
					)}
				/>
				{/* Past Days */}
				<Controller
					name="advanced.pastDays"
					control={control}
					render={({ field }) => (
						<div className="flex flex-col">
							<Label htmlFor="pastDays" className="mb-2">
								Listed in Past (days)
							</Label>
							<Input
								id="pastDays"
								placeholder="e.g. 30"
								type="number"
								min={0}
								{...field}
								className="w-full"
								error={errors.advanced?.pastDays?.message as string}
							/>
						</div>
					)}
				/>
				{/* Date Range Start */}
				<Controller
					name="advanced.dateFrom"
					control={control}
					render={({ field }) => (
						<div className="flex flex-col">
							<Label htmlFor="dateStart" className="mb-2">
								Date Start
							</Label>
							<Input
								id="dateStart"
								placeholder="mm / dd / yyyy"
								type="date"
								{...field}
								className="w-full"
								error={errors.advanced?.dateFrom?.message as string}
							/>
						</div>
					)}
				/>
				{/* Date Range End */}
				<Controller
					name="advanced.dateTo"
					control={control}
					render={({ field }) => (
						<div className="flex flex-col">
							<Label htmlFor="dateEnd" className="mb-2">
								Date End
							</Label>
							<Input
								id="dateEnd"
								placeholder="mm / dd / yyyy"
								type="date"
								{...field}
								className="w-full"
								error={errors.advanced?.dateTo?.message as string}
							/>
						</div>
					)}
				/>
				{/* MLS Only Checkbox */}
				<Controller
					name="advanced.mlsOnly"
					control={control}
					render={({ field }) => (
						<div className="mt-2 flex flex-row items-center gap-2">
							<input
								id="mlsOnly"
								type="checkbox"
								checked={!!field.value}
								onChange={(e) => field.onChange(e.target.checked)}
								className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
							/>
							<Label htmlFor="mlsOnly">MLS Only</Label>
						</div>
					)}
				/>
			</div>
		</DialogContent>
	</Dialog>
);

export default AdvancedFiltersDialog;
