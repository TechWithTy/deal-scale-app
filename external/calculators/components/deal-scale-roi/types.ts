import type {
	DealScaleBenchmarkKey,
	DealScaleProfileRoiMetrics,
	DealScaleRoiMetrics,
} from "../../utils/dealScaleRoi";
import type {
	DealScalePlanId,
	DealScalePlanPricing,
} from "../../constants/dealScalePricing";

export interface DealScaleSessionDefaults {
	personaId?: string;
	goalId?: string;
}

export interface DealScaleSessionLike {
	tier?: string;
	quickStartDefaults?: DealScaleSessionDefaults | null;
}

export interface DealScaleRoiCalculatorProps {
	session?: DealScaleSessionLike | null;
	className?: string;
}

export interface ManualInputsState {
	plan: DealScalePlanId;
	leadsGenerated: string;
	conversionRate: string;
	avgDealValue: string;
	callsMade: string;
	smsThreads: string;
	socialThreads: string;
}

export interface ProfileInputsState {
	dealsPerMonth: string;
	avgDealValue: string;
	months: string;
	profitMarginPercent: string;
	monthlyOverhead: string;
	hoursPerDeal: string;
}

export interface ManualRoiTabProps {
	currentTierLabel: string;
	inputs: ManualInputsState;
	onInputsChange: (field: keyof ManualInputsState, value: string) => void;
	onPlanChange: (plan: DealScalePlanId) => void;
	metrics: DealScaleRoiMetrics;
	selectedPlan: DealScalePlanId;
}

export interface ProfileRoiTabProps {
	personaLabel: string;
	goalLabel: string;
	tierLabel: string;
	inputs: ProfileInputsState;
	avgDaysToClose: string;
	onAvgDaysChange: (value: string) => void;
	onInputsChange: (field: keyof ProfileInputsState, value: string) => void;
	onSelectBenchmark: (key: DealScaleBenchmarkKey) => void;
	selectedBenchmark: DealScaleBenchmarkKey | null;
	metrics: DealScaleProfileRoiMetrics;
	planPricing: DealScalePlanPricing;
	benchmarkPresets: Record<
		DealScaleBenchmarkKey,
		{
			dealsPerMonth: number;
			dealValue: number;
			profitMargin: number;
			daysToClose: number;
			hoursPerDeal: number;
			overhead: number;
			badge: string;
			sublabel: string;
		}
	>;
}
