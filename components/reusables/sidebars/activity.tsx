import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import { Pencil, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface ActivitySidebarProps {
	onClose: () => void; // Prop to close the sidebar
	leadData: LeadTypeGlobal;
}

const ActivitySidebar: React.FC<ActivitySidebarProps> = ({
	onClose,
	leadData,
}) => {
	const [currentState, setCurrentState] = useState<
		"initial" | "writing" | "sent"
	>("initial");
	const [message, setMessage] = useState<string>(""); // Store the user's message
	const [postedMessage, setPostedMessage] = useState<string>(""); // Store the posted message

	// Handle post action
	const handlePost = () => {
		if (message.trim()) {
			setPostedMessage(message); // Save the posted message
			setMessage(""); // Clear the message field
			setCurrentState("sent"); // Move to the sent state
		}
	};

	// Handle edit action
	const handleEdit = () => {
		setMessage(postedMessage); // Prepopulate the textarea with the current message
		setCurrentState("writing"); // Switch to writing state
	};

	// Handle delete action
	const handleDelete = () => {
		setPostedMessage(""); // Clear the message
		setCurrentState("initial"); // Reset to initial state
	};

	return (
		<div className="fixed top-0 right-0 z-50 h-screen w-80 border-gray-200 border-l bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
			{/* Header */}
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-semibold text-lg dark:text-white">
					{" "}
					{leadData.firstName} Activity
				</h2>
				<button
					type="button"
					className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
					onClick={onClose} // Close sidebar
				>
					&times;
				</button>
			</div>

			{/* Initial State */}
			{currentState === "initial" && (
				<div>
					<input
						type="text"
						placeholder="Write an update..."
						className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
						onFocus={() => setCurrentState("writing")} // Transition to writing state
					/>
				</div>
			)}

			{/* Writing State */}
			{currentState === "writing" && (
				<div>
					<textarea
						className="h-32 w-full resize-none rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
						placeholder="Write your message here..."
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
					<button
						type="button"
						onClick={handlePost}
						className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Post
					</button>
				</div>
			)}

			{/* Message Sent State */}
			{currentState === "sent" && (
				<div>
					<div className="mb-2 flex items-center justify-between">
						<span className="font-bold dark:text-gray-100">You</span>
						<span className="text-gray-500 text-sm dark:text-gray-400">
							{new Date().toLocaleString()}
						</span>
					</div>
					<div className="mb-4 rounded-lg bg-blue-600 p-2 text-white">
						{postedMessage}
					</div>
					<div className="flex justify-end space-x-4">
						<button
							type="button"
							className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
							onClick={handleEdit} // Edit the message
						>
							<Pencil className="mr-1 h-5 w-5" />
							Edit
						</button>
						<button
							type="button"
							className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
							onClick={handleDelete} // Delete the message
						>
							<Trash2 className="mr-1 h-5 w-5" />
							Delete
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ActivitySidebar;
