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

	return (
		<PageContainer scrollable={true}>
			<div className="p-6">
				<h1 className="mb-4 font-bold text-3xl text-foreground">
					Welcome{user?.name ? `, ${user.name}` : ""}!
				</h1>
			</div>
			<PropertySearch />
		</PageContainer>
	);
}
