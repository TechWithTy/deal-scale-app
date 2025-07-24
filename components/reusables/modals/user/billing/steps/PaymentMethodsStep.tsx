import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PaymentDetails } from "@/constants/_faker/profile/userData";
import type { UserProfileSubscription } from "@/constants/_faker/profile/userSubscription";
import type { FC } from "react"; // * Use type-only import for React.FC
import ManageSubscriptionModal from "./ManageSubscriptionModal";

// * PaymentMethodsStep displays user's payment info and subscription management

interface PaymentMethodsStepProps {
	paymentDetails: PaymentDetails;
	subscription: UserProfileSubscription;
	onAddPaymentMethod: () => void;
}
interface ManageSubscriptionModalProps {
	subscription: UserProfileSubscription;
}

const PaymentMethodsStep: FC<PaymentMethodsStepProps> = ({
	paymentDetails,
	subscription,
	onAddPaymentMethod,
}) => (
	<div className="mt-4 dark:text-gray-300">
		{/* * Payment Methods Section */}
		<h3 className="font-medium text-lg dark:text-gray-200">Payment Methods</h3>
		<Separator className="my-2 dark:border-gray-600" />
		<div className="flex w-full flex-col items-center justify-center space-y-2">
			<p className="text-center font-medium text-sm dark:text-gray-300">
				{paymentDetails.cardType} ending in {paymentDetails.cardLastFour}
			</p>
			<p className="text-center text-muted-foreground text-sm dark:text-gray-400">
				Expiry {paymentDetails.expiry}
			</p>
			<Button
				onClick={onAddPaymentMethod}
				variant="link"
				className="mt-4 p-0 text-blue-600 dark:text-blue-400"
				type="button"
			>
				+ Add new payment method
			</Button>
		</div>
	</div>
);

export default PaymentMethodsStep;
