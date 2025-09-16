"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { agentSchema, type Agent } from "./utils/schema";
import {
	fetchBackgroundNoises,
	fetchAvatars,
	fetchVoicemails,
	fetchVoices,
} from "./utils/api";

export function useAgentForm(defaultValues?: Partial<Agent>) {
	const form = useForm<Agent>({
		resolver: zodResolver(agentSchema),
		defaultValues: {
			isPublic: false,
			isFree: false,
			priceMultiplier: 1,
			billingCycle: "monthly",
			...(defaultValues || {}),
		},
	});

	const [showVoicemailModal, setShowVoicemailModal] = useState(false);
	const [showCloneModal, setShowCloneModal] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(
		defaultValues?.image || null,
	);
	const [voices, setVoices] = useState<{ id: string; name: string }[]>([]);
	const [voicemails, setVoicemails] = useState<{ id: string; name: string }[]>(
		[],
	);
	const [backgroundNoises, setBackgroundNoises] = useState<
		{ id: string; name: string }[]
	>([]);
	const [avatars, setAvatars] = useState<
		{ id: string; name: string; image: string }[]
	>([]);

	useEffect(() => {
		const loadInitialData = async () => {
			const [voicesData, voicemailsData, backgroundNoisesData, avatarsData] =
				await Promise.all([
					fetchVoices(),
					fetchVoicemails(),
					fetchBackgroundNoises(),
					fetchAvatars(),
				]);
			setVoices(voicesData);
			setVoicemails(voicemailsData);
			setBackgroundNoises(backgroundNoisesData);
			setAvatars(avatarsData);
		};

		loadInitialData();
	}, []);

	const handleVoicemailAudio = async (audioBlob: Blob) => {
		// Simulate upload and generate a fake ID for testing
		const fakeRecordingId = `test-voicemail-${Date.now()}`;
		form.setValue("voicemailScript", fakeRecordingId);
		setShowVoicemailModal(false);
	};

	const handleCloneVoiceAudio = async (audioBlob: Blob) => {
		// Simulate upload and generate a fake ID for testing
		const fakeRecordingId = `test-clone-${Date.now()}`;
		form.setValue("voice", fakeRecordingId);
		setShowCloneModal(false);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
				form.setValue("image", reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return {
		form,
		showVoicemailModal,
		setShowVoicemailModal,
		showCloneModal,
		setShowCloneModal,
		imagePreview,
		handleImageChange,
		voices,
		voicemails,
		backgroundNoises,
		avatars,
		handleVoicemailAudio,
		handleCloneVoiceAudio,
	};
}
