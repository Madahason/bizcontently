import { NextResponse } from "next/server";
import { analyzeScript } from "@/lib/ai/scriptAnalysis";

export async function POST(req: Request) {
  try {
    // Log request details
    console.log("Received script analysis request");

    const body = await req.json();
    console.log("Request body length:", JSON.stringify(body).length);

    if (!body.script) {
      console.error("Missing script content in request");
      return NextResponse.json(
        {
          error: "Script content is required",
          details: "The request body must include a 'script' field",
        },
        { status: 400 }
      );
    }

    // Validate script content
    if (typeof body.script !== "string") {
      console.error("Invalid script content type:", typeof body.script);
      return NextResponse.json(
        {
          error: "Invalid script content",
          details: "Script content must be a string",
        },
        { status: 400 }
      );
    }

    if (body.script.length === 0) {
      console.error("Empty script content");
      return NextResponse.json(
        {
          error: "Invalid script content",
          details: "Script content cannot be empty",
        },
        { status: 400 }
      );
    }

    console.log("Starting script analysis");
    const analysis = await analyzeScript(body.script);
    console.log("Analysis completed successfully");

    return NextResponse.json(analysis);
  } catch (error) {
    // Enhanced error logging
    console.error("Script analysis error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return detailed error response
    return NextResponse.json(
      {
        error: "Failed to analyze script",
        details:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
