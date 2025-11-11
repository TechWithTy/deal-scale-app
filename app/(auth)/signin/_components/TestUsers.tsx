"use client";

import { Button } from "@/components/ui/button";
import { users } from "@/lib/mock-db";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NewDemoUserButton } from "./test_users/NewDemoUserButton";
import { UserCard } from "./test_users/UserCard";
import { handleLogin, initializeEditableUsers } from "./test_users/userHelpers";
import type { EditableUser, TestUser } from "./test_users/userHelpers";
import {
	applyDemoLinkOverrides,
	parseDemoLinkOverrides,
	selectSeedUser,
} from "./test_users/urlOverrides";

// Type assertion to ensure users from mock-db match our TestUser type
const testUsers = users as unknown as TestUser[];
const STORAGE_KEY = "dealscale_custom_demo_users";

export function TestUsers() {
	// Track if component has hydrated to prevent SSR mismatch
	const [isHydrated, setIsHydrated] = useState(false);
	const [editableUsers, setEditableUsers] = useState<EditableUser[]>(() =>
		initializeEditableUsers(testUsers),
	);
	const [customUserIds, setCustomUserIds] = useState<Set<string>>(new Set());
	const linkUserIdsRef = useRef<Set<string>>(new Set());
	const searchParams = useSearchParams();
	const searchSignature = useMemo(
		() => (searchParams ? searchParams.toString() : ""),
		[searchParams],
	);
	const lastAppliedSignatureRef = useRef<string | null>(null);
	const autoLoginPerformedRef = useRef(false);

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
		// Mark as hydrated after loading localStorage
		setIsHydrated(true);
	}, []);

	// Save custom users to localStorage whenever they change
	useEffect(() => {
		try {
			const linkUserIds = linkUserIdsRef.current;
			const customUsers = editableUsers.filter(
				(u) => customUserIds.has(u.id) && !linkUserIds.has(u.id),
			);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(customUsers));
		} catch (error) {
			console.error("Failed to save custom demo users:", error);
		}
	}, [editableUsers, customUserIds]);

	useEffect(() => {
		if (!isHydrated) return;
		if (lastAppliedSignatureRef.current === searchSignature) return;

		lastAppliedSignatureRef.current = searchSignature;

		if (!searchSignature) return;

		const params = new URLSearchParams(searchSignature);
		const overrides = parseDemoLinkOverrides(params);

		if (!overrides) return;

		autoLoginPerformedRef.current = false;

		let updatedUser: EditableUser | null = null;
		let updatedUserId: string | null = null;
		let shouldAddAsCustom = false;

		setEditableUsers((prev) => {
			if (!prev.length) {
				return prev;
			}

			const baseUser = selectSeedUser(prev, overrides);
			if (!baseUser) {
				return prev;
			}

			const applied = applyDemoLinkOverrides(baseUser, overrides);

			const findTargetIndex = (users: readonly EditableUser[]) => {
				if (overrides.targetEmail) {
					const normalized = overrides.targetEmail.toLowerCase();
					const matchByEmail = users.findIndex(
						(user) => user.email.toLowerCase() === normalized,
					);
					if (matchByEmail >= 0) return matchByEmail;
				}
				if (overrides.targetId) {
					const matchById = users.findIndex(
						(user) => user.id === overrides.targetId,
					);
					if (matchById >= 0) return matchById;
				}
				return -1;
			};

			const nextUsers = [...prev];
			const targetIndex = findTargetIndex(prev);

			if (overrides.email) {
				applied.email = overrides.email;
			}
			if (overrides.name) {
				applied.name = overrides.name;
			}

			if (targetIndex >= 0) {
				nextUsers[targetIndex] = applied;
				updatedUser = applied;
				updatedUserId = applied.id;
				return nextUsers;
			}

			const newId =
				overrides.targetId ??
				`link-${Date.now().toString(36)}-${Math.random()
					.toString(36)
					.slice(2, 8)}`;
			applied.id = newId;
			updatedUser = applied;
			updatedUserId = newId;
			shouldAddAsCustom = true;
			return [...nextUsers, applied];
		});

		if (shouldAddAsCustom && updatedUserId) {
			linkUserIdsRef.current.add(updatedUserId);
			setCustomUserIds((prev) => new Set([...prev, updatedUserId!]));
		}

		if (overrides.autoLogin && updatedUser && !autoLoginPerformedRef.current) {
			autoLoginPerformedRef.current = true;
			void handleLogin(updatedUser);
		}
	}, [isHydrated, searchSignature]);

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
			if (linkUserIdsRef.current.has(id)) {
				linkUserIdsRef.current.delete(id);
			}
		}
	};

	// Don't render until hydrated to avoid SSR mismatch
	if (!isHydrated) {
		return (
			<div className="mx-auto mt-8 w-full max-w-md">
				<h2 className="mb-6 text-center font-semibold text-xl">Test Users</h2>
				<div className="text-center text-muted-foreground">Loading...</div>
			</div>
		);
	}

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
