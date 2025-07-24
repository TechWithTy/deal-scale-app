"use client";

import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import { Pencil, Trash2, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ActivitySidebarProps {
	leadData: LeadTypeGlobal;
	onClose: () => void;
}

interface ActivityNote {
	id: number;
	text: string;
	timestamp: string;
}

const ActivitySidebar: React.FC<ActivitySidebarProps> = ({
	leadData,
	onClose,
}) => {
	const [message, setMessage] = useState("");
	const [notes, setNotes] = useState<ActivityNote[]>([]);
	const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
	const [isMounted, setIsMounted] = useState(false);
	const [portalNode, setPortalNode] = useState<Element | null>(null);

	useEffect(() => {
		setIsMounted(true);
		setPortalNode(document.getElementById("sidebar-portal"));
	}, []);

	const handlePost = () => {
		if (message.trim()) {
			if (editingNoteId !== null) {
				setNotes(
					notes.map((note) =>
						note.id === editingNoteId ? { ...note, text: message } : note,
					),
				);
				setEditingNoteId(null);
			} else {
				const newNote: ActivityNote = {
					id: Date.now(),
					text: message,
					timestamp: new Date().toLocaleString(),
				};
				setNotes([newNote, ...notes]);
			}
			setMessage("");
		}
	};

	const handleEdit = (note: ActivityNote) => {
		setMessage(note.text);
		setEditingNoteId(note.id);
	};

	const handleDelete = (noteId: number) => {
		setNotes(notes.filter((note) => note.id !== noteId));
	};

	const sidebarContent = (
		<div className="fixed top-0 right-0 z-50 flex h-screen w-80 flex-col border-gray-200 border-l bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
			{/* Header */}
			<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-gray-200 border-b bg-slate-100 p-4 dark:border-gray-700 dark:bg-slate-700">
				<h2 className="font-semibold text-lg dark:text-white">
					{leadData.contactInfo.firstName} Activity
				</h2>
				<button
					type="button"
					className="text-gray-500 hover:text-gray-700 dark:text-gray-200 dark:hover:text-gray-100"
					onClick={onClose}
				>
					<X className="h-6 w-6" />
				</button>
			</div>

			{/* Notes List */}
			<div className="flex-grow overflow-y-auto p-4">
				{notes.map((note) => (
					<div key={note.id} className="group relative mb-4">
						<div className="mb-2 flex items-center justify-between">
							<span className="font-bold dark:text-gray-100">You</span>
							<span className="text-gray-500 text-sm dark:text-gray-400">
								{note.timestamp}
							</span>
						</div>
						<div className="rounded-lg bg-blue-600 p-3 text-white">
							{note.text}
						</div>
						<div className="mt-2 flex justify-end space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
							<button
								type="button"
								className="flex items-center rounded-full bg-gray-200 p-1 text-gray-600 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
								onClick={() => handleEdit(note)}
							>
								<Pencil className="h-4 w-4" />
							</button>
							<button
								type="button"
								className="flex items-center rounded-full bg-gray-200 p-1 text-gray-600 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
								onClick={() => handleDelete(note.id)}
							>
								<Trash2 className="h-4 w-4" />
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Input Area */}
			<div className="border-gray-200 border-t p-4 dark:border-gray-700">
				<textarea
					className="h-24 w-full resize-none rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
					placeholder="Write an update..."
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				<div className="mt-2 flex justify-end">
					<button
						type="button"
						className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
						onClick={handlePost}
					>
						{editingNoteId !== null ? "Update" : "Post"}
					</button>
				</div>
			</div>
		</div>
	);

	if (!isMounted || !portalNode) {
		return null;
	}

	return createPortal(sidebarContent, portalNode);
};

export default ActivitySidebar;
