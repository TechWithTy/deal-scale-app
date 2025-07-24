"use client"; // Ensure it's a client-side component

import { Breadcrumbs } from "@/components/breadcrumbs";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import NewTaskDialog from "@/components/kanban/new-task-dialog";
import PageContainer from "@/components/layout/page-container";
import PropertySearchModal from "@/components/reusables/tutorials/walkthroughModal"; // Import the help modal
import { Heading } from "@/components/ui/heading";
import { HelpCircle } from "lucide-react"; // Import Help icon
import { useState } from "react"; // Import useState for modal visibility

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Kanban", link: "/dashboard/kanban" },
];

const campaignSteps = [
	{
		target: ".kanban-board",
		content: "This is the Kanban board where you can manage your tasks.",
	},
	{
		target: ".new-task-button",
		content: "Click here to create a new task.",
	},
];

export default function Page() {
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false); // State for help modal
	const [isTourOpen, setIsTourOpen] = useState(false); // State for tour

	const handleHelpOpenModal = () => setIsHelpModalOpen(true);
	const handleHelpCloseModal = () => setIsHelpModalOpen(false);
	const handleHelpStartTour = () => setIsTourOpen(true);
	const handleHelpCloseTour = () => setIsTourOpen(false);

	return (
		<PageContainer>
			<div className="space-y-4">
				<Breadcrumbs items={breadcrumbItems} />
				<div className="flex items-start justify-between">
					<Heading title="Kanban" description="Manage tasks " />
					{/* Help button to trigger the modal */}
					<button
						type="button"
						onClick={handleHelpOpenModal}
						title="Get More help"
						className="animate-bounce rounded-full bg-blue-500 p-2 text-white hover:animate-none dark:bg-green-700 dark:text-gray-300"
					>
						<HelpCircle size={20} />
					</button>
					<NewTaskDialog />
				</div>
				<KanbanBoard />
			</div>

			{/* Help Modal */}
			<PropertySearchModal
				isOpen={isHelpModalOpen}
				onClose={handleHelpCloseModal}
				videoUrl="https://www.youtube.com/embed/example-video" // Example YouTube video URL
				title="Welcome to Kanban Board"
				subtitle="Learn how to manage your tasks effectively using this Kanban board."
				steps={campaignSteps} // Steps for the tour
				isTourOpen={isTourOpen}
				onStartTour={handleHelpStartTour}
				onCloseTour={handleHelpCloseTour}
			/>
		</PageContainer>
	);
}
