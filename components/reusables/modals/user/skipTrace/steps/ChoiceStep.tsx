"use client";

import { List, User } from "lucide-react";
import type React from "react";

interface ChoiceStepProps {
	onSelect: (choice: "list" | "single") => void;
}

const ChoiceStep: React.FC<ChoiceStepProps> = ({ onSelect }) => {
	return (
		<div className="flex flex-col items-center justify-center p-8">
			<h3 className="mb-6 text-lg font-medium text-gray-800 dark:text-gray-200">
				How would you like to skip trace?
			</h3>
			<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
				<button
					type="button"
					className="flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-6 text-center transition-all hover:border-blue-500 hover:shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-400"
					onClick={() => onSelect("list")}
				>
					<List className="mb-3 h-8 w-8 text-blue-500" />
					<span className="font-semibold dark:text-white">Upload a List</span>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Trace a CSV file of contacts.
					</p>
				</button>
				<button
					type="button"
					className="flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-6 text-center transition-all hover:border-blue-500 hover:shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-400"
					onClick={() => onSelect("single")}
				>
					<User className="mb-3 h-8 w-8 text-blue-500" />
					<span className="font-semibold dark:text-white">Single Contact</span>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Trace by name or address.
					</p>
				</button>
			</div>
		</div>
	);
};

export default ChoiceStep;
