"use client";

import { useState, useEffect } from "react";
import { users } from "@/lib/mock-db";
import { UserCard } from "./test_users/UserCard";
import { NewDemoUserButton } from "./test_users/NewDemoUserButton";
import { handleLogin, initializeEditableUsers } from "./test_users/userHelpers";
import type { TestUser, EditableUser } from "./test_users/userHelpers";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Type assertion to ensure users from mock-db match our TestUser type
const testUsers = users as unknown as TestUser[];
const STORAGE_KEY = "dealscale_custom_demo_users";

export function TestUsers() {
	const [editableUsers, setEditableUsers] = useState<EditableUser[]>(() =>
		initializeEditableUsers(testUsers),
	);
	const [customUserIds, setCustomUserIds] = useState<Set<string>>(new Set());

	// Load custom users from localStorage on mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const customUsers = JSON.parse(stored) as EditableUser[];
				setEditableUsers((prev) => [...prev, ...customUsers]);
				setCustomUserIds(new Set(customUsers.map((u) => u.id)));
			}
		} catch (error) {
			console.error("Failed to load custom demo users:", error);
		}
	}, []);

	// Save custom users to localStorage whenever they change
	useEffect(() => {
		try {
			const customUsers = editableUsers.filter((u) => customUserIds.has(u.id));
			localStorage.setItem(STORAGE_KEY, JSON.stringify(customUsers));
		} catch (error) {
			console.error("Failed to save custom demo users:", error);
		}
	}, [editableUsers, customUserIds]);

	const updateUser = (
		id: string,
		updater: (u: EditableUser) => EditableUser,
	) => {
		setEditableUsers((prev) => prev.map((u) => (u.id === id ? updater(u) : u)));
	};

	const createUser = (user: EditableUser) => {
		setEditableUsers((prev) => [...prev, user]);
		setCustomUserIds((prev) => new Set([...prev, user.id]));
	};

	const deleteUser = (id: string) => {
		if (customUserIds.has(id)) {
			setEditableUsers((prev) => prev.filter((u) => u.id !== id));
			setCustomUserIds((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
		}
	};

	return (
		<div className="mx-auto mt-8 w-full max-w-md">
			<h2 className="mb-6 text-center font-semibold text-xl">Test Users</h2>
			<div className="mb-6">
				<NewDemoUserButton onCreateUser={createUser} />
			</div>
			<div className="flex flex-col gap-6">
				{editableUsers.map((user) => (
					<div key={user.id} className="relative">
						{customUserIds.has(user.id) && (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="absolute top-2 right-2 z-10 h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
								onClick={() => deleteUser(user.id)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
						<UserCard
							user={user}
							onUpdateUser={updateUser}
							onLogin={handleLogin}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
