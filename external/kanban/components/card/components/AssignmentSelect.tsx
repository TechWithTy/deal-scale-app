"use client";

import { mockTeamMembers } from "../../../utils/mocks";

export function AssignmentSelect({
	value,
	onChange,
}: {
	value: string;
	onChange: (val: string) => void;
}) {
	return (
		<div className="mt-2 text-sm">
			<span className="my-2 font-semibold">Assigned To: </span>
			<select
				value={value || ""}
				onChange={(e) => onChange(e.target.value)}
				className="ml-2 rounded border p-1"
			>
				<option value="" disabled>
					Select team member
				</option>
				{mockTeamMembers.map((member) => (
					<option key={member.id} value={member.id}>
						{`${member.firstName} ${member.lastName}`}
					</option>
				))}
			</select>
		</div>
	);
}
