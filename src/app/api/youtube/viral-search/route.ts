import { NextResponse } from "next/server";
import { createTrendAnalysisChain } from "@/lib/ai/chains/viralChains";

interface ViralSearchRequest {
  niche: string;
  platform: string;
  targetAudience: string;
  context?: string;
}

export async function POST(req: Request) {
  try {
    const { niche, platform, targetAudience, context } =
      (await req.json()) as ViralSearchRequest;

    if (!niche || !platform || !targetAudience) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const chain = createTrendAnalysisChain();
    const analysis = await chain.invoke({
      niche,
      platform,
      targetAudience,
      context,
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Viral trend analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze viral trends" },
      { status: 500 }
    );
  }
}
