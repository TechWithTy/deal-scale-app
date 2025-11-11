"use client";

import type React from "react";
import { useState } from "react";

interface SingleContactFormProps {
	onSubmit: (data: { name: string; address: string }) => void;
	submitting: boolean;
}

const SingleContactForm: React.FC<SingleContactFormProps> = ({
	onSubmit,
	submitting,
}) => {
	const [name, setName] = useState("");
	const [address, setAddress] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (name.trim() || address.trim()) {
			onSubmit({ name, address });
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 p-4">
			<div>
				<label
					htmlFor="name"
					className="block font-medium text-gray-700 text-sm dark:text-gray-300"
				>
					Full Name
				</label>
				<input
					type="text"
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					placeholder="John Doe"
				/>
			</div>
			<div>
				<label
					htmlFor="address"
					className="block font-medium text-gray-700 text-sm dark:text-gray-300"
				>
					Mailing Address
				</label>
				<input
					type="text"
					id="address"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					placeholder="123 Main St, Anytown, USA"
				/>
			</div>
			<div className="flex justify-end">
				<button
					type="submit"
					disabled={submitting || (!name.trim() && !address.trim())}
					className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{submitting ? "Tracing..." : "Skip Trace"}
				</button>
			</div>
		</form>
	);
};

export default SingleContactForm;
