"use client";

import LeadNotesPanel from "./lead/LeadNotesPanel";
import LeadSourceSelector from "./lead/LeadSourceSelector";
import TargetMarketsPanel from "./lead/TargetMarketsPanel";

const LeadIntakeStep = () => (
	<div data-testid="lead-intake-step" className="space-y-6">
		<LeadSourceSelector />
		<TargetMarketsPanel />
		<LeadNotesPanel />
	</div>
);

export default LeadIntakeStep;
