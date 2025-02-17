import { NextResponse } from "next/server";
import type { VideoStyle } from "@/lib/video/templates/base/types";
import type { PexelsVideo } from "@/lib/video/config/pexels.config";
import {
  searchPexelsVideos,
  getBestQualityVideo,
} from "@/lib/video/config/pexels.config";
import { VideoProcessor } from "@/lib/video/processors/VideoProcessor";
import { StockTemplateEngine } from "@/lib/video/engines/StockTemplateEngine";
import { Scene } from "@/lib/ai/scriptAnalysis";
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

interface SceneSettings {
  type: string;
  visualStyle: {
    lighting: "bright" | "dark" | "natural" | "dramatic";
    pace: "slow" | "medium" | "fast";
    colorScheme: string[];
  };
  music: {
    genre: string;
    tempo: "slow" | "medium" | "fast";
    mood: string;
  };
  sentiment: {
    mood: "happy" | "sad" | "neutral" | "excited" | "serious" | "angry";
    intensity: number;
  };
  keywords: string[];
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
    const { script, style, sceneSettings } = await req.json();

    // Initialize video processor with enhanced settings
    const videoProcessor = new VideoProcessor({
      templateEngine: new StockTemplateEngine(),
      enhancedSettings: {
        scenes: sceneSettings || [],
        globalStyle: style,
      },
    });

    // Create a TransformStream for progress updates
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start video generation with progress callback
    videoProcessor
      .generateVideo(script, async (progress: number) => {
        await writer.write(
          new TextEncoder().encode(
            JSON.stringify({ progress: Math.round(progress) }) + "\n"
          )
        );
      })
      .then(async (videoUrl) => {
        await writer.write(
          new TextEncoder().encode(JSON.stringify({ url: videoUrl }) + "\n")
        );
        await writer.close();
      })
      .catch(async (error) => {
        console.error("Video generation error:", error);
        await writer.abort(error);
      });

    return new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Video generation request error:", error);
    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
}
