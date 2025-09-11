"use client";

import { useState } from "react";
import { users } from "@/lib/mock-db";
import { UserCard } from "./test_users/UserCard";
import { handleLogin, initializeEditableUsers } from "./test_users/userHelpers";
import type { TestUser, EditableUser } from "./test_users/userHelpers";
import type { User as UserType } from "@/types/user";

// Type assertion to ensure users from mock-db match our TestUser type
const testUsers = users as unknown as TestUser[];

export function TestUsers() {
	const [editableUsers, setEditableUsers] = useState<EditableUser[]>(() =>
		initializeEditableUsers(testUsers),
	);

	const updateUser = (
		id: string,
		updater: (u: EditableUser) => EditableUser,
	) => {
		setEditableUsers((prev) => prev.map((u) => (u.id === id ? updater(u) : u)));
	};

	return (
		<div className="mx-auto mt-8 w-full max-w-md">
			<h2 className="mb-6 text-center font-semibold text-xl">Test Users</h2>
			<div className="flex flex-col gap-6">
				{editableUsers.map((user) => (
					<UserCard
						key={user.id}
						user={user}
						onUpdateUser={updateUser}
						onLogin={handleLogin}
					/>
				))}
			</div>
		</div>
	);
}
