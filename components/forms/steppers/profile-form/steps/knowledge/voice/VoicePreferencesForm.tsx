import { MonetizationToggle } from "@/components/reusables/ai/shared/MonetizationToggle";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export interface VoiceCreationPreferences {
	voiceUsage: "call" | "voicemail" | "dual";
	knowledgeBaseEnabled: boolean;
	aiTrainingEnabled: boolean;
	monetizationEnabled: boolean;
	priceMultiplier: number;
	acceptedTerms: boolean;
}

interface VoicePreferencesFormProps {
	preferences: VoiceCreationPreferences;
	onChange: (prefs: VoiceCreationPreferences) => void;
	showUsageSelector?: boolean;
}

export const VoicePreferencesForm: React.FC<VoicePreferencesFormProps> = ({
	preferences,
	onChange,
	showUsageSelector = false,
}) => {
	const update = (partial: Partial<VoiceCreationPreferences>) =>
		onChange({ ...preferences, ...partial });

	return (
		<div className="space-y-4">
			{showUsageSelector && (
				<div className="space-y-1">
					<Label htmlFor="voice-usage-selector" className="font-medium text-sm">
						Voice Usage Profile
					</Label>
					<Select
						value={preferences.voiceUsage}
						onValueChange={(value) =>
							update({
								voiceUsage: value as VoiceCreationPreferences["voiceUsage"],
							})
						}
					>
						<SelectTrigger id="voice-usage-selector" className="mt-1">
							<SelectValue placeholder="Select usage" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="call">Outbound Call Voice</SelectItem>
							<SelectItem value="voicemail">Voicemail Voice</SelectItem>
							<SelectItem value="dual">
								Dual Purpose (Call + Voicemail)
							</SelectItem>
						</SelectContent>
					</Select>
					<p className="text-muted-foreground text-xs">
						Determines how call/voicemail flags are pre-filled for new voices.
					</p>
				</div>
			)}

			<div className="grid gap-3 sm:grid-cols-2">
				<div className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-card/40 p-3">
					<div>
						<Label className="font-medium text-sm">Add to Knowledge Base</Label>
						<p className="text-muted-foreground text-xs">
							Make this voice searchable across scripts and playbooks.
						</p>
					</div>
					<Switch
						checked={preferences.knowledgeBaseEnabled}
						onCheckedChange={(checked) =>
							update({ knowledgeBaseEnabled: checked })
						}
					/>
				</div>
				<div className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-card/40 p-3">
					<div>
						<Label className="font-medium text-sm">Enable AI Training</Label>
						<p className="text-muted-foreground text-xs">
							Allow this voice to power AI coaching, QA, and simulations.
						</p>
					</div>
					<Switch
						checked={preferences.aiTrainingEnabled}
						onCheckedChange={(checked) =>
							update({ aiTrainingEnabled: checked })
						}
					/>
				</div>
			</div>

			<div className="rounded-md border border-emerald-200/70 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-900/20">
				<MonetizationToggle
					enabled={preferences.monetizationEnabled}
					onEnabledChange={(enabled) =>
						update({
							monetizationEnabled: enabled,
							acceptedTerms: enabled ? preferences.acceptedTerms : false,
						})
					}
					priceMultiplier={preferences.priceMultiplier}
					onPriceMultiplierChange={(value) =>
						update({ priceMultiplier: value })
					}
					acceptedTerms={preferences.acceptedTerms}
					onAcceptedTermsChange={(value) => update({ acceptedTerms: value })}
					itemType="voice"
				/>
			</div>
		</div>
	);
};
