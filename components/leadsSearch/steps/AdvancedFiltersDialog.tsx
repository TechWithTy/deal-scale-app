import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
							<Label htmlFor="radius">Radius (miles)</Label>
							<input
								id="radius"
								type="number"
								min={0}
								className="rounded border border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
								placeholder="e.g. 5"
								{...field}
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
							<Label htmlFor="pastDays">Listed in Past (days)</Label>
							<input
								id="pastDays"
								type="number"
								min={0}
								className="rounded border border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
								placeholder="e.g. 30"
								{...field}
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
							<Label htmlFor="dateStart">Date Start</Label>
							<input
								id="dateStart"
								type="date"
								className="rounded border border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
								{...field}
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
							<Label htmlFor="dateEnd">Date End</Label>
							<input
								id="dateEnd"
								type="date"
								className="rounded border border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
								{...field}
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
