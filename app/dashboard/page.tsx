import { auth, signOut } from "@/auth";
import PageContainer from "@/components/layout/page-container";
import PropertySearch from "@/components/leadsSearch/PropertySearch";
import { Button } from "@/components/ui/button";

type EnhancedUser = {
	name?: string | null;
	email?: string | null;
	image?: string | null;
	role?: string;
	permissions?: string[];
	subscription?: {
		aiCredits?: { used?: number; allotted?: number };
		leads?: { used?: number; allotted?: number };
		skipTraces?: { used?: number; allotted?: number };
	};
};

export default async function Page() {
	const session = await auth();
	const user = session?.user as EnhancedUser | undefined;
	const subs = user?.subscription;

	return (
		<PageContainer scrollable={true}>
			<div className="flex flex-col items-center justify-center space-y-6 p-8">
				<h1 className="font-bold text-4xl">Welcome, {user?.name}!</h1>
				<div className="space-y-4 rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
					<p className="text-lg">
						Your role is:{" "}
						<span className="font-semibold text-primary">{user?.role}</span>
					</p>
					<div>
						<h2 className="font-semibold text-lg">Your Permissions:</h2>
						<ul className="list-inside list-disc pl-4">
							{user?.permissions?.map((permission) => (
								<li key={permission}>{permission}</li>
							))}
						</ul>
					</div>

					{/* Credits Summary */}
					<div>
						<h2 className="font-semibold text-lg">Your Credits:</h2>
						<ul className="list-inside list-disc pl-4 text-sm">
							<li>
								AI Credits:{" "}
								<span className="font-medium">
									{subs?.aiCredits?.used ?? 0} /{" "}
									{subs?.aiCredits?.allotted ?? 0}
								</span>
							</li>
							<li>
								Leads:{" "}
								<span className="font-medium">
									{subs?.leads?.used ?? 0} / {subs?.leads?.allotted ?? 0}
								</span>
							</li>
							<li>
								Skip Traces:{" "}
								<span className="font-medium">
									{subs?.skipTraces?.used ?? 0} /{" "}
									{subs?.skipTraces?.allotted ?? 0}
								</span>
							</li>
						</ul>
					</div>
				</div>
				<form
					action={async () => {
						"use server";
						await signOut();
					}}
				>
					<Button type="submit" size="lg">
						Sign Out
					</Button>
				</form>
			</div>
			<PropertySearch />
		</PageContainer>
	);
}
