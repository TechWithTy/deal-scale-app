import { AcceptInviteForm } from "./AcceptInviteForm";

export default function AcceptInvitePage({
	searchParams,
}: {
	searchParams: { token?: string };
}) {
	const token = searchParams.token ?? "";

	return (
		<div className="mx-auto w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
			<h1 className="font-semibold text-2xl">Join your team</h1>
			<p className="mt-2 mb-6 text-muted-foreground text-sm">
				Accept your Deal Scale organization invitation.
			</p>
			{token ? (
				<AcceptInviteForm token={token} />
			) : (
				<p className="text-destructive text-sm">
					This invitation link is missing its token.
				</p>
			)}
		</div>
	);
}
