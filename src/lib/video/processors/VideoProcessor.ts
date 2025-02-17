import path from "path";
import fs from "fs";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

interface TextOverlay {
  text: string;
  startTime: number;
  duration: number;
  position: "top" | "center" | "bottom";
  fontSize?: number;
}

export class VideoProcessor {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), "public", "videos");
    this.ensureDirectories();
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
}
