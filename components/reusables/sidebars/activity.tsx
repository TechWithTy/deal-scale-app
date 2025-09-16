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
		<div className="fixed top-0 right-0 z-50 flex h-screen w-80 flex-col border-border border-l bg-card text-card-foreground shadow-lg">
			{/* Header */}
			<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-border border-b bg-muted p-4">
				<h2 className="font-semibold text-foreground text-lg">
					{leadData.contactInfo.firstName} Activity
				</h2>
				<button
					type="button"
					className="text-muted-foreground hover:text-foreground"
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
							<span className="font-bold text-foreground">You</span>
							<span className="text-muted-foreground text-sm">
								{note.timestamp}
							</span>
						</div>
						<div className="rounded-lg bg-primary p-3 text-primary-foreground">
							{note.text}
						</div>
						<div className="mt-2 flex justify-end space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
							<button
								type="button"
								className="flex items-center rounded-full bg-muted p-1 text-muted-foreground hover:bg-muted/80"
								onClick={() => handleEdit(note)}
							>
								<Pencil className="h-4 w-4" />
							</button>
							<button
								type="button"
								className="flex items-center rounded-full bg-muted p-1 text-muted-foreground hover:bg-muted/80"
								onClick={() => handleDelete(note.id)}
							>
								<Trash2 className="h-4 w-4" />
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Input Area */}
			<div className="border-border border-t p-4">
				<textarea
					className="h-24 w-full resize-none rounded border border-input bg-transparent p-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					placeholder="Write an update..."
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				<div className="mt-2 flex justify-end">
					<button
						type="button"
						className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
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
