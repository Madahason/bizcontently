import { NextResponse } from "next/server";
import { SceneAnalyzer } from "@/lib/video/assetMatching/SceneAnalyzer";

export async function POST(req: Request) {
  try {
    const { sceneDescription } = await req.json();

    if (!sceneDescription) {
      return NextResponse.json(
        {
          error: "Scene description is required",
          details: "The request body must include a sceneDescription field",
        },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("Anthropic API key not found in environment variables");
      return NextResponse.json(
        {
          error: "Server Configuration Error",
          details: "Anthropic API key is not configured on the server",
        },
        { status: 500 }
      );
    }

    const sceneAnalyzer = new SceneAnalyzer();
    const analysis = await sceneAnalyzer.analyzeScene(sceneDescription);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Scene analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze scene",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
