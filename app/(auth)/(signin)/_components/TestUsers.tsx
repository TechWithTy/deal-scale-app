"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { users } from "@/lib/mock-db";
import { uuid } from "uuidv4";
import type { User as UserType } from "@/types/user";

// Extend the User type to ensure password is required for test users
type TestUser = Omit<UserType, "password"> & {
	password: string; // Make password required for test users
};

// Type assertion to ensure users from mock-db match our TestUser type
const testUsers = users as unknown as TestUser[];

export function TestUsers() {
	const { theme } = useTheme();
	const router = useRouter();

	const handleLogin = async (user: TestUser) => {
		try {
			const response = await fetch("/api/auth/callback/credentials", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: user.email,
					password: user.password,
					redirect: false,
				}),
			});

			if (response.ok) {
				router.push("/dashboard");
			} else {
				const error = await response.json();
				toast.error(error.message || "Login failed");
			}
		} catch (error) {
			toast.error("An error occurred during login");
			console.error("Login error:", error);
		}
	};

	return (
		<div className="mx-auto mt-8 w-full max-w-md">
			<h2 className="mb-6 text-center font-semibold text-xl">Test Users</h2>
			<div className="flex flex-col gap-6">
				{testUsers.map((user) => (
					<Card key={user.id} className="w-full border-border shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<div
									className={`h-3 w-3 rounded-full ${
										user.role === "admin" ? "bg-green-500" : "bg-blue-500"
									}`}
								/>
								{user.name}
							</CardTitle>
							<CardDescription>{user.email}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm">
									<span className="font-medium">Role:</span>
									<span className="text-muted-foreground capitalize">
										{user.role}
									</span>
								</div>
								<div className="flex flex-col gap-2">
									<span className="font-medium text-sm">Permissions:</span>
									{user.permissions.map((permission, i) => (
										<span
											key={permission + uuid()}
											className="mr-1 mb-1 inline-block rounded-full bg-muted/80 px-2 py-0.5 text-xs"
										>
											{permission}
										</span>
									))}
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								onClick={() => handleLogin(user)}
								className="w-full"
								variant={theme === "dark" ? "outline" : "default"}
							>
								Login as {user.name.split(" ")[0]}
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
