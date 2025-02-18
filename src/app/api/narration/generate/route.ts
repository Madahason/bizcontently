import { NextResponse } from "next/server";
import { VoiceGenerator } from "@/lib/ai/voiceGeneration";
import type { NarrationOptions } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      text,
      voiceId,
      emotion,
      emotionIntensity,
      wpm,
      pauseDuration,
      pronunciationOverrides,
    } = body as NarrationOptions & { text: string };

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: "Text and voiceId are required" },
        { status: 400 }
      );
    }

    const voiceGenerator = new VoiceGenerator();

    // Apply emotion and pacing
    const ssmlText = voiceGenerator.createSSMLWithEmotion(
      text,
      emotion || "neutral",
      emotionIntensity || 50
    );

    // Generate the audio
    const audioBuffer = await voiceGenerator.generateVoice({
      voiceId,
      text: ssmlText,
      settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 1,
        use_speaker_boost: true,
      },
      pronunciationDictionary: pronunciationOverrides,
    });

    // Return the audio as a stream
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Voice generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate voice narration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET available voices
export async function GET() {
  try {
    const voiceGenerator = new VoiceGenerator();
    const voices = await voiceGenerator.listVoices();
    return NextResponse.json(voices);
  } catch (error) {
    console.error("Failed to list voices:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve available voices",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
