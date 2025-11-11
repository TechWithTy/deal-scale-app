"use client";

import { useCallback, useRef, useState } from "react";

const DEFAULT_DURATIONS: Record<LaunchPhaseKey, number> = {
	configuring: 800,
	branding: 1200,
	training: 1400,
};

export type LaunchPhaseKey = "configuring" | "branding" | "training";

export type LaunchStatus = "idle" | LaunchPhaseKey | "done" | "error";

export interface LaunchProgressMachineOptions {
	durations?: Partial<Record<LaunchPhaseKey, number>>;
	onDone?: () => void;
	onError?: (error: unknown) => void;
}

export interface LaunchProgressMachine {
	status: LaunchStatus;
	open: boolean;
	isRunning: boolean;
	start: (execute?: () => Promise<void> | void) => Promise<boolean>;
	reset: () => void;
	setOpen: (open: boolean) => void;
}

const wait = (duration: number) =>
	new Promise<void>((resolve) => {
		window.setTimeout(resolve, duration);
	});

export const useLaunchProgressMachine = (
	options: LaunchProgressMachineOptions = {},
): LaunchProgressMachine => {
	const durationsRef = useRef({
		...DEFAULT_DURATIONS,
		...(options.durations ?? {}),
	});
	const [status, setStatus] = useState<LaunchStatus>("idle");
	const [open, setOpen] = useState(false);
	const [isRunning, setIsRunning] = useState(false);

	const start = useCallback<LaunchProgressMachine["start"]>(
		async (execute) => {
			if (isRunning) {
				return false;
			}

			setIsRunning(true);
			setOpen(true);
			setStatus("configuring");

			try {
				const executeWrapper = async () => {
					try {
						await execute?.();
						return null;
					} catch (error) {
						return error;
					}
				};
				const executionResultPromise = executeWrapper();

				await wait(durationsRef.current.configuring);
				setStatus("branding");

				await wait(durationsRef.current.branding);
				setStatus("training");

				await wait(durationsRef.current.training);
				const executionError = await executionResultPromise;
				if (executionError) {
					throw executionError;
				}

				setStatus("done");
				options.onDone?.();
				return true;
			} catch (error) {
				console.error("[LaunchProgressMachine] launch failed", error);
				setStatus("error");
				options.onError?.(error);
				return false;
			} finally {
				setIsRunning(false);
			}
		},
		[isRunning, options],
	);

	const reset = useCallback(() => {
		setStatus("idle");
		setOpen(false);
	}, []);

	return {
		status,
		open,
		isRunning,
		start,
		reset,
		setOpen,
	};
};

export default useLaunchProgressMachine;
