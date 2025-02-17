import { NextResponse } from "next/server";
import { analyzeScript } from "@/lib/ai/scriptAnalysis";

export async function POST(req: Request) {
  try {
    const { script } = await req.json();

    if (!script) {
      return NextResponse.json(
        { error: "Script content is required" },
        { status: 400 }
      );
    }

    const analysis = await analyzeScript(script);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Script analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze script" },
      { status: 500 }
    );
  }
}
