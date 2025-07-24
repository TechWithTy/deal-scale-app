import { auth, signOut } from "@/auth";
import PageContainer from "@/components/layout/page-container";
import PropertySearch from "@/components/leadsSearch/PropertySearch";
import { Button } from "@/components/ui/button";

export default async function Page() {
	const session = await auth();

	return (
		<PageContainer scrollable={true}>
			<div className="flex flex-col items-center justify-center space-y-6 p-8">
				<h1 className="font-bold text-4xl">Welcome, {session?.user?.name}!</h1>
				<div className="space-y-2 rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
					<p className="text-lg">
						Your role is:{" "}
						<span className="font-semibold text-primary">
							{session?.user?.role}
						</span>
					</p>
					<div>
						<h2 className="font-semibold text-lg">Your Permissions:</h2>
						<ul className="list-inside list-disc pl-4">
							{session?.user?.permissions?.map((permission) => (
								<li key={permission}>{permission}</li>
							))}
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
