"use client";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ModalProps {
	title: string;
	description: string;
	isOpen: boolean;
	onClose: () => void;
	children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
	title,
	description,
	isOpen,
	onClose,
	children,
}) => {
	const onChange = (open: boolean) => {
		if (!open) {
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onChange}>
			<DialogContent className="text-center">
				<DialogHeader className="text-center">
					<DialogTitle className="text-center font-medium text-lg">
						{title}
					</DialogTitle>
					<DialogDescription className="text-center text-muted-foreground text-sm">
						{description}
					</DialogDescription>
				</DialogHeader>
				<div className="text-center">{children}</div>
			</DialogContent>
		</Dialog>
	);
};
