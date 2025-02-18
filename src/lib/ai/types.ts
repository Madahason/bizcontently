export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface Voice {
  voice_id: string;
  name: string;
  preview_url: string;
  labels: {
    accent?: string;
    age?: string;
    gender?: string;
    [key: string]: string | undefined;
  };
  settings: VoiceSettings;
}

export type EmotionType =
  | "enthusiastic"
  | "serious"
  | "sympathetic"
  | "neutral";

export interface NarrationOptions {
  voiceId: string;
  emotion: EmotionType;
  emotionIntensity: number;
  wpm: number;
  pauseDuration: number;
  pronunciationOverrides?: Record<string, string>;
}
