"use client";

import CampaignIdentityForm from "./campaign/CampaignIdentityForm";
import OptimizationPanel from "./campaign/OptimizationPanel";
import TeamWorkflowForm from "./campaign/TeamWorkflowForm";

const CampaignBasicsStep = () => (
	<div data-testid="campaign-basics-step" className="space-y-6">
		<CampaignIdentityForm />
		<TeamWorkflowForm />
		<OptimizationPanel />
	</div>
);

export default CampaignBasicsStep;
