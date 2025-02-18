import { NextResponse } from "next/server";
import { analyzeScript } from "@/lib/ai/scriptAnalysis";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    let lastError = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Analysis attempt ${attempt}/${MAX_RETRIES}`);
        const analysis = await analyzeScript(body.script);
        console.log("Analysis completed successfully");
        return NextResponse.json(analysis);
      } catch (error) {
        lastError = error;
        const isOverloaded =
          error instanceof Error &&
          (error.message.includes("overloaded") ||
            error.message.toLowerCase().includes("rate limit") ||
            error.message.includes("429"));

        if (isOverloaded && attempt < MAX_RETRIES) {
          console.log(
            `Attempt ${attempt} failed due to overload, retrying in ${RETRY_DELAY}ms...`
          );
          await sleep(RETRY_DELAY * attempt); // Exponential backoff
          continue;
        }
        break;
      }
    }

    // If we get here, all retries failed
    console.error("All analysis attempts failed:", lastError);

    // Check if it's an overloaded error for the final response
    const isOverloaded =
      lastError instanceof Error &&
      (lastError.message.includes("overloaded") ||
        lastError.message.toLowerCase().includes("rate limit") ||
        lastError.message.includes("429"));

    return NextResponse.json(
      {
        error: isOverloaded
          ? "Service temporarily unavailable"
          : "Failed to analyze script",
        details: isOverloaded
          ? "The service is currently experiencing high load. Please try again in a few moments."
          : lastError instanceof Error
          ? lastError.message
          : "An unexpected error occurred",
        timestamp: new Date().toISOString(),
        retryAfter: isOverloaded ? 5 : undefined, // Suggest retry after 5 seconds for overloaded errors
      },
      {
        status: isOverloaded ? 503 : 500,
        headers: isOverloaded ? { "Retry-After": "5" } : undefined,
      }
    );
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
