"use client";

import { shallow } from "zustand/shallow";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";

const LeadNotesPanel = () => {
	const { leadNotes, setLeadNotes } = useQuickStartWizardDataStore(
		(state) => ({
			leadNotes: state.leadNotes,
			setLeadNotes: state.setLeadNotes,
		}),
		shallow,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">Lead Intake Notes</CardTitle>
				<CardDescription>
					Highlight import nuances, matching rules, or enrichment expectations
					for your team.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Textarea
					value={leadNotes}
					onChange={(event) => setLeadNotes(event.target.value)}
					placeholder="Example: Prioritize verified owners with mortgage balance under $400K. Include skip-trace for direct dial numbers."
					className="min-h-[120px]"
				/>
			</CardContent>
		</Card>
	);
};

export default LeadNotesPanel;
