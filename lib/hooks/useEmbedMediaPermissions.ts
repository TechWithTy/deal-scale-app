import { useCallback, useState } from "react";

export type MediaStatus = {
	status: "idle" | "pending" | "ready" | "error";
	message: string | null;
};

const SCREEN_PENDING = "Requesting screen share permission…";
const SCREEN_READY = "Screen sharing ready.";
const SCREEN_DENIED = "Screen share blocked.";

const CAMERA_PENDING = "Requesting camera permission…";
const CAMERA_READY = "Camera ready for AI collaboration.";
const CAMERA_DENIED = "Camera access blocked.";

async function notifyAi(kind: "screen" | "camera") {
	await Promise.resolve();
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent("dealScale:focusWidget:mediaReady", {
				detail: { kind },
			}),
		);
	}
}

export function useEmbedMediaPermissions(onError?: (error: Error) => void) {
	const [screenState, setScreenState] = useState<MediaStatus>({
		status: "idle",
		message: null,
	});
	const [cameraState, setCameraState] = useState<MediaStatus>({
		status: "idle",
		message: null,
	});

	const requestScreenShare = useCallback(async () => {
		setScreenState({ status: "pending", message: SCREEN_PENDING });
		try {
			const mediaDevices = navigator.mediaDevices;
			if (!mediaDevices?.getDisplayMedia) {
				throw new Error("Screen sharing is not supported in this browser.");
			}
			await mediaDevices.getDisplayMedia({ video: true, audio: false });
			await notifyAi("screen");
			setScreenState({ status: "ready", message: SCREEN_READY });
		} catch (error) {
			const resolved =
				error instanceof Error
					? error
					: new Error("Failed to start screen sharing.");
			setScreenState({ status: "error", message: SCREEN_DENIED });
			onError?.(resolved);
		}
	}, [onError]);

	const requestCameraShare = useCallback(async () => {
		setCameraState({ status: "pending", message: CAMERA_PENDING });
		try {
			const mediaDevices = navigator.mediaDevices;
			if (!mediaDevices?.getUserMedia) {
				throw new Error("Camera access is not supported in this browser.");
			}
			await mediaDevices.getUserMedia({ video: true, audio: true });
			await notifyAi("camera");
			setCameraState({ status: "ready", message: CAMERA_READY });
		} catch (error) {
			const resolved =
				error instanceof Error
					? error
					: new Error("Failed to start camera sharing.");
			setCameraState({ status: "error", message: CAMERA_DENIED });
			onError?.(resolved);
		}
	}, [onError]);

	return {
		screenState,
		cameraState,
		requestScreenShare,
		requestCameraShare,
	};
}
