import { NextResponse } from "next/server";
import type { VideoStyle } from "@/lib/video/templates/base/types";
import type { PexelsVideo } from "@/lib/video/config/pexels.config";
import {
  searchPexelsVideos,
  getBestQualityVideo,
} from "@/lib/video/config/pexels.config";
import { VideoProcessor } from "@/lib/video/processors/VideoProcessor";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

// Ensure temp and output directories exist
const tempDir = path.join(process.cwd(), "temp");
const outputDir = path.join(process.cwd(), "public", "videos");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Initialize video processor
const videoProcessor = new VideoProcessor();

interface SceneNotes {
  setup: string;
  shots: string[];
  visualElements: string[];
  transitions: string;
}

interface ScriptSection {
  type: string;
  content: string;
  notes: string;
  sceneNotes?: SceneNotes;
}

interface YouTubeScript {
  title: string;
  hook: string;
  sections: ScriptSection[];
  callToAction: string;
  thumbnailIdeas: string[];
  metadata: {
    description: string;
    tags: string[];
    category: string;
    estimatedDuration: string;
  };
}

async function generateVideoSection(
  content: string,
  type: string,
  sectionIndex: number,
  totalSections: number
): Promise<{ url: string; progress: number }> {
  try {
    // Extract keywords from content for better video search
    const keywords = content
      .split(" ")
      .filter((word) => word.length > 3)
      .slice(0, 3)
      .join(" ");

    console.log(`Searching stock footage for: ${keywords}`);

    const searchResponse = await searchPexelsVideos(keywords, 5);
    const videos = searchResponse.videos;

    if (!videos || videos.length === 0) {
      throw new Error("No suitable stock footage found");
    }

    // Select the best quality video file
    const video = videos[0];
    const videoUrl = getBestQualityVideo(video);

    if (!videoUrl) {
      throw new Error("No suitable video file format found");
    }

    // Process video with text overlay
    const textOverlays = [
      {
        text: type.toUpperCase(),
        startTime: 0,
        duration: 2,
        position: "top" as const,
        fontSize: 36,
      },
      {
        text: content,
        startTime: 2,
        duration: 8,
        position: "center" as const,
        fontSize: 48,
      },
    ];

    const outputFileName = `${uuidv4()}-section-${sectionIndex}`;
    const processedVideoUrl = await videoProcessor.processVideo(
      videoUrl,
      textOverlays,
      outputFileName
    );

    // Add transition effect
    const finalVideoUrl = await videoProcessor.addTransition(
      processedVideoUrl,
      "fade",
      1
    );

    const progress = ((sectionIndex + 1) / totalSections) * 100;
    return {
      url: finalVideoUrl,
      progress,
    };
  } catch (error) {
    console.error("Video generation error:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    // Log request details
    const contentType = req.headers.get("content-type");
    console.log("Request headers:", {
      contentType,
      method: req.method,
    });

    // Verify content type
    if (!contentType?.includes("application/json")) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid content type",
          expected: "application/json",
          received: contentType,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the raw body and parse it
    const rawBody = await req.text();
    console.log("Raw request body length:", rawBody.length);
    console.log("Raw request body preview:", rawBody.substring(0, 100));

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      return new NextResponse(
        JSON.stringify({
          error: "Failed to parse JSON body",
          details: error instanceof Error ? error.message : "Unknown error",
          receivedData: rawBody.substring(0, 100) + "...",
          receivedLength: rawBody.length,
          receivedContentType: contentType,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate request body structure
    const { script, style } = body;

    if (!script || !style) {
      return new NextResponse(
        JSON.stringify({
          error: "Missing required fields",
          receivedFields: Object.keys(body),
          expectedFields: ["script", "style"],
          bodyPreview: JSON.stringify(body).substring(0, 100),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Add response headers for streaming
    const headers = new Headers({
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });

    // Validate script structure
    const missingFields = [];
    if (!script.hook) missingFields.push("hook");
    if (!Array.isArray(script.sections)) missingFields.push("sections array");
    if (!script.callToAction) missingFields.push("callToAction");

    if (missingFields.length > 0) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid script structure",
          missingFields,
          receivedScript: script,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!process.env.PEXELS_API_KEY) {
      return new NextResponse(
        JSON.stringify({ error: "Pexels API key is not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const allSections = [
      { type: "Hook", content: script.hook },
      ...script.sections.map((section: ScriptSection) => ({
        type: section.type,
        content: section.content,
      })),
      { type: "Call to Action", content: script.callToAction },
    ];

    const totalSections = allSections.length;
    console.log(`Starting video generation for ${totalSections} sections`);

    const videos = [];
    let currentProgress = 0;

    for (let i = 0; i < allSections.length; i++) {
      const section = allSections[i];
      try {
        const { url, progress } = await generateVideoSection(
          section.content,
          section.type,
          i,
          totalSections
        );
        videos.push(url);
        currentProgress = progress;

        console.log(
          `Section ${
            i + 1
          }/${totalSections} completed. Progress: ${currentProgress}%`
        );
      } catch (error) {
        console.error(`Error generating video for section ${i + 1}:`, error);
        return new NextResponse(
          JSON.stringify({
            error: `Failed to generate video for ${section.type}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            progress: currentProgress,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Concatenate all videos
    try {
      const finalVideo = await videoProcessor.concatenateVideos(
        videos,
        `final-${uuidv4()}`
      );

      console.log("All videos generated and combined successfully");
      return new NextResponse(
        JSON.stringify({
          status: "completed",
          videos: [finalVideo],
          previewUrl: finalVideo,
          progress: 100,
        }),
        {
          status: 200,
          headers,
        }
      );
    } catch (error) {
      console.error("Error concatenating videos:", error);
      return new NextResponse(
        JSON.stringify({
          error: "Failed to combine video sections",
          progress: currentProgress,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Video generation error:", error);
    return new NextResponse(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to generate video",
        progress: 0,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
