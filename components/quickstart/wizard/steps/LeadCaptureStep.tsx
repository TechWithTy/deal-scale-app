"use client";

import { Inbox } from "lucide-react";
import { useMemo } from "react";
import { shallow } from "zustand/shallow";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	type CaptureOptions,
	useQuickStartWizardDataStore,
} from "@/lib/stores/quickstartWizardData";

const CAPTURE_TOGGLES: Array<{
	readonly key: keyof CaptureOptions;
	readonly title: string;
	readonly description: string;
	readonly type: "boolean" | "string";
}> = [
	{
		key: "enableWidget",
		title: "Website capture widget",
		description:
			"Enable DealScale’s widget to collect inbound property inquiries.",
		type: "boolean",
	},
	{
		key: "enableExtension",
		title: "Browser extension",
		description:
			"Allow reps to push prospects directly from property search tabs.",
		type: "boolean",
	},
	{
		key: "autoResponderEnabled",
		title: "Auto-responder",
		description: "Send immediate confirmation emails with dynamic content.",
		type: "boolean",
	},
	{
		key: "forwardingNumber",
		title: "Forwarding number",
		description: "Route hot leads to this number for instant qualification.",
		type: "string",
	},
	{
		key: "notifyEmail",
		title: "Notification email",
		description: "Send capture alerts to this inbox.",
		type: "string",
	},
];

const LeadCaptureStep = () => {
	const { captureOptions, setCaptureOption } = useQuickStartWizardDataStore(
		(state) => ({
			captureOptions: state.captureOptions,
			setCaptureOption: state.setCaptureOption,
		}),
		shallow,
	);

	const summary = useMemo(
		() =>
			[
				captureOptions.enableWidget ? "Widget enabled" : null,
				captureOptions.enableExtension ? "Extension enabled" : null,
				captureOptions.autoResponderEnabled ? "Auto-responder on" : null,
			]
				.filter(Boolean)
				.join(" • ") || "No automation toggles enabled",
		[captureOptions],
	);

	return (
		<div data-testid="lead-capture-step" className="space-y-6">
			<Card>
				<CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<CardTitle className="text-xl">Lead Capture Automations</CardTitle>
						<CardDescription>
							Define how inbound interest flows into DealScale and notifies your
							team.
						</CardDescription>
					</div>
					<Inbox className="hidden h-10 w-10 text-primary sm:block" />
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="rounded-lg border bg-muted/40 p-3 text-muted-foreground text-xs">
						{summary}
					</p>
					<div className="grid gap-3">
						{CAPTURE_TOGGLES.map(({ key, title, description, type }) => (
							<div
								key={key}
								className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="sm:pr-4">
									<p className="font-medium text-sm">{title}</p>
									<p className="text-muted-foreground text-xs leading-relaxed">
										{description}
									</p>
								</div>
								{type === "boolean" ? (
									<Switch
										checked={captureOptions[key] as boolean}
										onCheckedChange={(checked) =>
											setCaptureOption(key, checked)
										}
									/>
								) : (
									<Input
										value={captureOptions[key] as string}
										onChange={(event) =>
											setCaptureOption(key, event.target.value)
										}
										placeholder={
											key === "forwardingNumber"
												? "+1 (555) 555-0123"
												: "ops@dealscale.ai"
										}
										className="sm:max-w-xs"
									/>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Routing Notes</CardTitle>
					<CardDescription>
						Clarify next steps for agents once a capture event fires.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2 text-muted-foreground text-xs">
					<p>
						Forwarding Number:{" "}
						{captureOptions.forwardingNumber || "Not configured"}
					</p>
					<p>
						Notification Email: {captureOptions.notifyEmail || "Not configured"}
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default LeadCaptureStep;
