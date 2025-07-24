// ! UsageCloseButton: Standalone close button
import type React from "react";

interface UsageCloseButtonProps {
	onClick: () => void;
}

const UsageCloseButton: React.FC<UsageCloseButtonProps> = ({ onClick }) => (
	<button type="button" onClick={onClick} aria-label="Close modal">
		&times;
	</button>
);

export default UsageCloseButton;
