export declare const AvatarQuality: {
  readonly Low: "low";
  readonly Medium: "medium";
  readonly High: "high";
};

export declare const STTProvider: {
  readonly DEEPGRAM: "deepgram";
  readonly OPENAI: "openai";
  readonly WHISPER: "whisper";
};

export declare const VoiceChatTransport: {
  readonly WEBSOCKET: "websocket";
  readonly WEBSOCKET_AEC: "websocket_aec";
  readonly RTC: "rtc";
};

export declare const VoiceEmotion: {
  readonly EXCITED: "Excited";
  readonly SERIOUS: "Serious";
  readonly FRIENDLY: "Friendly";
  readonly SOOTHING: "Soothing";
  readonly BROADCASTER: "Broadcaster";
};

export declare const ElevenLabsModel: {
  readonly eleven_flash_v2_5: "eleven_flash_v2_5";
  readonly eleven_turbo_v2_5: "eleven_turbo_v2_5";
  readonly eleven_monolingual_v1: "eleven_monolingual_v1";
};

export declare const TaskType: {
  readonly TALK: "talk";
  readonly REPEAT: "repeat";
};

export declare const TaskMode: {
  readonly ASYNC: "async";
  readonly SYNC: "sync";
};

export declare const ConnectionQuality: {
  readonly UNKNOWN: "UNKNOWN";
  readonly POOR: "POOR";
  readonly FAIR: "FAIR";
  readonly GOOD: "GOOD";
  readonly EXCELLENT: "EXCELLENT";
};

export declare const StreamingEvents: {
  readonly STREAM_READY: "stream_ready";
  readonly STREAM_DISCONNECTED: "stream_disconnected";
  readonly CONNECTION_QUALITY_CHANGED: "connection_quality_changed";
  readonly USER_START: "user_start";
  readonly USER_STOP: "user_stop";
  readonly AVATAR_START_TALKING: "avatar_start_talking";
  readonly AVATAR_STOP_TALKING: "avatar_stop_talking";
  readonly USER_TALKING_MESSAGE: "user_talking_message";
  readonly AVATAR_TALKING_MESSAGE: "avatar_talking_message";
  readonly USER_END_MESSAGE: "user_end_message";
  readonly AVATAR_END_MESSAGE: "avatar_end_message";
};

export type StartAvatarRequest = {
  avatarName: string;
  language?: string;
  quality?: (typeof AvatarQuality)[keyof typeof AvatarQuality] | "high" | "medium" | "low";
  voiceChatTransport?: (typeof VoiceChatTransport)[keyof typeof VoiceChatTransport];
  avatar_id?: string;
  video_encoding?: "VP8" | "H264";
  version?: string;
  knowledge_base?: unknown;
  knowledge_base_id?: string;
  knowledgeId?: string;
  disable_idle_timeout?: boolean;
  activity_idle_timeout?: number;
  voice?: {
    voice_id?: string;
    voiceId?: string;
    rate?: number;
    emotion?: (typeof VoiceEmotion)[keyof typeof VoiceEmotion] | "Excited" | "Serious" | "Friendly" | "Soothing" | "Broadcaster";
    model?: string;
    elevenlabs_settings?: Record<string, unknown>;
  };
  voice_name?: string;
  stt_settings?: {
    provider?: (typeof STTProvider)[keyof typeof STTProvider];
  };
  sttSettings?: {
    provider?: (typeof STTProvider)[keyof typeof STTProvider];
  };
  [key: string]: unknown;
};

export default class StreamingAvatar {
  constructor(options?: { token?: string; basePath?: string });
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
  createStartAvatar(config: StartAvatarRequest): Promise<void>;
  stopAvatar(): Promise<void>;
  speak(options: {
    text: string;
    taskType?: (typeof TaskType)[keyof typeof TaskType];
    taskMode?: (typeof TaskMode)[keyof typeof TaskMode];
  }): Promise<void>;
  startVoiceChat(options: {
    isInputAudioMuted?: boolean;
    mediaStream?: MediaStream;
  }): Promise<void>;
  closeVoiceChat(): void;
  muteInputAudio(): void;
  unmuteInputAudio(): void;
}
