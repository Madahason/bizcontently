import path from "path";
import fs from "fs";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { StockTemplateEngine } from "../engines/StockTemplateEngine";
import type { Scene } from "@/lib/ai/scriptAnalysis";
import { AssetMatchingService } from "../assetMatching/AssetMatchingService";
import { VisualSearchCriteria } from "../assetMatching/types";

interface TextOverlay {
  text: string;
  startTime: number;
  duration: number;
  position: "top" | "center" | "bottom";
  fontSize?: number;
}

interface VideoProcessorConfig {
  templateEngine: StockTemplateEngine;
  enhancedSettings: {
    scenes: Scene[];
    globalStyle: string;
  };
}

export class VideoProcessor {
  private outputDir: string;
  private templateEngine: StockTemplateEngine;
  private enhancedSettings: {
    scenes: Scene[];
    globalStyle: string;
  };
  private assetMatcher: AssetMatchingService;

  constructor(config: VideoProcessorConfig) {
    this.outputDir = path.join(process.cwd(), "public", "videos");
    this.ensureDirectories();
    this.templateEngine = config.templateEngine;
    this.enhancedSettings = config.enhancedSettings;
    this.assetMatcher = new AssetMatchingService();
  }

  private ensureDirectories() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private async downloadAndSaveVideo(
    url: string,
    outputFileName: string
  ): Promise<string> {
    try {
      console.log("Downloading video from:", url);
      const response = await axios({
        url,
        method: "GET",
        responseType: "arraybuffer",
      });

      const outputPath = path.join(this.outputDir, `${outputFileName}.mp4`);
      await fs.promises.writeFile(outputPath, new Uint8Array(response.data));
      return `/videos/${outputFileName}.mp4`;
    } catch (error) {
      console.error("Failed to download video:", error);
      throw new Error(`Failed to download video from ${url}`);
    }
  }

  async processVideo(
    videoUrl: string,
    textOverlays: TextOverlay[],
    outputFileName: string
  ): Promise<string> {
    try {
      // For now, we'll just download and serve the original video
      // Text overlays will need to be handled client-side
      return await this.downloadAndSaveVideo(videoUrl, outputFileName);
    } catch (error) {
      console.error("Error processing video:", error);
      throw error;
    }
  }

  async concatenateVideos(
    videoPaths: string[],
    outputFileName: string
  ): Promise<string> {
    try {
      // For now, we'll just return the first video
      // In a real implementation, you might want to use a client-side solution
      // or a cloud service for video concatenation
      if (videoPaths.length === 0) {
        throw new Error("No videos provided");
      }

      const firstVideoPath = path.join(process.cwd(), "public", videoPaths[0]);
      const outputPath = path.join(this.outputDir, `${outputFileName}.mp4`);

      await fs.promises.copyFile(firstVideoPath, outputPath);
      return `/videos/${outputFileName}.mp4`;
    } catch (error) {
      console.error("Error concatenating videos:", error);
      throw error;
    }
  }

  async addTransition(
    videoPath: string,
    transitionType: "fade" | "dissolve" | "slide",
    duration: number = 1
  ): Promise<string> {
    try {
      // For now, we'll just return the original video
      // Transitions can be handled client-side using video.js or similar
      const inputPath = path.join(process.cwd(), "public", videoPath);
      const outputFileName = `${uuidv4()}.mp4`;
      const outputPath = path.join(this.outputDir, outputFileName);

      await fs.promises.copyFile(inputPath, outputPath);
      return `/videos/${outputFileName}`;
    } catch (error) {
      console.error("Error adding transition:", error);
      throw error;
    }
  }

  private async findStockFootage(section: any): Promise<string[]> {
    try {
      const searchCriteria: VisualSearchCriteria = {
        sceneDescription: section.content,
        style: this.enhancedSettings.globalStyle,
        elements: section.settings?.elements || [],
        mood: section.settings?.sentiment?.mood,
        colorScheme: section.settings?.visualStyle?.colorScheme,
      };

      const assets = await this.assetMatcher.findAssets(
        section.content,
        searchCriteria
      );

      // Return the URLs of the top matching assets
      return assets.slice(0, 3).map((asset) => asset.url);
    } catch (error) {
      console.error("Error finding stock footage:", error);
      return [];
    }
  }

  async generateVideo(
    script: any,
    onProgress: (progress: number) => Promise<void>
  ): Promise<string> {
    try {
      const sections = [
        { type: "Hook", content: script.hook },
        ...script.sections.map((section: any, index: number) => ({
          type: section.type,
          content: section.content,
          settings: this.enhancedSettings.scenes[index] || null,
        })),
        { type: "Call to Action", content: script.callToAction },
      ];

      let currentProgress = 0;
      const videos: string[] = [];

      for (const [index, section] of sections.entries()) {
        // Find appropriate stock footage using the asset matcher
        const stockFootage = await this.findStockFootage(section);

        // Apply scene-specific settings if available
        const visualSettings = section.settings
          ? {
              lighting: section.settings.visualStyle.lighting,
              pace: section.settings.visualStyle.pace,
              colorScheme: section.settings.visualStyle.colorScheme,
              keywords: section.settings.keywords,
            }
          : {};

        const musicSettings = section.settings
          ? {
              genre: section.settings.music.genre,
              tempo: section.settings.music.tempo,
              mood: section.settings.music.mood,
            }
          : {};

        // Generate video for this section with enhanced settings
        const sectionVideo = await this.templateEngine.createSection({
          content: section.content,
          type: section.type,
          visualStyle: {
            ...visualSettings,
            globalStyle: this.enhancedSettings.globalStyle,
          },
          music: musicSettings,
          stockFootage, // Pass the found stock footage
        });

        videos.push(sectionVideo);

        // Update progress
        currentProgress = ((index + 1) / sections.length) * 100;
        await onProgress(currentProgress);
      }

      // Combine all section videos
      const finalVideo = await this.templateEngine.combineVideos(videos);
      await onProgress(100);

      return finalVideo;
    } catch (error) {
      console.error("Error in video generation:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to generate video"
      );
    }
  }
}
