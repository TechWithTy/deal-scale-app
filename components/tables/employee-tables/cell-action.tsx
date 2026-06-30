"use client";

import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteTeamMember } from "@/lib/api/public-api-dashboard";
import { TEAM_MEMBER_DELETED_EVENT } from "@/lib/team/member-events";
import type { TeamMember } from "@/types/userProfile";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CellActionProps {
	data: TeamMember;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const { data: session } = useSession();

	const onConfirm = async () => {
		const token = session?.publicApi?.accessToken;
		if (!token) {
			toast.error("Public API login required to delete a team member.");
			return;
		}
		setLoading(true);
		try {
			await deleteTeamMember(String(data.id), token);
			window.dispatchEvent(
				new CustomEvent(TEAM_MEMBER_DELETED_EVENT, {
					detail: String(data.id),
				}),
			);
			setOpen(false);
			toast.success("Team member removed");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Unable to remove team member",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<AlertModal
				isOpen={open}
				onClose={() => setOpen(false)}
				onConfirm={onConfirm}
				loading={loading}
			/>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="h-8 w-8 p-0"
						onClick={(e) => e.stopPropagation()}
						onPointerDown={(e) => e.stopPropagation()}
					>
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					onClick={(e) => e.stopPropagation()}
					onPointerDown={(e) => e.stopPropagation()}
				>
					<DropdownMenuLabel>Actions</DropdownMenuLabel>

					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation();
							router.push(`/dashboard/employee/${data.id}`);
						}}
					>
						<Edit className="mr-2 h-4 w-4" /> Update
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation();
							setOpen(true);
						}}
					>
						<Trash className="mr-2 h-4 w-4" /> Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};
