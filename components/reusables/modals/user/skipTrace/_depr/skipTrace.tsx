"use client";

import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import SkipTraceModalMain from "../SkipTraceModalMain";

interface SkipTraceModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const SkipTraceModal: React.FC<SkipTraceModalProps> = ({
	isOpen,
	onClose,
}) => {
	return (
		<Dialog.Root open={isOpen} onOpenChange={onClose}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70" />
				<Dialog.Content className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full max-w-lg transform rounded-lg bg-white p-0 shadow-lg focus:outline-none dark:bg-gray-900">
					<SkipTraceModalMain isOpen={isOpen} onClose={onClose} />
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};
