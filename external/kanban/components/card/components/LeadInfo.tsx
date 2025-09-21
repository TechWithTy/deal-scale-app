"use client";

import { mockGeneratedLeads, mockLeadListData } from "../../../utils/mocks";
import type { KanbanTask } from "../../../utils/types";

export function LeadInfo({ task }: { task: KanbanTask }) {
	const showAppointment =
		(!!task.appointmentDate || !!task.appointmentTime) &&
		!!task.leadId &&
		!task.leadListId;

	return (
		<div className="mt-2 text-sm">
			{task.leadId ? (
				<div>
					<span className="font-semibold">Lead: </span>
					{Array.isArray(mockGeneratedLeads) ? (
						(() => {
							const lead = mockGeneratedLeads.find(
								(l) => String(l.id) === String(task.leadId),
							);
							return lead ? (
								`${lead.contactInfo.firstName} ${lead.contactInfo.lastName}`
							) : (
								<span className="text-muted-foreground italic">
									Lead not found
								</span>
							);
						})()
					) : (
						<span className="text-muted-foreground italic">
							No lead assigned
						</span>
					)}
				</div>
			) : task.leadListId ? (
				<div>
					<span className="font-semibold">Lead List: </span>
					{Array.isArray(mockLeadListData) ? (
						(() => {
							const leadList = mockLeadListData.find(
								(l) => String(l.id) === String(task.leadListId),
							);
							return leadList ? (
								leadList.listName
							) : (
								<span className="text-muted-foreground italic">
									Lead list not found
								</span>
							);
						})()
					) : (
						<span className="text-muted-foreground italic">
							No lead list assigned
						</span>
					)}
				</div>
			) : (
				<div>
					<span className="text-muted-foreground italic">
						No lead or lead list assigned
					</span>
				</div>
			)}

			{showAppointment && (
				<div className="mt-2">
					<span className="font-semibold">Appointment: </span>
					{task.appointmentDate && (
						<span className="text-muted-foreground">
							{task.appointmentDate}
						</span>
					)}
					{task.appointmentDate && task.appointmentTime && <span> @ </span>}
					{task.appointmentTime && (
						<span className="text-muted-foreground">
							{task.appointmentTime}
						</span>
					)}
				</div>
			)}
		</div>
	);
}
