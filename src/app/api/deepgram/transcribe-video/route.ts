import { NextResponse } from "next/server";
import { getSubtitles } from "youtube-caption-extractor";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

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
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at analyzing video transcripts. Provide a concise summary, key topics, and identify important entities (people, organizations, products, etc.) mentioned in the transcript.",
        },
        {
          role: "user",
          content: `Please analyze this transcript and provide:
1. A concise summary (2-3 sentences)
2. Main topics (as an array of single words or short phrases)
3. Key entities mentioned (with their types)

Transcript:
${transcriptData.transcript}

Format your response as JSON like this:
{
  "summary": "...",
  "topics": ["topic1", "topic2", ...],
  "entities": [{"text": "entity name", "type": "person/organization/product/etc"}]
}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error("Empty or invalid response from OpenAI");
    }

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("OpenAI Analysis Error:", error);
    throw new Error("Failed to analyze transcript with OpenAI");
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

    // Analyze the transcript with OpenAI
    console.log("Analyzing transcript with OpenAI...");
    const analysis = await analyzeTranscript(transcriptData);
    console.log("OpenAI analysis complete");

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
