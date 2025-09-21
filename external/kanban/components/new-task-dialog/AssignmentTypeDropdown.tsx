"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AssignmentTypeDropdownProps {
	assignType: "lead" | "leadList" | "";
	setAssignType: (type: "lead" | "leadList") => void;
}

export function AssignmentTypeDropdown({
	assignType,
	setAssignType,
}: AssignmentTypeDropdownProps) {
	return (
		<div className="grid grid-cols-4 items-center gap-4">
			<label htmlFor="assign-type" className="col-span-1 font-semibold">
				Assign:
			</label>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="col-span-3">
						{assignType === "lead"
							? "Assign Lead"
							: assignType === "leadList"
								? "Assign Lead List"
								: "Select Type"}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onSelect={() => setAssignType("lead")}>
						Lead
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => setAssignType("leadList")}>
						Lead List
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
