import { NextResponse } from "next/server";
import { SceneAnalyzer } from "@/lib/video/assetMatching/SceneAnalyzer";
import type { VisualSearchCriteria } from "@/lib/video/assetMatching/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sceneDescription } = body;

    if (!sceneDescription) {
      return NextResponse.json(
        { error: "Scene description is required" },
        { status: 400 }
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
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
