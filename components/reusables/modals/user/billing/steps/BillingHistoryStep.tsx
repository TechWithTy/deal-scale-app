import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BillingHistoryItem } from "@/constants/_faker/profile/userData";
import type { FC } from "react"; // * Use type-only import for React.FC

// * BillingHistoryStep displays user's billing history in a table

interface BillingHistoryStepProps {
	billingHistory: BillingHistoryItem[];
}

const BillingHistoryStep: FC<BillingHistoryStepProps> = ({
	billingHistory,
}) => (
	<div className="mt-6">
		{/* * Billing History Section */}
		<h3 className="font-medium text-lg dark:text-gray-200">Billing History</h3>
		<Separator className="my-2 dark:border-gray-600" />
		<div className="grid grid-cols-4 gap-2 border-b pb-2 font-semibold text-muted-foreground text-sm dark:text-gray-400">
			<div>Invoice</div>
			<div>Amount</div>
			<div>Date</div>
			<div>Status</div>
		</div>
		{billingHistory.map((entry) => (
			<div
				key={entry.invoice}
				className="mt-2 grid grid-cols-4 items-center gap-2 border-b py-2 text-sm dark:border-gray-700"
			>
				<div className="overflow-auto whitespace-nowrap">{entry.invoice}</div>
				<div>{entry.amount}</div>
				<div>{entry.date.toLocaleDateString()}</div>
				<div className="flex items-center">
					<Badge
						className={
							entry.status === "Unpaid"
								? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
								: "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
						}
					>
						{entry.status}
					</Badge>
				</div>
			</div>
		))}
	</div>
);

export default BillingHistoryStep;
