"use client";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { KanbanTask } from "../utils/types";
import { AssignmentTypeDropdown } from "./new-task-dialog/AssignmentTypeDropdown";
import { LeadDropdown } from "./new-task-dialog/LeadDropdown";
import { LeadListDropdown } from "./new-task-dialog/LeadListDropdown";
import { TeamMemberDropdown } from "./new-task-dialog/TeamMemberDropdown";
import { TaskFormFields } from "./new-task-dialog/TaskFormFields";
import { AiControls } from "./task-dialog/components/AiControls";
import { RotateCcw, Sparkles } from "lucide-react";
import { AiPreviewEditor } from "./task-dialog/components/AiPreviewEditor";
import { useEditTaskDialog } from "./task-dialog/hooks/useEditTaskDialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/lib/stores/userStore";

interface EditTaskDialogProps {
	task?: KanbanTask; // optional: when absent, dialog creates a new task
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode?: "edit" | "create"; // optional override; defaults from task presence
	initialTab?: "manual" | "ai"; // optional: choose which tab is active by default
	prefill?: {
		assignType?: "lead" | "leadList" | "";
		title?: string;
		description?: string;
		dueDate?: string;
		scheduledDate?: string;
		scheduledTimezone?: string;
		appointmentDateTime?: string;
		appointmentTimezone?: string;
		youtubeUrl?: string;
	};
}

export default function EditTaskDialog({
	task,
	open,
	onOpenChange,
	mode,
	initialTab,
	prefill,
}: EditTaskDialogProps) {
	const {
		effectiveMode,
		assignType,
		setAssignType,
		selectedLeadId,
		setSelectedLeadId,
		selectedLeadListId,
		setSelectedLeadListId,
		assignedUserId,
		setAssignedUserId,
		formValid,
		activeTab,
		setActiveTab,
		agentType,
		setAgentType,
		aiPreviewText,
		setAiPreviewText,
		aiPlanInput,
		aiPlanOutput,
		aiNeeds,
		aiMcp,
		setAiMcp,
		selectedAgentId,
		setSelectedAgentId,
		previewRef,
		mcpTools,
		needs,
		initialValues,
		handleSubmit,
		handleInputChange,
		resetPreview,
		mockAgentsByType,
		generatePreview,
		removeTool,
		removeNeed,
		setAiPlanOutput,
		mcpToolsOrdered,
		needsChips,
		toolNeedMap,
		needToolMap,
	} = useEditTaskDialog({
		task,
		open,
		onOpenChange,
		mode,
		initialTab,
		prefill,
	});

	const aiCostAmount: number = 0.25;
	const aiRemaining = useUserStore((s) => {
		const c = s.credits.ai;
		return Math.max(0, c.allotted - c.used);
	});
	const aiInsufficient = aiRemaining < aiCostAmount;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex h-[90vh] w-[95vw] max-w-2xl flex-col overflow-hidden bg-card p-0 text-card-foreground md:h-[85vh] md:max-w-3xl">
				<DialogHeader className="border-b px-6 pt-6 pb-3">
					<DialogTitle>
						{effectiveMode === "edit" ? "Edit Task" : "Create Task"}
					</DialogTitle>
				</DialogHeader>
				<div className="min-h-0 flex-1 overflow-y-auto px-6 py-3">
					<form
						id="edit-task-form"
						className="grid gap-4 py-2"
						onSubmit={handleSubmit}
						autoComplete="off"
					>
						<Tabs
							value={activeTab}
							onValueChange={(v) => setActiveTab(v as "manual" | "ai")}
						>
							<TabsList>
								<TabsTrigger value="manual">Manual</TabsTrigger>
								<TabsTrigger value="ai">AI</TabsTrigger>
							</TabsList>

							{/* Shared controls for both tabs */}
							<AssignmentTypeDropdown
								assignType={assignType}
								setAssignType={setAssignType}
							/>

							{assignType === "lead" && (
								<LeadDropdown
									selectedLeadId={selectedLeadId}
									setSelectedLeadId={(id: string) => setSelectedLeadId(id)}
								/>
							)}

							{assignType === "leadList" && (
								<LeadListDropdown
									selectedLeadListId={selectedLeadListId}
									setSelectedLeadListId={(id: string) =>
										setSelectedLeadListId(id)
									}
								/>
							)}

							<TeamMemberDropdown
								assignedUserId={assignedUserId}
								setAssignedUserId={setAssignedUserId}
							/>

							{/* Manual Tab Content */}
							<TabsContent value="manual" className="mt-2">
								<TaskFormFields
									assignType={assignType}
									initialValues={initialValues}
								/>
							</TabsContent>

							{/* AI Tab Content */}
							<TabsContent value="ai" className="mt-2 grid gap-3">
								<AiControls
									agentType={agentType}
									setAgentType={setAgentType}
									selectedAgentId={selectedAgentId}
									setSelectedAgentId={setSelectedAgentId}
									mockAgentsByType={mockAgentsByType}
									resetPreview={resetPreview}
								/>

								{/* Base form fields */}
								<TaskFormFields
									assignType={assignType}
									initialValues={initialValues}
								/>

								{/* Scheduled Date & Time is provided above in TaskFormFields */}

								{/* AI Preview */}
								<AiPreviewEditor
									aiPreviewText={aiPreviewText}
									setAiPreviewText={setAiPreviewText}
									aiPlanInput={aiPlanInput}
									aiPlanOutput={aiPlanOutput}
									setAiPlanOutput={setAiPlanOutput}
									aiNeeds={aiNeeds}
									aiMcp={aiMcp}
									setAiMcp={setAiMcp}
									previewRef={previewRef}
									mcpToolsOrdered={mcpToolsOrdered}
									needsChips={needsChips}
									onRemoveTool={removeTool}
									onRemoveNeed={removeNeed}
									toolNeedMap={toolNeedMap}
									needToolMap={needToolMap}
								/>

								{/* AI Credits banner */}
								<div className="rounded-md border bg-muted/40 px-3 py-2 text-muted-foreground text-xs">
									AI cost: {aiCostAmount} credit{aiCostAmount === 1 ? "" : "s"}{" "}
									· Remaining: {aiRemaining}
								</div>
							</TabsContent>
						</Tabs>
					</form>
				</div>
				<DialogFooter className="border-t px-6 pt-3 pb-6">
					<Button
						variant="outline"
						type="button"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					{activeTab === "ai" &&
						(() => {
							const hasPreview = Boolean(
								aiPlanInput || aiPlanOutput || aiNeeds || aiMcp,
							);
							return (
								<Button
									type="button"
									variant="secondary"
									disabled={!selectedAgentId}
									onClick={generatePreview}
								>
									{hasPreview ? (
										<span className="inline-flex items-center gap-2">
											<RotateCcw className="h-4 w-4" />
											Regenerate
										</span>
									) : (
										<span className="inline-flex items-center gap-2">
											<Sparkles className="h-4 w-4" />
											Generate Preview
										</span>
									)}
								</Button>
							);
						})()}
					<Button
						type="submit"
						form="edit-task-form"
						disabled={!formValid || (activeTab === "ai" && aiInsufficient)}
						title={
							activeTab === "ai" && aiInsufficient
								? "Not enough AI credits"
								: undefined
						}
					>
						{effectiveMode === "edit" ? "Save Changes" : "Create Task"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
