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
      system:
        "You are an expert YouTube script writer and content strategist. Your task is to create a unique, engaging script that follows best practices for YouTube content while being completely original. You must respond with ONLY valid JSON - no other text before or after. The JSON must exactly match the specified structure.",
      messages: [
        {
          role: "user",
          content: `Create a YouTube script about "${topic}" using this content analysis for inspiration. Respond with ONLY valid JSON - no other text, no explanations, no markdown formatting.

Content Analysis:
${JSON.stringify(contentAnalysis, null, 2)}

Original Transcript (for reference only):
${originalTranscript}

Return ONLY this exact JSON structure (no other text):
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

    const content = response.content[0];
    if (!content || typeof content !== "object" || !("text" in content)) {
      throw new Error("Invalid response format from Claude");
    }

    // Clean and parse the JSON response
    let jsonText = content.text.trim();
    // Remove any markdown code block formatting if present
    jsonText = jsonText.replace(/^```json\n?/, "").replace(/\n?```$/, "");

    try {
      const script = JSON.parse(jsonText) as YouTubeScript;
      return script;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw response:", jsonText);
      throw new Error("Failed to parse script JSON from Claude's response");
    }
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
