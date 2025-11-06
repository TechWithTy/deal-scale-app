import { Button } from "@root/components/ui/button";
import { Play, Square } from "lucide-react";

interface Settings {
	animationDuration: number;
	maxPlayers: number;
	headerDelay: number;
	tableDelay: number;
	footerDelay: number;
	tableRowDuration: number;
	tableRowDelayMultiplier: number;
	refreshIntervalMs: number;
}

interface Props {
	animationEnabled: boolean;
	setAnimationEnabled: (v: boolean) => void;
	settings: Settings;
	setSettings: (s: Settings) => void;
}

export const LeaderboardSettingsPanel = ({
	animationEnabled,
	setAnimationEnabled,
	settings,
	setSettings,
}: Props) => {
	return (
		<details className="mt-6">
			<summary className="cursor-pointer font-medium text-sm">
				Customize Settings
			</summary>
			<div className="mt-2 grid grid-cols-1 gap-3 rounded bg-muted p-3 sm:grid-cols-2 sm:gap-4 sm:p-4">
				<div className="flex items-center gap-2 sm:col-span-2">
					{animationEnabled ? (
						<Button
							type="button"
							size="sm"
							variant="destructive"
							onClick={() => setAnimationEnabled(false)}
							className="flex-1 sm:flex-initial"
						>
							<Square className="mr-2 h-4 w-4" /> Stop
						</Button>
					) : (
						<Button
							type="button"
							size="sm"
							variant="default"
							onClick={() => setAnimationEnabled(true)}
							className="flex-1 sm:flex-initial"
						>
							<Play className="mr-2 h-4 w-4" /> Play
						</Button>
					)}
					<span className="text-muted-foreground text-xs">
						Animations {animationEnabled ? "enabled" : "disabled"}
					</span>
				</div>

				<div>
					<label
						htmlFor="animationDuration"
						className="block font-medium text-sm"
					>
						Animation Duration
					</label>
					<input
						id="animationDuration"
						type="number"
						step={0.1}
						value={settings.animationDuration}
						onChange={(e) =>
							setSettings({
								...settings,
								animationDuration: Number.parseFloat(e.target.value),
							})
						}
						className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div>
					<label htmlFor="maxPlayers" className="block font-medium text-sm">
						Max Players
					</label>
					<input
						id="maxPlayers"
						type="number"
						value={settings.maxPlayers}
						onChange={(e) =>
							setSettings({
								...settings,
								maxPlayers: Number.parseInt(e.target.value),
							})
						}
						className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div>
					<label htmlFor="headerDelay" className="block font-medium text-sm">
						Header Delay
					</label>
					<input
						id="headerDelay"
						type="number"
						step={0.1}
						value={settings.headerDelay}
						onChange={(e) =>
							setSettings({
								...settings,
								headerDelay: Number.parseFloat(e.target.value),
							})
						}
						className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div>
					<label htmlFor="tableDelay" className="block font-medium text-sm">
						Table Delay
					</label>
					<input
						id="tableDelay"
						type="number"
						step={0.1}
						value={settings.tableDelay}
						onChange={(e) =>
							setSettings({
								...settings,
								tableDelay: Number.parseFloat(e.target.value),
							})
						}
						className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div>
					<label htmlFor="footerDelay" className="block font-medium text-sm">
						Footer Delay
					</label>
					<input
						id="footerDelay"
						type="number"
						step={0.1}
						value={settings.footerDelay}
						onChange={(e) =>
							setSettings({
								...settings,
								footerDelay: Number.parseFloat(e.target.value),
							})
						}
						className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div>
					<label
						htmlFor="tableRowDuration"
						className="block font-medium text-sm"
					>
						Row Duration
					</label>
					<input
						id="tableRowDuration"
						type="number"
						step={0.1}
						value={settings.tableRowDuration}
						onChange={(e) =>
							setSettings({
								...settings,
								tableRowDuration: Number.parseFloat(e.target.value),
							})
						}
						className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div>
					<label
						htmlFor="tableRowDelayMultiplier"
						className="block font-medium text-sm"
					>
						Row Delay Multiplier
					</label>
					<input
						id="tableRowDelayMultiplier"
						type="number"
						step={0.01}
						value={settings.tableRowDelayMultiplier}
						onChange={(e) =>
							setSettings({
								...settings,
								tableRowDelayMultiplier: Number.parseFloat(e.target.value),
							})
						}
						className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div>
					<label
						htmlFor="refreshInterval"
						className="block font-medium text-sm"
					>
						Refresh Interval (minutes)
					</label>
					<input
						id="refreshInterval"
						type="number"
						min={1}
						step={1}
						value={Math.round(settings.refreshIntervalMs / 60000)}
						onChange={(e) =>
							setSettings({
								...settings,
								refreshIntervalMs: Math.max(
									60000,
									Number.parseInt(e.target.value || "1") * 60000,
								),
							})
						}
						className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
			</div>
		</details>
	);
};
