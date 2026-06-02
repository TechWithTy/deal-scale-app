"use client";

import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";

export enum StreamingAvatarSessionState {
	INACTIVE = "inactive",
	CONNECTING = "connecting",
	CONNECTED = "connected",
}

type StreamingAvatarContextValue = {
	isMuted: boolean;
	setIsMuted: (isMuted: boolean) => void;
	isVoiceChatLoading: boolean;
	setIsVoiceChatLoading: (isVoiceChatLoading: boolean) => void;
	isVoiceChatActive: boolean;
	setIsVoiceChatActive: (isVoiceChatActive: boolean) => void;
	sessionState: StreamingAvatarSessionState;
	setSessionState: (sessionState: StreamingAvatarSessionState) => void;
	isListening: boolean;
	setIsListening: (isListening: boolean) => void;
	isUserTalking: boolean;
	setIsUserTalking: (isUserTalking: boolean) => void;
	isAvatarTalking: boolean;
	setIsAvatarTalking: (isAvatarTalking: boolean) => void;
	connectionQuality: "unknown" | "good" | "bad" | "poor";
	setConnectionQuality: (
		connectionQuality: "unknown" | "good" | "bad" | "poor",
	) => void;
};

const StreamingAvatarContext =
	createContext<StreamingAvatarContextValue | null>(null);

export function StreamingAvatarProvider({
	children,
}: {
	children: React.ReactNode;
	basePath?: string;
}) {
	const [isMuted, setIsMuted] = useState(true);
	const [isVoiceChatLoading, setIsVoiceChatLoading] = useState(false);
	const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
	const [sessionState, setSessionState] = useState(
		StreamingAvatarSessionState.CONNECTED,
	);
	const [isListening, setIsListening] = useState(false);
	const [isUserTalking, setIsUserTalking] = useState(false);
	const [isAvatarTalking, setIsAvatarTalking] = useState(false);
	const [connectionQuality, setConnectionQuality] = useState<
		"unknown" | "good" | "bad" | "poor"
	>("unknown");

	const value = useMemo(
		() => ({
			isMuted,
			setIsMuted,
			isVoiceChatLoading,
			setIsVoiceChatLoading,
			isVoiceChatActive,
			setIsVoiceChatActive,
			sessionState,
			setSessionState,
			isListening,
			setIsListening,
			isUserTalking,
			setIsUserTalking,
			isAvatarTalking,
			setIsAvatarTalking,
			connectionQuality,
			setConnectionQuality,
		}),
		[
			connectionQuality,
			isAvatarTalking,
			isListening,
			isMuted,
			isUserTalking,
			isVoiceChatActive,
			isVoiceChatLoading,
			sessionState,
		],
	);

	return (
		<StreamingAvatarContext.Provider value={value}>
			{children}
		</StreamingAvatarContext.Provider>
	);
}

export function useStreamingAvatarContext() {
	const context = useContext(StreamingAvatarContext);

	if (!context) {
		throw new Error(
			"useStreamingAvatarContext must be used within a StreamingAvatarProvider",
		);
	}

	return context;
}
