import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

interface ContentAnalysis {
  hooks: {
    type: string;
    timestamp: string;
    description: string;
    effectiveness: number;
  }[];
  callToAction: {
    type: string;
    timestamp: string;
    text: string;
    context: string;
  }[];
  keyTalkingPoints: {
    topic: string;
    timestamp: string;
    keyPoints: string[];
    duration: string;
  }[];
  contentStructure: {
    section: string;
    timestamp: string;
    duration: string;
    purpose: string;
  }[];
  engagementTechniques: {
    technique: string;
    timestamp: string;
    description: string;
    effectiveness: number;
  }[];
  recommendations: {
    category: string;
    suggestion: string;
    reasoning: string;
  }[];
}

interface YouTubeScript {
  title: string;
  hook: string;
  sections: {
    type: string;
    content: string;
    notes: string;
  }[];
  callToAction: string;
  thumbnailIdeas: string[];
  metadata: {
    description: string;
    tags: string[];
    category: string;
  };
}

async function generateScript(
  originalTranscript: string,
  contentAnalysis: ContentAnalysis,
  topic: string
): Promise<YouTubeScript> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are an expert YouTube script writer and content strategist. Your task is to create a unique, engaging script that follows best practices for YouTube content while being completely original. Use the provided content analysis for inspiration but create something fresh and unique.`,
        },
        {
          role: "user",
          content: `Create a YouTube script about "${topic}" using this content analysis for inspiration. The script should be unique and not copy the original content.

Content Analysis:
${JSON.stringify(contentAnalysis, null, 2)}

Original Transcript (for reference only):
${originalTranscript}

Create a complete YouTube video script that includes:
1. Catchy title options
2. Engaging hook (first 15 seconds)
3. Main content sections with clear transitions
4. Strategic call-to-action
5. Thumbnail ideas
6. Video description and tags

Make the content unique while incorporating successful elements from the analysis. Format as JSON:
{
  "title": "Main title (with 2-3 alternatives)",
  "hook": "Opening hook script (15 seconds)",
  "sections": [
    {
      "type": "intro/main/example/conclusion",
      "content": "Actual script text",
      "notes": "Delivery/visual notes"
    }
  ],
  "callToAction": "CTA script",
  "thumbnailIdeas": ["3-4 thumbnail concepts"],
  "metadata": {
    "description": "YouTube description with timestamps",
    "tags": ["relevant", "tags"],
    "category": "video category"
  }
}`,
        },
      ],
    });

    if (!response.content[0].text) {
      throw new Error("Empty response from Claude");
    }

    // Parse the JSON response
    const script = JSON.parse(response.content[0].text) as YouTubeScript;
    return script;
  } catch (error) {
    console.error("Script Generation Error:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to generate script: ${error.message}`
        : "Failed to generate script"
    );
  }
}

export async function POST(req: Request) {
  try {
    const { transcript, contentAnalysis, topic } = await req.json();

    if (!transcript || !contentAnalysis || !topic) {
      return NextResponse.json(
        { error: "Transcript, content analysis, and topic are required" },
        { status: 400 }
      );
    }

    console.log("Generating YouTube script...");
    const script = await generateScript(transcript, contentAnalysis, topic);
    console.log("Script generation complete");

    return NextResponse.json(script);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate script",
      },
      { status: 500 }
    );
  }
}
