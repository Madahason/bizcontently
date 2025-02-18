import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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

async function analyzeContentStructure(
  transcript: string,
  timestamps: { text: string; start: number; end: number }[]
): Promise<ContentAnalysis> {
  if (!transcript || transcript.trim().length === 0) {
    throw new Error("Transcript is empty or invalid");
  }

  if (!timestamps || timestamps.length === 0) {
    throw new Error("Timestamps array is empty or invalid");
  }

  // Initialize Anthropic client inside the function
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const anthropic = new Anthropic({ apiKey });

  // Limit transcript length if needed
  const maxChars = 12000; // Approximately 3000 tokens
  let truncatedTranscript = transcript;
  if (transcript.length > maxChars) {
    truncatedTranscript = transcript.slice(0, maxChars) + "...";
    console.log("Transcript truncated to", maxChars, "characters");
  }

  try {
    console.log("Starting Claude analysis...");

    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 2000,
      temperature: 0.7,
      system: `You are an expert content strategist and video analyst. Analyze this transcript to identify content structure, hooks, and engagement patterns. Focus on:
1. Hooks & attention-grabbing moments
2. Call-to-Actions (explicit & implicit)
3. Content structure & flow
4. Engagement techniques
5. Key talking points
6. Strategic recommendations

You must respond with valid JSON only. No other text before or after the JSON object.`,
      messages: [
        {
          role: "user",
          content: `Analyze this transcript and provide timestamps and ratings where relevant.

${timestamps
  .slice(0, 100)
  .map(
    (t) =>
      `[${Math.floor(t.start / 60)}:${(t.start % 60)
        .toString()
        .padStart(2, "0")}] ${t.text}`
  )
  .join("\n")}

Respond with this exact JSON structure (no other text):
{
  "hooks": [{"type": "opening/pattern-interrupt/curiosity", "timestamp": "MM:SS", "description": "text", "effectiveness": 1-10}],
  "callToAction": [{"type": "explicit/implicit", "timestamp": "MM:SS", "text": "text", "context": "text"}],
  "keyTalkingPoints": [{"topic": "text", "timestamp": "MM:SS", "keyPoints": ["text"], "duration": "MM:SS"}],
  "contentStructure": [{"section": "text", "timestamp": "MM:SS", "duration": "MM:SS", "purpose": "text"}],
  "engagementTechniques": [{"technique": "text", "timestamp": "MM:SS", "description": "text", "effectiveness": 1-10}],
  "recommendations": [{"category": "hooks/structure/engagement", "suggestion": "text", "reasoning": "text"}]
}`,
        },
      ],
    });

    const content = response.content[0];
    if (!content || content.type !== "text" || !content.text) {
      throw new Error("Empty or invalid response from Claude");
    }

    try {
      const result = JSON.parse(content.text);

      // Ensure all required fields exist
      const defaultStructure = {
        hooks: [],
        callToAction: [],
        keyTalkingPoints: [],
        contentStructure: [],
        engagementTechniques: [],
        recommendations: [],
      };

      return { ...defaultStructure, ...result };
    } catch (parseError) {
      console.error("Failed to parse Claude response:", content.text);
      throw new Error("Invalid JSON response from Claude");
    }
  } catch (error) {
    console.error("Claude Analysis Error:", error);
    if (error instanceof Error) {
      if (error.message.includes("Rate limit")) {
        throw new Error(
          "API rate limit exceeded. Please try again in a moment."
        );
      }
      if (error.message.includes("maximum context length")) {
        throw new Error(
          "Transcript is too long for analysis. Please try a shorter video."
        );
      }
      throw new Error(`Failed to analyze content structure: ${error.message}`);
    }
    throw new Error("Failed to analyze content structure");
  }
}

export async function POST(req: Request) {
  try {
    const { transcript, timestamps } = await req.json();

    if (!transcript || !timestamps) {
      return NextResponse.json(
        { error: "Transcript and timestamps are required" },
        { status: 400 }
      );
    }

    console.log("Analyzing content structure...");
    const analysis = await analyzeContentStructure(transcript, timestamps);
    console.log("Content analysis complete");

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to analyze content",
      },
      { status: 500 }
    );
  }
}
