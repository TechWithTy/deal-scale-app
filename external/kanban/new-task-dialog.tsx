"use client";

import { useState } from "react";
import { NewTaskForm } from "./new-task-dialog/NewTaskForm";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

export default function NewTaskDialog() {
	const [formValid, setFormValid] = useState(false);

	return (
		<Dialog onOpenChange={(isOpen) => !isOpen && setFormValid(false)}>
			<DialogTrigger asChild>
				<Button variant="secondary" size="sm" className="new-task-button">
					＋ Add New Todo
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Todo</DialogTitle>
					<DialogDescription>
						Add details for your new task (title, due date, assignee, and
						optional media).
					</DialogDescription>
				</DialogHeader>
				<NewTaskForm setFormValid={setFormValid} />
				<DialogFooter>
					<DialogClose asChild>
						<Button
							type="submit"
							size="sm"
							form="todo-form"
							disabled={!formValid}
						>
							Add Todo
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
