"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/_utils/kanban/utils";

interface DatePickerWithRangeProps
	extends React.HTMLAttributes<HTMLDivElement> {
	from?: Date;
	to?: Date;
	setDateRange?: (dateRange: DateRange | undefined) => void; // Optional callback to return the selected date range
}

export const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({
	from,
	to,
	setDateRange,
	className,
}) => {
	// Initialize state with from/to props if provided, otherwise use default dates
	const [date, setDate] = React.useState<DateRange | undefined>({
		from: from || new Date(), // Use provided "from" date or default to today
		to: to || undefined, // Use provided "to" date or leave it undefined for optional end date
	});

	// Update the state and invoke callback if provided
	const handleSelect = (selectedDate: DateRange | undefined) => {
		setDate(selectedDate); // Update the internal state
		if (setDateRange) {
			setDateRange(selectedDate); // Pass the selected date range to parent via callback
		}
	};

	return (
		<div className={cn("grid gap-2", className)}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline"}
						type="button" // Set button type to button to avoid default form behavior
						className={cn(
							"w-[300px] justify-start text-left font-normal",
							!date && "text-muted-foreground",
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date?.from ? (
							date.to ? (
								<>
									{format(date.from, "LLL dd, y")} -{" "}
									{format(date.to, "LLL dd, y")}
								</>
							) : (
								<>{format(date.from, "LLL dd, y")}</>
							)
						) : (
							<span>Pick a date</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-auto p-0"
					align="start"
					onClick={(e) => e.stopPropagation()}
				>
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={date?.from}
						selected={date}
						onSelect={handleSelect} // Update date when range is selected
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
};
