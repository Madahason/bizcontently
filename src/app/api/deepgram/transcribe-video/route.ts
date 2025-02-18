import { NextResponse } from "next/server";
import { getSubtitles } from "youtube-caption-extractor";
import Anthropic from "@anthropic-ai/sdk";

interface Subtitle {
  start: string;
  dur: string;
  text: string;
}

interface TranscriptData {
  transcript: string;
  paragraphs: {
    text: string;
    start: number;
    end: number;
  }[];
  rawTranscript: Subtitle[];
}

async function getYouTubeTranscript(videoId: string): Promise<TranscriptData> {
  try {
    console.log("Getting transcript for video:", videoId);
    const transcriptParts = await getSubtitles({
      videoID: videoId,
      lang: "en", // Get English captions
    });

    if (!transcriptParts || transcriptParts.length === 0) {
      throw new Error("No transcript available for this video");
    }

    // Combine all transcript parts into one text
    const fullText = transcriptParts
      .map((part: Subtitle) => part.text)
      .join(" ");

    // Create paragraphs (group every 5 parts together)
    const paragraphs = [];
    for (let i = 0; i < transcriptParts.length; i += 5) {
      const group = transcriptParts.slice(i, i + 5);
      paragraphs.push({
        text: group.map((part: Subtitle) => part.text).join(" "),
        start: parseFloat(group[0].start),
        end:
          parseFloat(group[group.length - 1].start) +
          parseFloat(group[group.length - 1].dur),
      });
    }

    return {
      transcript: fullText,
      paragraphs,
      rawTranscript: transcriptParts,
    };
  } catch (error) {
    console.error("Error getting transcript:", error);
    if (error instanceof Error) {
      if (error.message.includes("Could not get transcripts")) {
        throw new Error("No captions are available for this video");
      }
      if (error.message.includes("Video unavailable")) {
        throw new Error("This video is no longer available on YouTube");
      }
      if (error.message.includes("Private video")) {
        throw new Error("This video is private and cannot be accessed");
      }
      throw new Error(`Could not get transcript: ${error.message}`);
    }
    throw new Error("Failed to get video transcript");
  }
}

async function analyzeTranscript(transcriptData: TranscriptData) {
  try {
    // Initialize Anthropic client inside the function
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      temperature: 0.3,
      system:
        "You are an expert at analyzing video transcripts. You must respond with valid JSON only, no other text. Analyze the transcript and provide a summary, key topics, and important entities.",
      messages: [
        {
          role: "user",
          content: `Analyze this transcript and provide a structured analysis. Respond with ONLY valid JSON, no other text.

Transcript:
${transcriptData.transcript}

Required JSON structure:
{
  "summary": "2-3 sentence summary",
  "topics": ["topic1", "topic2", "..."],
  "entities": [
    {
      "text": "entity name",
      "type": "person/organization/product/location/concept"
    }
  ]
}`,
        },
      ],
    });

    const content = response.content[0];
    if (!content || content.type !== "text" || !content.text) {
      throw new Error("Empty or invalid response from Claude");
    }

    // Clean the response text to ensure it's valid JSON
    const cleanedText = content.text.trim();

    try {
      const result = JSON.parse(cleanedText);

      // Validate the response structure
      if (
        !result.summary ||
        !Array.isArray(result.topics) ||
        !Array.isArray(result.entities)
      ) {
        throw new Error("Invalid response structure from Claude");
      }

      // Ensure all required fields exist with default values if needed
      return {
        summary: result.summary || "",
        topics: result.topics || [],
        entities: result.entities.map((entity: any) => ({
          text: entity.text || "",
          type: entity.type || "unknown",
        })),
      };
    } catch (parseError) {
      console.error("Failed to parse Claude response:", cleanedText);
      console.error("Parse error:", parseError);
      throw new Error("Invalid JSON response from Claude");
    }
  } catch (error) {
    console.error("Claude Analysis Error:", error);
    if (error instanceof Error) {
      if (error.message.includes("rate limits")) {
        throw new Error(
          "API rate limit exceeded. Please try again in a moment."
        );
      }
      if (error.message.includes("maximum context length")) {
        throw new Error(
          "Transcript is too long for analysis. Please try a shorter video."
        );
      }
      throw new Error(`Failed to analyze transcript: ${error.message}`);
    }
    throw new Error("Failed to analyze transcript");
  }
}

export async function POST(req: Request) {
  try {
    let reqBody;
    try {
      reqBody = await req.json();
      console.log("Request body:", reqBody);
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { videoUrl } = reqBody;

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
    const transcriptData = await getYouTubeTranscript(videoId);
    console.log("Transcript obtained successfully");

    // Analyze the transcript with Claude
    console.log("Analyzing transcript with Claude...");
    const analysis = await analyzeTranscript(transcriptData);
    console.log("Claude analysis complete");

    // Format the response
    const formattedResponse = {
      transcript: transcriptData.transcript,
      paragraphs: transcriptData.paragraphs,
      summary: analysis.summary,
      topics: analysis.topics,
      entities: analysis.entities,
      timestamps: transcriptData.rawTranscript.map((item: Subtitle) => ({
        text: item.text,
        start: parseFloat(item.start),
        end: parseFloat(item.start) + parseFloat(item.dur),
      })),
    };

    console.log("Sending formatted response:", formattedResponse);
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process video",
      },
      { status: 500 }
    );
  }
}
