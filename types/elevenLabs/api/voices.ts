// types/voice/voiceTypes.ts

export interface VoiceSample {
	sample_id: string;
	file_name: string;
	mime_type: string;
	size_bytes: number;
	hash: string;
	duration_secs: number;
	remove_background_noise: boolean;
	has_isolated_audio: boolean;
	has_isolated_audio_preview: boolean;
	speaker_separation: {
		voice_id: string;
		sample_id: string;
		status: string;
	};
	trim_start: number;
	trim_end: number;
}

export interface VoiceVerificationAttempt {
	text: string;
	date_unix: number;
	accepted: boolean;
	similarity: number;
	levenshtein_distance: number;
	recording: {
		recording_id: string;
		mime_type: string;
		size_bytes: number;
		upload_date_unix: number;
		transcription: string;
	};
}

export interface VoiceManualVerificationFile {
	file_id: string;
	file_name: string;
	mime_type: string;
	size_bytes: number;
	upload_date_unix: number;
}

export interface VoiceManualVerification {
	extra_text: string;
	request_time_unix: number;
	files: VoiceManualVerificationFile[];
}

export interface VoiceFineTuning {
	is_allowed_to_fine_tune: boolean;
	state: Record<string, string>;
	verification_failures: string[];
	verification_attempts_count: number;
	manual_verification_requested: boolean;
	language: string;
	progress: Record<string, number>;
	message: Record<string, string>;
	dataset_duration_seconds: number;
	verification_attempts: VoiceVerificationAttempt[];
	slice_ids: string[];
	manual_verification: VoiceManualVerification;
	max_verification_attempts: number;
	next_max_verification_attempts_reset_unix_ms: number;
	finetuning_state: Record<string, string>;
}

export interface VoiceLabels {
	accent?: string;
	age?: string;
	description?: string;
	gender?: string;
	use_case?: string;
}

export interface VoiceSettings {
	stability: number;
	similarity_boost: number;
	style: number;
	use_speaker_boost: boolean;
	speed: number;
}

export interface VoiceSharing {
	status: string;
	history_item_sample_id: string;
	date_unix: number;
	whitelisted_emails: string[];
	public_owner_id: string;
	original_voice_id: string;
	financial_rewards_enabled: boolean;
	free_users_allowed: boolean;
	live_moderation_enabled: boolean;
	rate: number;
	fiat_rate: number;
	notice_period: number;
	disable_at_unix: number;
	voice_mixing_allowed: boolean;
	featured: boolean;
	category: string;
	reader_app_enabled: boolean;
	image_url: string;
	ban_reason: string;
	liked_by_count: number;
	cloned_by_count: number;
	name: string;
	description: string;
	labels: VoiceLabels;
	review_status: string;
	review_message: string;
	enabled_in_library: boolean;
	instagram_username: string;
	twitter_username: string;
	youtube_username: string;
	tiktok_username: string;
	moderation_check: {
		date_checked_unix: number;
		name_value: string;
		name_check: boolean;
		description_value: string;
		description_check: boolean;
		sample_ids: string[];
		sample_checks: number[];
		captcha_ids: string[];
		captcha_checks: number[];
	};
	reader_restricted_on: Array<{
		resource_type: string;
		resource_id: string;
	}>;
}

export interface VerifiedLanguage {
	language: string;
	model_id: string;
	accent: string;
	locale: string;
	preview_url: string;
}

export interface VoiceVerification {
	requires_verification: boolean;
	is_verified: boolean;
	verification_failures: string[];
	verification_attempts_count: number;
	language: string;
	verification_attempts: VoiceVerificationAttempt[];
}

export interface VoiceResponse {
	voice_id: string;
	name: string;
	samples: VoiceSample[];
	category: string;
	fine_tuning: VoiceFineTuning;
	labels: VoiceLabels;
	description: string;
	preview_url: string;
	available_for_tiers: string[];
	settings: VoiceSettings;
	sharing: VoiceSharing;
	high_quality_base_model_ids: string[];
	verified_languages: VerifiedLanguage[];
	safety_control: string;
	voice_verification: VoiceVerification;
	permission_on_resource: string;
	is_owner: boolean;
	is_legacy: boolean;
	is_mixed: boolean;
	created_at_unix: number;
}
