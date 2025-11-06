/**
 * PricingComparisonCard: Shows available upgrade options with feature comparison
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	SUBSCRIPTION_PLANS,
	type SubscriptionPlan,
} from "@/constants/subscription/plans";
import {
	ArrowRight,
	Check,
	Crown,
	Sparkles,
	Star,
	TrendingUp,
} from "lucide-react";
import type React from "react";

interface PricingComparisonCardProps {
	currentPlanId: string;
	onSelectPlan: (planId: string) => void;
	billingCycle?: "monthly" | "yearly";
}

const PricingComparisonCard: React.FC<PricingComparisonCardProps> = ({
	currentPlanId,
	onSelectPlan,
	billingCycle = "monthly",
}) => {
	// Get upgrade options (plans above current)
	const currentIndex = SUBSCRIPTION_PLANS.findIndex(
		(p) =>
			p.id === currentPlanId.toLowerCase() ||
			p.name.toLowerCase() === currentPlanId.toLowerCase(),
	);
	const upgradeOptions = SUBSCRIPTION_PLANS.slice(currentIndex + 1);

	if (upgradeOptions.length === 0) {
		return (
			<div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
				<Crown className="mx-auto mb-3 h-12 w-12 text-yellow-500" />
				<h3 className="mb-2 font-semibold text-gray-900 text-lg dark:text-white">
					You're on our best plan!
				</h3>
				<p className="text-gray-600 text-sm dark:text-gray-400">
					Enjoy all premium features and priority support.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
				<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
					Upgrade Your Plan
				</h3>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{upgradeOptions.map((plan) => (
					<PlanCard
						key={plan.id}
						plan={plan}
						billingCycle={billingCycle}
						onSelect={() => onSelectPlan(plan.id)}
					/>
				))}
			</div>
		</div>
	);
};

/**
 * Individual Plan Card
 */
interface PlanCardProps {
	plan: SubscriptionPlan;
	billingCycle: "monthly" | "yearly";
	onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
	plan,
	billingCycle,
	onSelect,
}) => {
	const price =
		billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
	const formattedPrice = `$${price.toLocaleString()}`;
	const savings =
		billingCycle === "yearly"
			? Math.round(
					((plan.monthlyPrice * 12 - plan.yearlyPrice) /
						(plan.monthlyPrice * 12)) *
						100,
				)
			: 0;

	const getPlanIcon = () => {
		if (plan.id === "enterprise") return <Crown className="h-5 w-5" />;
		if (plan.recommended) return <Sparkles className="h-5 w-5" />;
		if (plan.popular) return <Star className="h-5 w-5" />;
		return <TrendingUp className="h-5 w-5" />;
	};

	return (
		<div
			className={`relative overflow-hidden rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 ${
				plan.recommended
					? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50"
					: "border-gray-200 dark:border-gray-700"
			}`}
		>
			{/* Badges */}
			<div className="mb-4 flex items-center gap-2">
				{plan.recommended && (
					<Badge className="bg-blue-600 text-white">Recommended</Badge>
				)}
				{plan.popular && (
					<Badge
						variant="secondary"
						className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
					>
						Most Popular
					</Badge>
				)}
				{billingCycle === "yearly" && savings > 0 && (
					<Badge
						variant="outline"
						className="border-green-500 text-green-700 dark:text-green-400"
					>
						Save {savings}%
					</Badge>
				)}
			</div>

			{/* Plan Name and Icon */}
			<div className="mb-3 flex items-center gap-2">
				{getPlanIcon()}
				<h4 className="font-semibold text-gray-900 text-lg dark:text-white">
					{plan.displayName}
				</h4>
			</div>

			{/* Price */}
			<div className="mb-4">
				<div className="flex items-baseline gap-1">
					<span className="font-bold text-3xl text-gray-900 dark:text-white">
						{formattedPrice}
					</span>
					<span className="text-gray-500 text-sm dark:text-gray-400">
						/{billingCycle === "monthly" ? "mo" : "yr"}
					</span>
				</div>
				{billingCycle === "yearly" && (
					<p className="mt-1 text-gray-600 text-xs dark:text-gray-400">
						${Math.round(plan.yearlyPrice / 12).toLocaleString()}/month billed
						annually
					</p>
				)}
			</div>

			{/* Description */}
			<p className="mb-4 text-gray-600 text-sm dark:text-gray-400">
				{plan.description}
			</p>

			{/* Key Features */}
			<div className="mb-6 space-y-2">
				<FeatureItem
					icon={<Check className="h-4 w-4" />}
					text={`${plan.features.aiCredits.toLocaleString()} AI Credits/month`}
				/>
				<FeatureItem
					icon={<Check className="h-4 w-4" />}
					text={`${plan.features.leads.toLocaleString()} Leads/month`}
				/>
				<FeatureItem
					icon={<Check className="h-4 w-4" />}
					text={`${plan.features.skipTraces} Skip Traces/month`}
				/>
				{plan.features.prioritySupport && (
					<FeatureItem
						icon={<Check className="h-4 w-4" />}
						text="Priority Support"
					/>
				)}
				{plan.features.customIntegrations && (
					<FeatureItem
						icon={<Check className="h-4 w-4" />}
						text="Custom Integrations"
					/>
				)}
			</div>

			{/* CTA Button */}
			<Button
				onClick={onSelect}
				className={`w-full ${
					plan.recommended
						? "bg-blue-600 hover:bg-blue-700"
						: "bg-gray-900 hover:bg-gray-800"
				}`}
			>
				Upgrade to {plan.displayName}
				<ArrowRight className="ml-2 h-4 w-4" />
			</Button>
		</div>
	);
};

/**
 * Feature Item Component
 */
interface FeatureItemProps {
	icon: React.ReactNode;
	text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text }) => (
	<div className="flex items-center gap-2 text-gray-700 text-sm dark:text-gray-300">
		<span className="text-green-600 dark:text-green-400">{icon}</span>
		<span>{text}</span>
	</div>
);

export default PricingComparisonCard;
