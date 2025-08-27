"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockTeamMembers } from "@/constants/_faker/profile/team/members";

interface TeamMemberDropdownProps {
	assignedUserId: string;
	setAssignedUserId: (id: string) => void;
}

export function TeamMemberDropdown({
	assignedUserId,
	setAssignedUserId,
}: TeamMemberDropdownProps) {
	const selectedMember = mockTeamMembers?.find((m) => m.id === assignedUserId);

	return (
		<div className="grid grid-cols-4 items-center gap-4">
			<label htmlFor="team-member-select" className="col-span-1 font-semibold">
				Assign To:
			</label>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="outline"
						className="col-span-3"
						id="team-member-select"
						aria-haspopup="listbox"
					>
						{selectedMember
							? `${selectedMember.firstName} ${selectedMember.lastName}`
							: "Select Team Member"}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{(mockTeamMembers || []).map((member) => (
						<DropdownMenuItem
							key={member.id}
							onSelect={() => setAssignedUserId(member.id)}
						>
							{member.firstName} {member.lastName}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
