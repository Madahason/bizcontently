import { NextResponse } from "next/server";
import { AssetMatchingService } from "@/lib/video/assetMatching/AssetMatchingService";
import { VisualSearchCriteria } from "@/lib/video/assetMatching/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sceneDescription, options } = body;

    if (!sceneDescription) {
      return NextResponse.json(
        { error: "Scene description is required" },
        { status: 400 }
      );
    }

    const assetMatcher = new AssetMatchingService();

    console.log("Searching assets for scene:", sceneDescription);
    console.log("Search options:", options);

    const assets = await assetMatcher.findAssets(
      sceneDescription,
      options as Partial<VisualSearchCriteria>
    );

    console.log(`Found ${assets.length} matching assets`);

    return NextResponse.json({
      assets,
      totalResults: assets.length,
      providers: assetMatcher.getProviders(),
    });
  } catch (error) {
    console.error("Asset matching error:", error);
    return NextResponse.json(
      {
        error: "Failed to match assets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
