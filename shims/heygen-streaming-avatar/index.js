export const AvatarQuality = {
  Low: "low",
  Medium: "medium",
  High: "high",
};

export const STTProvider = {
  DEEPGRAM: "deepgram",
  OPENAI: "openai",
  WHISPER: "whisper",
};

export const VoiceChatTransport = {
  WEBSOCKET: "websocket",
  WEBSOCKET_AEC: "websocket_aec",
  RTC: "rtc",
};

export const VoiceEmotion = {
  EXCITED: "Excited",
  SERIOUS: "Serious",
  FRIENDLY: "Friendly",
  SOOTHING: "Soothing",
  BROADCASTER: "Broadcaster",
};

export const ElevenLabsModel = {
  eleven_flash_v2_5: "eleven_flash_v2_5",
  eleven_turbo_v2_5: "eleven_turbo_v2_5",
  eleven_monolingual_v1: "eleven_monolingual_v1",
};

export const TaskType = {
  TALK: "talk",
  REPEAT: "repeat",
};

export const TaskMode = {
  ASYNC: "async",
  SYNC: "sync",
};

export const ConnectionQuality = {
  UNKNOWN: "UNKNOWN",
  POOR: "POOR",
  FAIR: "FAIR",
  GOOD: "GOOD",
  EXCELLENT: "EXCELLENT",
};

export const StreamingEvents = {
  STREAM_READY: "stream_ready",
  STREAM_DISCONNECTED: "stream_disconnected",
  CONNECTION_QUALITY_CHANGED: "connection_quality_changed",
  USER_START: "user_start",
  USER_STOP: "user_stop",
  AVATAR_START_TALKING: "avatar_start_talking",
  AVATAR_STOP_TALKING: "avatar_stop_talking",
  USER_TALKING_MESSAGE: "user_talking_message",
  AVATAR_TALKING_MESSAGE: "avatar_talking_message",
  USER_END_MESSAGE: "user_end_message",
  AVATAR_END_MESSAGE: "avatar_end_message",
};

class StreamingAvatar {
  constructor(options = {}) {
    this.options = options;
    this.listeners = new Map();
  }

  on(event, handler) {
    const handlers = this.listeners.get(event) ?? new Set();
    handlers.add(handler);
    this.listeners.set(event, handlers);
  }

  off(event, handler) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    handlers.delete(handler);
  }

  async createStartAvatar() {
    return undefined;
  }

  async stopAvatar() {
    return undefined;
  }

  async speak() {
    return undefined;
  }

  async startVoiceChat() {
    return undefined;
  }

  closeVoiceChat() {}

  muteInputAudio() {}

  unmuteInputAudio() {}
}

export default StreamingAvatar;
