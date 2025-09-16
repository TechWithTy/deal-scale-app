"use client";

import { List, User } from "lucide-react";
import type React from "react";

interface ChoiceStepProps {
	onSelect: (choice: "list" | "single") => void;
}

const ChoiceStep: React.FC<ChoiceStepProps> = ({ onSelect }) => {
	return (
		<div className="flex flex-col items-center justify-center p-8">
			<h3 className="mb-6 font-medium text-foreground text-lg">
				How would you like to skip trace?
			</h3>
			<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
				<button
					type="button"
					className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-lg"
					onClick={() => onSelect("list")}
				>
					<List className="mb-3 h-8 w-8 text-primary" />
					<span className="font-semibold text-foreground">Upload a List</span>
					<p className="mt-1 text-muted-foreground text-sm">
						Trace a CSV file of contacts.
					</p>
				</button>
				<button
					type="button"
					className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-lg"
					onClick={() => onSelect("single")}
				>
					<User className="mb-3 h-8 w-8 text-primary" />
					<span className="font-semibold text-foreground">Single Contact</span>
					<p className="mt-1 text-muted-foreground text-sm">
						Trace by name or address.
					</p>
				</button>
			</div>
		</div>
	);
};

export default ChoiceStep;
