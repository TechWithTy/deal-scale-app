import { Sliders } from "lucide-react";

interface AdvancedSearchButtonProps {
	onClick: () => void;
}

const AdvancedSearchButton: React.FC<AdvancedSearchButtonProps> = ({
	onClick,
}) => {
	return (
		<div className="mt-5 flex w-full flex-col">
			<button
				type="button"
				className="flex h-11 w-full items-center justify-between gap-2 rounded bg-gray-200 px-4 py-2 font-medium text-gray-800 text-sm shadow-sm transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
				style={{ minHeight: "44px" }}
				onClick={onClick}
			>
				<span className="flex items-center gap-2">
					<Sliders size={18} />
					Advanced
				</span>
			</button>
		</div>
	);
};

export default AdvancedSearchButton;
