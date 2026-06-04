"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { mockGeneratedLeads, mockLeadListData } from "../utils/mocks";
import type { KanbanTask } from "../utils/types";
import type { ViewScope } from "../utils/viewStore";

interface TaskScopeSelectProps {
	tasks: KanbanTask[];
	scope: ViewScope;
	setScope: (scope: Partial<ViewScope>) => void;
}

function labelForLead(id: string) {
	const match = mockGeneratedLeads.find((lead) => lead.id === id);
	if (match) {
		return `${match.contactInfo.firstName} ${match.contactInfo.lastName}`.trim();
	}
	return `Lead ${id}`;
}

function labelForLeadList(id: string) {
	const match = mockLeadListData.find((list) => String(list.id) === id);
	return match?.listName ?? `Lead list ${id}`;
}

function unique<T>(values: T[]) {
	return [...new Set(values)];
}

export default function TaskScopeSelect({
	tasks,
	scope,
	setScope,
}: TaskScopeSelectProps) {
	const leadOptions = useMemo(
		() =>
			unique(tasks.flatMap((task) => (task.leadId ? [task.leadId] : []))).map(
				(leadId) => ({ value: leadId, label: labelForLead(leadId) }),
			),
		[tasks],
	);

	const leadListOptions = useMemo(
		() =>
			unique(
				tasks.flatMap((task) =>
					task.leadListId ? [String(task.leadListId)] : [],
				),
			).map((leadListId) => ({
				value: leadListId,
				label: labelForLeadList(leadListId),
			})),
		[tasks],
	);

	const currentOptions =
		scope.mode === "lead"
			? leadOptions
			: scope.mode === "leadList"
				? leadListOptions
				: [];

	return (
		<div className="flex flex-wrap items-end gap-3">
			<div className="flex min-w-[180px] flex-col gap-1">
				<Label>Scope</Label>
				<Select
					value={scope.mode}
					onValueChange={(value) => {
						if (value === "all") {
							setScope({ mode: "all", value: "" });
							return;
						}
						const options = value === "lead" ? leadOptions : leadListOptions;
						setScope({
							mode: value as ViewScope["mode"],
							value: options[0]?.value ?? "",
						});
					}}
				>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="All tasks" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All tasks</SelectItem>
						<SelectItem value="lead">Single lead</SelectItem>
						<SelectItem value="leadList">Lead list</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{scope.mode !== "all" ? (
				<div className="flex min-w-[240px] flex-col gap-1">
					<Label>{scope.mode === "lead" ? "Lead" : "Lead list"}</Label>
					<Select
						value={scope.value}
						onValueChange={(value) => setScope({ value })}
					>
						<SelectTrigger className="w-[240px]">
							<SelectValue
								placeholder={`Select ${scope.mode === "lead" ? "lead" : "lead list"}`}
							/>
						</SelectTrigger>
						<SelectContent>
							{currentOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			) : null}

			<Button
				type="button"
				variant="outline"
				className="mb-0.5"
				onClick={() => setScope({ mode: "all", value: "" })}
			>
				Clear scope
			</Button>
		</div>
	);
}
