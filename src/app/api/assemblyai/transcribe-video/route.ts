import { NextResponse } from "next/server";
import { youtubeDl } from "youtube-dl-exec";

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com/v2";

interface YouTubeFormat {
  resolution: string;
  ext: string;
  url?: string;
}

interface YouTubeInfo {
  formats: YouTubeFormat[];
}

interface AssemblyAIChapter {
  summary: string;
  start: number;
  end: number;
}

interface AssemblyAIUtterance {
  text: string;
  start: number;
  end: number;
  speaker: number;
}

interface AssemblyAIEntity {
  text: string;
  type: string;
}

interface AssemblyAIResult {
  status: string;
  error?: string;
  text: string;
  chapters?: AssemblyAIChapter[];
  summary?: string;
  iab_categories_result?: {
    summary: string[];
  };
  entities?: AssemblyAIEntity[];
  utterances?: AssemblyAIUtterance[];
}

// Helper function to get audio URL from YouTube video
async function getYouTubeAudioUrl(videoId: string): Promise<string> {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("Getting info for video:", videoUrl);

    // Get video info with best audio format
    console.log("Retrieving video formats...");
    const videoInfo = await youtubeDl(videoUrl, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      extractAudio: true,
      audioFormat: "m4a",
      audioQuality: 0, // Best quality
      addHeader: [
        "referer:youtube.com",
        "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ],
    });

    if (!videoInfo || typeof videoInfo === "string") {
      throw new Error("Failed to get video information");
    }

    // Find the best audio format
    const formats = (videoInfo as YouTubeInfo).formats;
    const audioFormats = formats
      .filter((format) => {
        return (
          format.resolution === "audio only" &&
          format.url &&
          format.url.startsWith("http") &&
          format.ext === "m4a"
        );
      })
      .sort((a, b) => {
        // Prefer m4a format with higher quality
        if (a.ext === "m4a" && b.ext !== "m4a") return -1;
        if (b.ext === "m4a" && a.ext !== "m4a") return 1;
        return 0;
      });

    if (audioFormats.length === 0) {
      // Fallback to any audio format if m4a is not available
      const anyAudioFormat = formats.find(
        (format) =>
          format.resolution === "audio only" &&
          format.url &&
          format.url.startsWith("http")
      );

      if (!anyAudioFormat?.url) {
        throw new Error("No suitable audio format found");
      }

      console.log("Using fallback audio format:", anyAudioFormat.ext);
      return anyAudioFormat.url;
    }

    const audioUrl = audioFormats[0].url;
    if (!audioUrl) {
      throw new Error("No audio URL found in selected format");
    }

    console.log("Audio URL retrieved successfully");
    console.log("Audio format:", audioFormats[0].ext);
    return audioUrl;
  } catch (error) {
    console.error("Error getting audio URL:", error);
    if (error instanceof Error) {
      if (error.message.includes("Video unavailable")) {
        throw new Error("Video is no longer available");
      }
      if (error.message.includes("Private video")) {
        throw new Error("This video is private");
      }
      if (error.message.includes("Sign in")) {
        throw new Error("This video requires authentication");
      }
      throw new Error(`Failed to get audio URL: ${error.message}`);
    }
    throw new Error("Failed to get audio URL");
  }
}

// Helper function to submit transcription job
async function submitTranscriptionJob(audioUrl: string): Promise<string> {
  const response = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: ASSEMBLYAI_API_KEY!,
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      speaker_labels: true,
      auto_chapters: true,
      entity_detection: true,
      iab_categories: true,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to submit transcription job: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.id;
}

// Helper function to get transcription result
async function getTranscriptionResult(
  transcriptId: string
): Promise<AssemblyAIResult> {
  const response = await fetch(
    `${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`,
    {
      headers: {
        Authorization: ASSEMBLYAI_API_KEY!,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to get transcription result: ${response.statusText}`
    );
  }

  return await response.json();
}

// Helper function to wait for transcription completion
async function waitForTranscription(
  transcriptId: string,
  maxAttempts = 60
): Promise<AssemblyAIResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getTranscriptionResult(transcriptId);

    if (result.status === "completed") {
      return result;
    }

    if (result.status === "error") {
      throw new Error(`Transcription failed: ${result.error}`);
    }

    // Wait for 5 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error("Transcription timed out");
}

export async function POST(req: Request) {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Extract video ID from YouTube URL
    const videoId = videoUrl.split("v=")[1]?.split("&")[0];
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    console.log("Processing video:", videoId);
    const audioUrl = await getYouTubeAudioUrl(videoId);
    console.log("Audio URL obtained successfully");

    console.log("Submitting transcription job...");
    const transcriptId = await submitTranscriptionJob(audioUrl);
    console.log("Transcription job submitted:", transcriptId);

    console.log("Waiting for transcription completion...");
    const result = await waitForTranscription(transcriptId);
    console.log("Transcription completed successfully");

    // Format the response
    return NextResponse.json({
      transcript: result.text,
      paragraphs: result.chapters?.map((chapter) => ({
        text: chapter.summary,
        start: chapter.start,
        end: chapter.end,
      })),
      summary: result.summary,
      topics: result.iab_categories_result?.summary,
      entities: result.entities,
      speakers: result.utterances?.map((utterance) => ({
        text: utterance.text,
        start: utterance.start,
        end: utterance.end,
        speaker: utterance.speaker,
      })),
    });
  } catch (error) {
    console.error("AssemblyAI API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to transcribe video",
      },
      { status: 500 }
    );
  }
}
