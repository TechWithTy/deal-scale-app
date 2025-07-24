import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import type { CellContext } from "@tanstack/react-table";

export function SocialsCell({ row }: CellContext<LeadTypeGlobal, unknown>) {
	const { socialLinks } = row.original;
	return (
		<div className="flex flex-col space-y-2">
			{socialLinks?.facebook && (
				<a
					href={socialLinks.facebook}
					target="_blank"
					className="text-blue-500 hover:underline"
					rel="noreferrer"
				>
					Facebook
				</a>
			)}
			{socialLinks?.linkedin && (
				<a
					href={socialLinks.linkedin}
					target="_blank"
					className="text-blue-500 hover:underline"
					rel="noreferrer"
				>
					LinkedIn
				</a>
			)}
			{socialLinks?.instagram && (
				<a
					href={socialLinks.instagram}
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
