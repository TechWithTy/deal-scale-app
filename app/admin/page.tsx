import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import PlatformAdminPlanTable from "@/components/admin/PlatformAdminPlanTable";
import { createPlatformAdminPlan } from "@/lib/admin/platformAdminPlan";

export default function AdminHomePage() {
	const plan = createPlatformAdminPlan();
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">
						Optimized Platform Admin Plan
					</CardTitle>
					<CardDescription>
						Delivery roadmap for Platform Admin &amp; Support workflows with N8N
						integration touchpoints.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PlatformAdminPlanTable plan={plan} />
				</CardContent>
			</Card>
		</div>
	);
}
