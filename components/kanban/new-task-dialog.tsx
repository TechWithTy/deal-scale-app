"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { mockTeamMembers } from "@/constants/_faker/profile/team/members";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { mockGeneratedLeads } from "@/constants/data";
import { mockLeadListData } from "@/constants/dashboard/leadList";
import { useTaskStore } from "@/lib/stores/taskActions";

export default function NewTaskDialog() {
	const addTask = useTaskStore((state) => state.addTask);
	const [assignType, setAssignType] = useState<"lead" | "leadList" | "">("");
	const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
	const [selectedLeadListId, setSelectedLeadListId] = useState<number | null>(
		null,
	);
	const [assignedUserId, setAssignedUserId] = useState<string>("");
	const [formValid, setFormValid] = useState(false);

	// ! Updated validation for due date
	// ! Use FormData.get to avoid TS errors and ensure type safety
	const validateForm = (form: HTMLFormElement) => {
		const formData = new FormData(form);
		const title = formData.get("title") as string | null;
		const description = formData.get("description") as string | null;
		const dueDate = formData.get("dueDate") as string | null;
		if (!title || !description || !dueDate) return false;
		if (!assignType) return false;
		if (assignType === "lead" && !selectedLeadId) return false;
		if (assignType === "leadList" && !selectedLeadListId) return false;
		if (!assignedUserId) return false;
		return true;
	};

	const handleInputChange = (e: React.FormEvent<HTMLFormElement>) => {
		setFormValid(validateForm(e.currentTarget));
	};

	// ! Updated to pass all required fields to addTask
	// ! Updated to collect and pass dueDate, appointmentDate, and appointmentTime
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);
		const { title, description, dueDate, appointmentDate, appointmentTime } =
			Object.fromEntries(formData);
		if (
			typeof title !== "string" ||
			typeof description !== "string" ||
			typeof dueDate !== "string"
		)
			return;
		const getString = (val: FormDataEntryValue | undefined) =>
			typeof val === "string" ? val : "";
		const getNumber = (val: FormDataEntryValue | undefined) =>
			typeof val === "number" ? val : undefined;
		const assignedToTeamMember = assignedUserId;
		const leadId =
			assignType === "lead" && selectedLeadId ? selectedLeadId : undefined;
		const leadListId =
			assignType === "leadList" && selectedLeadListId
				? selectedLeadListId
				: undefined;
		addTask(
			getString(title),
			getString(description),
			getString(assignedToTeamMember),
			getString(dueDate),
			appointmentTime &&
				typeof appointmentTime === "string" &&
				appointmentTime.length > 0
				? appointmentTime
				: undefined,
			leadId !== undefined ? String(leadId) : undefined,
			leadListId !== undefined ? String(leadListId) : undefined,
		);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="secondary" size="sm">
					＋ Add New Todo
				</Button>
			</DialogTrigger>
			{/* ! Make modal vertically scrollable if too much content */}
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Todo</DialogTitle>
					<DialogDescription>
						What do you want to get done today?
					</DialogDescription>
				</DialogHeader>
				<form
					id="todo-form"
					className="grid gap-4 py-4"
					onSubmit={handleSubmit}
					onInput={handleInputChange}
					autoComplete="off"
				>
					{/* Assignment Type Dropdown */}
					<div className="grid grid-cols-4 items-center gap-4">
						<label htmlFor="assign-type" className="col-span-1 font-semibold">
							Assign:
						</label>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="col-span-3">
									{assignType === "lead"
										? "Assign Lead"
										: assignType === "leadList"
											? "Assign Lead List"
											: "Select Type"}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onSelect={() => setAssignType("lead")}>
									Lead
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={() => setAssignType("leadList")}>
									Lead List
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Lead Dropdown */}
					{assignType === "lead" && (
						<div className="mt-2 grid grid-cols-4 items-center gap-4">
							<label className="col-span-1 font-semibold" htmlFor="lead-select">
								Lead
							</label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="col-span-3"
										id="lead-select"
										aria-haspopup="listbox"
									>
										{selectedLeadId
											? (() => {
													const lead = mockGeneratedLeads.find(
														(l) => String(l.id) === String(selectedLeadId),
													);
													return lead
														? `${lead.firstName} ${lead.lastName}`
														: "Select Lead";
												})()
											: "Select Lead"}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									{mockGeneratedLeads.map((lead) => (
										<DropdownMenuItem
											key={lead.id}
											onSelect={() => setSelectedLeadId(Number(lead.id))}
										>
											{lead.firstName} {lead.lastName}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					)}

					{/* Lead List Dropdown */}
					{assignType === "leadList" && (
						<div className="mt-2 grid grid-cols-4 items-center gap-4">
							<label
								className="col-span-1 font-semibold"
								htmlFor="lead-list-select"
							>
								Lead List
							</label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="col-span-3"
										id="lead-list-select"
										aria-haspopup="listbox"
									>
										{selectedLeadListId
											? (() => {
													const list = mockLeadListData.find(
														(l) => String(l.id) === String(selectedLeadListId),
													);
													return list ? list.listName : "Select Lead List";
												})()
											: "Select Lead List"}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									{mockLeadListData.map((list) => (
										<DropdownMenuItem
											key={list.id}
											onSelect={() => setSelectedLeadListId(Number(list.id))}
										>
											{list.listName}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					)}

					{/* Team Member Assignment Dropdown */}
					<div className="grid grid-cols-4 items-center gap-4">
						<label
							htmlFor="team-member-select"
							className="col-span-1 font-semibold"
						>
							Assign To:
						</label>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="col-span-3"
									id="team-member-select"
									aria-haspopup="listbox"
								>
									{assignedUserId
										? (() => {
												const member = mockTeamMembers?.find(
													(m) => m.id === assignedUserId,
												);
												return member
													? `${member.firstName} ${member.lastName}`
													: "Select Team Member";
											})()
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

					{/* Todo Title Field */}
					<div className="mb-2">
						<label
							htmlFor="title"
							className="mb-1 block font-medium text-gray-700 text-sm"
						>
							Todo Title
						</label>
						<Input
							id="title"
							name="title"
							placeholder="Enter a concise task title"
							aria-label="Todo Title"
							className="w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
							required
						/>
					</div>

					{/* Due Date Field */}
					<div className="mb-2">
						<label
							htmlFor="dueDate"
							className="mb-1 block font-medium text-gray-700 text-sm"
						>
							Due Date <span className="text-red-500">*</span>
						</label>
						<Input
							id="dueDate"
							name="dueDate"
							type="date"
							aria-label="Due Date"
							className="w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
							required
						/>
					</div>

					{/* Appointment Date & Time Fields - Only for single lead assignment */}
					{assignType === "lead" && (
						<>
							<div className="mb-2">
								<label
									htmlFor="appointmentDate"
									className="mb-1 block font-medium text-gray-700 text-sm"
								>
									Appointment Date{" "}
									<span className="text-gray-400">(optional)</span>
								</label>
								<Input
									id="appointmentDate"
									name="appointmentDate"
									type="date"
									aria-label="Appointment Date"
									className="w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
								/>
							</div>
							<div className="mb-2">
								<label
									htmlFor="appointmentTime"
									className="mb-1 block font-medium text-gray-700 text-sm"
								>
									Appointment Time{" "}
									<span className="text-gray-400">(optional)</span>
								</label>
								<Input
									id="appointmentTime"
									name="appointmentTime"
									type="time"
									aria-label="Appointment Time"
									className="w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
								/>
							</div>
						</>
					)}

					{/* Description Field */}
					<div className="mb-2">
						<label
							htmlFor="description"
							className="mb-1 block font-medium text-gray-700 text-sm"
						>
							Description
						</label>
						<Textarea
							id="description"
							name="description"
							placeholder="Add details, context, or acceptance criteria..."
							aria-label="Todo Description"
							className="min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
							required
						/>
					</div>
				</form>
				<DialogFooter>
					<DialogTrigger asChild>
						<Button
							type="submit"
							size="sm"
							form="todo-form"
							disabled={!formValid}
						>
							Add Todo
						</Button>
					</DialogTrigger>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
