import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import type { CellContext } from "@tanstack/react-table";

export function SocialsCell({ row }: CellContext<LeadTypeGlobal, unknown>) {
	const { socials } = row.original;
	return (
		<div className="flex flex-col space-y-2">
			{socials?.facebook && (
				<a
					href={socials.facebook}
					target="_blank"
					className="text-blue-500 hover:underline"
					rel="noreferrer"
				>
					Facebook
				</a>
			)}
			{socials?.linkedin && (
				<a
					href={socials.linkedin}
					target="_blank"
					className="text-blue-500 hover:underline"
					rel="noreferrer"
				>
					LinkedIn
				</a>
			)}
			{socials?.instagram && (
				<a
					href={socials.instagram}
					target="_blank"
					className="text-blue-500 hover:underline"
					rel="noreferrer"
				>
					Instagram
				</a>
			)}
		</div>
	);
}
