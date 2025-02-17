import { NextResponse } from "next/server";
import { createSEOAnalysisChain } from "@/lib/ai/chains/seoChains";

interface SEOAnalysisRequest {
  topic: string;
  targetMarket: string;
  existingContent?: string;
  competitors?: string[];
}

export async function POST(req: Request) {
  try {
    const { topic, targetMarket, existingContent, competitors } =
      (await req.json()) as SEOAnalysisRequest;

    if (!topic || !targetMarket) {
      return NextResponse.json(
        { error: "Topic and target market are required" },
        { status: 400 }
      );
    }

    const chain = createSEOAnalysisChain();
    const analysis = await chain.invoke({
      topic,
      targetMarket,
      existingContent,
      competitors,
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("SEO analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze SEO opportunities" },
      { status: 500 }
    );
  }
}
