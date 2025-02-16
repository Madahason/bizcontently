import { NextResponse } from "next/server";
import { VideoStyle, VideoScene } from "@/lib/video/templates/base/types";
import { StockTemplateEngine } from "@/lib/video/engines/StockTemplateEngine";
import Replicate from "replicate";

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

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

async function generateVideoWithReplicate(
  prompt: string,
  sectionIndex: number,
  totalSections: number
): Promise<{ url: string; progress: number }> {
  try {
    console.log(
      `Generating video for section ${sectionIndex + 1}/${totalSections}`
    );
    console.log(`Prompt: ${prompt}`);

    const prediction = await replicate.predictions.create({
      version:
        "50c64285d83176af599c927e4d0c5d0bfd10d7151c946ef8f1edcd1d3d01ab6b",
      input: {
        prompt,
        num_frames: 14,
        width: 1024,
        height: 576,
        num_inference_steps: 25,
        fps: 6,
        motion_bucket_id: 127,
        seed: Math.floor(Math.random() * 2147483647),
      },
    });

    // Wait for the prediction to complete
    let result = await replicate.predictions.get(prediction.id);
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      result = await replicate.predictions.get(prediction.id);
      console.log(
        `Generation status for section ${sectionIndex + 1}: ${result.status}`
      );
    }

    if (result.status === "failed") {
      throw new Error(
        `Video generation failed for section ${sectionIndex + 1}: ${
          result.error
        }`
      );
    }

    const progress = ((sectionIndex + 1) / totalSections) * 100;
    return {
      url: result.output as string,
      progress,
    };
  } catch (error) {
    console.error("Video generation error:", error);
    throw new Error(
      `Failed to generate video for section ${sectionIndex + 1}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function POST(req: Request) {
  try {
    const { script, style } = await req.json();

    // Validate input
    if (!script || !style) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate API key
    if (!process.env.REPLICATE_API_KEY) {
      return NextResponse.json(
        { error: "Replicate API key is not configured" },
        { status: 500 }
      );
    }

    // Prepare all sections
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

    // Generate videos sequentially to better handle errors and progress
    const videos = [];
    let currentProgress = 0;

    for (let i = 0; i < allSections.length; i++) {
      const section = allSections[i];
      const prompt = `${section.content}. Style: cinematic, professional, high quality video with smooth motion`;

      try {
        const { url, progress } = await generateVideoWithReplicate(
          prompt,
          i,
          totalSections
        );
        videos.push(url);
        currentProgress = progress;

        // Send progress update
        console.log(
          `Section ${
            i + 1
          }/${totalSections} completed. Progress: ${currentProgress}%`
        );
      } catch (error) {
        console.error(`Error generating video for section ${i + 1}:`, error);
        return NextResponse.json(
          {
            error: `Failed to generate video for ${section.type}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            progress: currentProgress,
          },
          { status: 500 }
        );
      }
    }

    console.log("All videos generated successfully");
    return NextResponse.json({
      status: "completed",
      videos,
      previewUrl: videos[0],
      progress: 100,
    });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate video",
        progress: 0,
      },
      { status: 500 }
    );
  }
}
