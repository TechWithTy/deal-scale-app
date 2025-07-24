import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
// * HelpModal.tsx
// ! Modal for property search walkthrough/help
import type { FC, ReactNode } from "react";

interface HelpModalProps {
	open: boolean;
	onClose: () => void;
	children?: ReactNode;
	title?: string;
}

const HelpModal: FC<HelpModalProps> = ({
	open,
	onClose,
	children,
	title = "Property Search Help",
}) => (
	<Dialog open={open} onOpenChange={onClose}>
		<DialogContent className="max-w-md">
			<DialogHeader>
				<DialogTitle>{title}</DialogTitle>
			</DialogHeader>
			<div className="py-2 text-gray-600 text-sm dark:text-gray-300">
				{children}
			</div>
		</DialogContent>
	</Dialog>
);

export default HelpModal;
