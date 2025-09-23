"use client";

import { useEffect, useState } from "react";
import { PrizeWheel } from "../PrizeWheel";
import type { Prize, Cadence, SpinResult } from "../types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const LS_KEY = "wheel_demo_settings_v1";

const THEME_PRESETS = [
	{
		name: "Default",
		size: 240,
		spinUpMs: 200,
		spinDownMs: 1100,
		accentColor: "#6d28d9",
		textColor: "#ffffff",
	},
	{
		name: "Compact",
		size: 200,
		spinUpMs: 150,
		spinDownMs: 900,
		accentColor: "#0ea5e9",
		textColor: "#ffffff",
	},
	{
		name: "Bold",
		size: 280,
		spinUpMs: 220,
		spinDownMs: 1300,
		accentColor: "#ef4444",
		textColor: "#ffffff",
	},
	{
		name: "Slow",
		size: 260,
		spinUpMs: 400,
		spinDownMs: 2200,
		accentColor: "#22c55e",
		textColor: "#111827",
	},
];

const DemoWheel = () => {
	const [showResultModal, setShowResultModal] = useState(true);
	const [showWheelPopup, setShowWheelPopup] = useState(false);
	const [autoSpin, setAutoSpin] = useState(false);

	// Theme controls
	const [size, setSize] = useState(240);
	const [spinUpMs, setSpinUpMs] = useState(200);
	const [spinDownMs, setSpinDownMs] = useState(1100);
	const [accentColor, setAccentColor] = useState("#6d28d9");
	const [textColor, setTextColor] = useState("#ffffff");
	const [preset, setPreset] = useState<string>("Default");

	// Demo data kept internal
	const demoCadence: Cadence = "hourly";
	const demoUserId = "demo-user-123";
	const [prizes, setPrizes] = useState<Prize[]>([
		{ id: "p1", label: "10 Credits", weight: 2, color: "#6d28d9" },
		{ id: "p2", label: "Try Again", weight: 3, color: "#8b5cf6" },
		{ id: "p3", label: "25 Credits", weight: 1, color: "#d946ef" },
		{ id: "p4", label: "5 Credits", weight: 4, color: "#22c55e" },
	]);

	// Hydrate from localStorage
	useEffect(() => {
		try {
			const raw =
				typeof window !== "undefined"
					? window.localStorage.getItem(LS_KEY)
					: null;
			if (!raw) return;
			const saved = JSON.parse(raw) as {
				showResultModal?: boolean;
				showWheelPopup?: boolean;
				autoSpin?: boolean;
				size?: number;
				spinUpMs?: number;
				spinDownMs?: number;
				accentColor?: string;
				textColor?: string;
				preset?: string;
				prizes?: Prize[];
			};
			if (typeof saved.showResultModal === "boolean")
				setShowResultModal(saved.showResultModal);
			if (typeof saved.showWheelPopup === "boolean")
				setShowWheelPopup(saved.showWheelPopup);
			if (typeof saved.autoSpin === "boolean") setAutoSpin(saved.autoSpin);
			if (typeof saved.size === "number") setSize(saved.size);
			if (typeof saved.spinUpMs === "number") setSpinUpMs(saved.spinUpMs);
			if (typeof saved.spinDownMs === "number") setSpinDownMs(saved.spinDownMs);
			if (typeof saved.accentColor === "string")
				setAccentColor(saved.accentColor);
			if (typeof saved.textColor === "string") setTextColor(saved.textColor);
			if (typeof saved.preset === "string") setPreset(saved.preset);
			if (Array.isArray(saved.prizes)) setPrizes(saved.prizes);
		} catch {
			// ignore
		}
	}, []);

	// Persist to localStorage
	useEffect(() => {
		if (typeof window === "undefined") return;
		const data = {
			showResultModal,
			showWheelPopup,
			autoSpin,
			size,
			spinUpMs,
			spinDownMs,
			accentColor,
			textColor,
			preset,
			prizes,
		};
		try {
			window.localStorage.setItem(LS_KEY, JSON.stringify(data));
		} catch {
			// ignore
		}
	}, [
		showResultModal,
		showWheelPopup,
		autoSpin,
		size,
		spinUpMs,
		spinDownMs,
		accentColor,
		textColor,
		preset,
		prizes,
	]);

	function applyPreset(name: string) {
		setPreset(name);
		const p = THEME_PRESETS.find((x) => x.name === name);
		if (!p) return;
		setSize(p.size);
		setSpinUpMs(p.spinUpMs);
		setSpinDownMs(p.spinDownMs);
		setAccentColor(p.accentColor);
		setTextColor(p.textColor);
	}

	function addPrize() {
		const id = `p${String(Date.now())}`;
		setPrizes((prev) => [
			...prev,
			{ id, label: "New Prize", weight: 1, color: accentColor },
		]);
	}

	function updatePrize(id: string, patch: Partial<Prize>) {
		setPrizes((prev) =>
			prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
		);
	}

	function removePrize(id: string) {
		setPrizes((prev) => prev.filter((p) => p.id !== id));
	}

	function handleWin(result: SpinResult) {
		console.log("Wheel result:", result);
	}

	function resetDemoSettings() {
		// Clear persistence
		if (typeof window !== "undefined") {
			try {
				window.localStorage.removeItem(LS_KEY);
			} catch {}
		}
		// Reset toggles
		setShowResultModal(true);
		setShowWheelPopup(false);
		setAutoSpin(false);
		// Reset theme to Default preset
		applyPreset("Default");
		// Reset prizes
		setPrizes([
			{ id: "p1", label: "10 Credits", weight: 2, color: "#6d28d9" },
			{ id: "p2", label: "Try Again", weight: 3, color: "#8b5cf6" },
			{ id: "p3", label: "25 Credits", weight: 1, color: "#d946ef" },
			{ id: "p4", label: "5 Credits", weight: 4, color: "#22c55e" },
		]);
	}

	return (
		<div className="space-y-3">
			{/* Mode toggles */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<div className="flex items-center gap-2">
					<Switch
						id="show-result-modal-switch"
						checked={showResultModal}
						onCheckedChange={(v) => {
							setShowResultModal(v);
							if (v) setShowWheelPopup(false);
						}}
					/>
					<Label htmlFor="show-result-modal-switch" className="text-sm">
						Show Result Modal
					</Label>
				</div>
				<div className="flex items-center gap-2">
					<Switch
						id="show-wheel-popup-switch"
						checked={showWheelPopup}
						onCheckedChange={(v) => {
							setShowWheelPopup(v);
							if (v) setShowResultModal(false);
						}}
					/>
					<Label htmlFor="show-wheel-popup-switch" className="text-sm">
						Popup Wheel
					</Label>
				</div>
				<div className="flex items-center gap-2">
					<Switch
						id="auto-spin-switch"
						checked={autoSpin}
						onCheckedChange={setAutoSpin}
					/>
					<Label htmlFor="auto-spin-switch" className="text-sm">
						Auto Spin
					</Label>
				</div>
			</div>

			{/* Prize editor */}
			<div className="space-y-2 rounded border p-3">
				<div className="flex items-center justify-between">
					<h4 className="font-medium text-sm">Prizes</h4>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={addPrize}
							className="rounded bg-emerald-600 px-2 py-1 text-white text-xs hover:bg-emerald-700"
						>
							Add Prize
						</button>
						<button
							type="button"
							onClick={resetDemoSettings}
							className="rounded border border-border px-2 py-1 text-xs hover:bg-accent"
						>
							Reset Demo Settings
						</button>
					</div>
				</div>
				<div className="space-y-2">
					{prizes.map((p) => (
						<div
							key={p.id}
							className="grid grid-cols-1 items-start gap-2 sm:grid-cols-5"
						>
							<div className="col-span-2 flex items-center gap-2">
								<Label className="w-16 text-xs">Label</Label>
								<Input
									type="text"
									value={p.label}
									onChange={(e) => updatePrize(p.id, { label: e.target.value })}
									className="h-8"
								/>
							</div>
							<div className="flex flex-col gap-1">
								<Label className="w-16 text-xs">Weight</Label>
								<Input
									type="number"
									min={1}
									max={20}
									value={p.weight}
									onChange={(e) =>
										updatePrize(p.id, { weight: Number(e.target.value || 0) })
									}
									className={`h-8 w-24 ${!p.weight || p.weight < 1 ? "border-red-500" : ""}`}
								/>
								{!p.weight || p.weight < 1 ? (
									<span className="text-[11px] text-red-600">
										Weight must be at least 1
									</span>
								) : null}
							</div>
							<div className="flex items-center gap-2">
								<Label className="w-16 text-xs">Color</Label>
								<Input
									type="color"
									value={p.color}
									onChange={(e) => updatePrize(p.id, { color: e.target.value })}
									className="h-8 w-16 p-1"
								/>
							</div>
							<div className="flex justify-end">
								<button
									type="button"
									onClick={() => removePrize(p.id)}
									className="rounded bg-red-600 px-2 py-1 text-white text-xs hover:bg-red-700"
								>
									Remove
								</button>
							</div>
						</div>
					))}
					{/* Global validation hint */}
					{prizes.length === 0 ? (
						<p className="text-amber-600 text-xs">
							Add at least one prize to enable spinning.
						</p>
					) : null}
				</div>
			</div>

			{/* Theme controls */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<label className="flex items-center gap-2">
					<Label className="w-24 text-sm">Preset</Label>
					<select
						className="h-8 w-40 rounded border px-2 text-sm"
						value={preset}
						onChange={(e) => applyPreset(e.target.value)}
					>
						{THEME_PRESETS.map((p) => (
							<option key={p.name} value={p.name}>
								{p.name}
							</option>
						))}
					</select>
				</label>
				<label className="flex items-center gap-2" htmlFor="wheel-size">
					<Label className="w-24 text-sm" htmlFor="wheel-size">
						Size
					</Label>
					<Input
						id="wheel-size"
						type="number"
						value={size}
						min={160}
						max={400}
						onChange={(e) => setSize(Number(e.target.value || 0))}
						className="h-8 w-28"
					/>
				</label>
				<label className="flex items-center gap-2" htmlFor="spin-up-ms">
					<Label className="w-24 text-sm" htmlFor="spin-up-ms">
						Spin up (ms)
					</Label>
					<Input
						id="spin-up-ms"
						type="number"
						value={spinUpMs}
						min={50}
						max={2000}
						onChange={(e) => setSpinUpMs(Number(e.target.value || 0))}
						className="h-8 w-28"
					/>
				</label>
				<label className="flex items-center gap-2" htmlFor="spin-down-ms">
					<Label className="w-24 text-sm" htmlFor="spin-down-ms">
						Spin down (ms)
					</Label>
					<Input
						id="spin-down-ms"
						type="number"
						value={spinDownMs}
						min={200}
						max={5000}
						onChange={(e) => setSpinDownMs(Number(e.target.value || 0))}
						className="h-8 w-32"
					/>
				</label>
				<label className="flex items-center gap-2" htmlFor="accent-color">
					<Label className="w-24 text-sm" htmlFor="accent-color">
						Accent
					</Label>
					<Input
						id="accent-color"
						type="color"
						value={accentColor}
						onChange={(e) => setAccentColor(e.target.value)}
						className="h-8 w-16 p-1"
					/>
				</label>
				<label className="flex items-center gap-2" htmlFor="text-color">
					<Label className="w-24 text-sm" htmlFor="text-color">
						Text
					</Label>
					<Input
						id="text-color"
						type="color"
						value={textColor}
						onChange={(e) => setTextColor(e.target.value)}
						className="h-8 w-16 p-1"
					/>
				</label>
			</div>

			<div className="mt-2 flex justify-center">
				<PrizeWheel
					cadence={demoCadence}
					prizes={prizes}
					onWin={handleWin}
					userId={demoUserId}
					showCountdown
					showResultModal={showResultModal}
					showWheelPopup={showWheelPopup}
					autoSpin={autoSpin}
					allowAdminOverride
					className="py-2"
					theme={{ size, spinUpMs, spinDownMs, accentColor, textColor }}
				/>
			</div>
			<p className="text-muted-foreground text-xs">
				Note: Hourly cadence. Use admin reset for repeated testing.
			</p>
		</div>
	);
};

export default DemoWheel;
