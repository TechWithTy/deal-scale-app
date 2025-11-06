/**
 * UsageModalActions: Enhanced modal action buttons with better CTAs
 */
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, X } from "lucide-react";
import type React from "react";

interface UsageModalActionsProps {
	onClose: () => void;
	onViewPlans: () => void;
	onManageBilling?: () => void;
	isFreePlan?: boolean;
	hasActiveSubscription?: boolean;
}

const UsageModalActions: React.FC<UsageModalActionsProps> = ({
	onClose,
	onViewPlans,
	onManageBilling,
	isFreePlan = false,
	hasActiveSubscription = false,
}) => {
	return (
		<div className="flex flex-col gap-3 border-gray-200 border-t pt-6 dark:border-gray-700">
			{/* Primary CTA */}
			<div className="flex gap-3">
				{isFreePlan ? (
					// For free plan users, emphasize upgrade
					<Button
						onClick={onViewPlans}
						className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
						size="lg"
					>
						View Upgrade Plans
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				) : (
					// For paid plan users
					<>
						<Button
							onClick={onViewPlans}
							variant="outline"
							className="flex-1"
							size="lg"
						>
							Change Plan
						</Button>
						{onManageBilling && (
							<Button
								onClick={onManageBilling}
								variant="outline"
								className="flex-1"
								size="lg"
							>
								Manage Billing
								<ExternalLink className="ml-2 h-4 w-4" />
							</Button>
						)}
					</>
				)}
			</div>

			{/* Secondary Actions */}
			<div className="flex justify-center">
				<Button
					onClick={onClose}
					variant="ghost"
					size="sm"
					className="text-gray-600 dark:text-gray-400"
				>
					<X className="mr-2 h-4 w-4" />
					Close
				</Button>
			</div>

			{/* Help Text */}
			{isFreePlan && (
				<p className="text-center text-gray-500 text-xs dark:text-gray-400">
					Upgrade now to unlock more AI credits, leads, and premium features
				</p>
			)}
		</div>
	);
};

export default UsageModalActions;
