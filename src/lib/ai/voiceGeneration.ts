import { VoiceSettings } from "./types";

interface ElevenLabsVoiceConfig {
  stability: number; // 0-1
  similarity_boost: number; // 0-1
  style: number; // 0-1
  use_speaker_boost: boolean;
}

interface VoiceGenerationOptions {
  voiceId: string;
  text: string;
  modelId?: string;
  settings?: ElevenLabsVoiceConfig;
  pronunciationDictionary?: Record<string, string>;
}

export class VoiceGenerator {
  private apiKey: string;
  private baseUrl = "https://api.elevenlabs.io/v1";

  constructor() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("ElevenLabs API key is not configured");
    }
    this.apiKey = apiKey;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "xi-api-key": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    return response;
  }

  async listVoices() {
    const response = await this.fetchWithAuth("/voices", {
      method: "GET",
    });
    return response.json();
  }

  async generateVoice({
    voiceId,
    text,
    modelId = "eleven_monolingual_v1",
    settings,
    pronunciationDictionary,
  }: VoiceGenerationOptions): Promise<ArrayBuffer> {
    // Apply pronunciation dictionary if provided
    let processedText = text;
    if (pronunciationDictionary) {
      Object.entries(pronunciationDictionary).forEach(
        ([word, pronunciation]) => {
          const regex = new RegExp(`\\b${word}\\b`, "gi");
          processedText = processedText.replace(
            regex,
            `<phoneme alphabet="ipa" ph="${pronunciation}">${word}</phoneme>`
          );
        }
      );
    }

    const response = await this.fetchWithAuth(`/text-to-speech/${voiceId}`, {
      method: "POST",
      body: JSON.stringify({
        text: processedText,
        model_id: modelId,
        voice_settings: settings,
      }),
    });

    return response.arrayBuffer();
  }

  async adjustVoiceSettings(
    voiceId: string,
    settings: Partial<VoiceSettings>
  ): Promise<void> {
    await this.fetchWithAuth(`/voices/${voiceId}/settings`, {
      method: "POST",
      body: JSON.stringify(settings),
    });
  }

  createSSMLWithEmotion(
    text: string,
    emotion: string,
    intensity: number
  ): string {
    const prosodyAttributes = this.getEmotionProsody(emotion, intensity);
    return `<speak>
      <prosody ${prosodyAttributes}>
        ${text}
      </prosody>
    </speak>`;
  }

  private getEmotionProsody(emotion: string, intensity: number): string {
    const prosodyMap: Record<
      string,
      { rate: string; pitch: string; volume: string }
    > = {
      enthusiastic: {
        rate: "+20%",
        pitch: "+20%",
        volume: "+6dB",
      },
      serious: {
        rate: "-10%",
        pitch: "-10%",
        volume: "-3dB",
      },
      sympathetic: {
        rate: "-5%",
        pitch: "-5%",
        volume: "+0dB",
      },
      // Add more emotion mappings as needed
    };

    const settings = prosodyMap[emotion] || prosodyMap.neutral;
    const intensityFactor = intensity / 100;

    return Object.entries(settings)
      .map(([attribute, value]) => {
        const numValue = parseFloat(value);
        const adjustedValue = numValue * intensityFactor;
        return `${attribute}="${
          adjustedValue > 0 ? "+" : ""
        }${adjustedValue}%"`;
      })
      .join(" ");
  }

  async generateWithPacing(
    text: string,
    wpm: number,
    pauseDuration: number
  ): Promise<ArrayBuffer> {
    // Convert WPM to SSML rate
    const rate = (wpm / 150) * 100; // 150 WPM is considered normal speed

    // Add pauses between sentences
    const textWithPauses = text
      .split(/(?<=[.!?])\s+/)
      .join(` <break time="${pauseDuration}s"/> `);

    const ssml = `<speak>
      <prosody rate="${rate}%">
        ${textWithPauses}
      </prosody>
    </speak>`;

    return this.generateVoice({
      voiceId: "default", // Replace with actual voice ID
      text: ssml,
    });
  }
}
