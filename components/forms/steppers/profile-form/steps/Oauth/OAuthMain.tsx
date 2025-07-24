import type React from "react";

interface OAuthMainProps {
	loading: boolean;
	initialData: unknown; // You can replace 'any' with a more specific type if available
}

export const OAuthMain: React.FC<OAuthMainProps> = ({
	loading,
	initialData,
}) => {
	return (
		<div className="flex w-full flex-col items-center p-4">
			<div className="rounded-lg bg-gray-100 p-8 text-center dark:bg-gray-800">
				<h2 className="font-semibold text-xl">Social Connections</h2>
				<p className="mt-2 text-muted-foreground">
					This feature is not available right now.
				</p>
			</div>
		</div>
	);
};
