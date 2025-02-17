import {
  TemplateEngine,
  VideoTemplate,
  VideoScene,
  VideoAsset,
  TemplateConfig,
} from "../templates/base/types";
import { getTemplateConfig } from "../config/template.config";

const YOUTUBE_SPECS = {
  RESOLUTIONS: {
    "2160p": { width: 3840, height: 2160 },
    "1440p": { width: 2560, height: 1440 },
    "1080p": { width: 1920, height: 1080 },
    "720p": { width: 1280, height: 720 },
    "480p": { width: 854, height: 480 },
    "360p": { width: 640, height: 360 },
  },
  RECOMMENDED_BITRATES: {
    "2160p": { min: 35000, max: 45000 }, // kbps
    "1440p": { min: 16000, max: 24000 },
    "1080p": { min: 8000, max: 12000 },
    "720p": { min: 5000, max: 7500 },
    "480p": { min: 2500, max: 4000 },
    "360p": { min: 1000, max: 1500 },
  },
  ASPECT_RATIO: "16:9",
  MAX_DURATION: 43200, // 12 hours in seconds
  RECOMMENDED_DURATION: 600, // 10 minutes in seconds
};

export abstract class BaseTemplateEngine implements TemplateEngine {
  protected config: TemplateConfig;
  protected assets: Map<string, VideoAsset>;
  protected template: VideoTemplate | null;

  constructor(style: string) {
    this.config = getTemplateConfig(style);
    this.assets = new Map();
    this.template = null;
  }

  // Abstract methods that must be implemented by specific style engines
  abstract createScene(
    content: string,
    style: Record<string, any>
  ): Promise<VideoScene>;
  abstract renderScene(scene: VideoScene): Promise<Blob>;
  abstract previewScene(scene: VideoScene): Promise<string>;

  // Common methods that can be used by all style engines
  protected async loadAsset(asset: VideoAsset): Promise<void> {
    if (!this.assets.has(asset.id)) {
      // Here you would implement asset loading/caching logic
      this.assets.set(asset.id, asset);
    }
  }

  protected validateTemplate(template: VideoTemplate): boolean {
    // Validate aspect ratio for YouTube
    if (template.aspectRatio !== YOUTUBE_SPECS.ASPECT_RATIO) {
      throw new Error(
        `Only ${YOUTUBE_SPECS.ASPECT_RATIO} aspect ratio is supported for YouTube videos`
      );
    }

    // Validate duration for YouTube
    if (template.duration > YOUTUBE_SPECS.MAX_DURATION) {
      throw new Error(
        `Video duration exceeds YouTube maximum of ${YOUTUBE_SPECS.MAX_DURATION} seconds`
      );
    }
    if (template.duration > YOUTUBE_SPECS.RECOMMENDED_DURATION) {
      console.warn(
        `Video duration exceeds recommended YouTube duration of ${YOUTUBE_SPECS.RECOMMENDED_DURATION} seconds`
      );
    }

    // Validate duration
    if (template.duration > this.config.maxDuration) {
      throw new Error(
        `Template duration exceeds maximum of ${this.config.maxDuration} seconds`
      );
    }

    // Validate aspect ratio
    if (!this.config.supportedAspectRatios.includes(template.aspectRatio)) {
      throw new Error(`Aspect ratio ${template.aspectRatio} is not supported`);
    }

    // Validate scenes
    let totalDuration = 0;
    for (const scene of template.scenes) {
      totalDuration += scene.duration;

      // Validate scene elements
      for (const element of scene.elements) {
        if (element.startTime + (element.duration || 0) > scene.duration) {
          throw new Error(
            `Element duration exceeds scene duration in scene ${scene.id}`
          );
        }
      }
    }

    // Validate total duration matches sum of scenes
    if (Math.abs(totalDuration - template.duration) > 0.1) {
      // Allow 0.1s tolerance
      throw new Error("Total scene duration does not match template duration");
    }

    return true;
  }

  async renderTemplate(template: VideoTemplate): Promise<Blob> {
    try {
      // Validate template
      this.validateTemplate(template);
      this.template = template;

      // Load all assets
      const assetLoadPromises: Promise<void>[] = [];
      for (const scene of template.scenes) {
        if (scene.background) {
          assetLoadPromises.push(this.loadAsset(scene.background));
        }
        for (const element of scene.elements) {
          if (typeof element.content !== "string") {
            assetLoadPromises.push(this.loadAsset(element.content));
          }
        }
      }

      // Load audio assets
      if (template.audio?.voiceover) {
        assetLoadPromises.push(this.loadAsset(template.audio.voiceover));
      }
      if (template.audio?.background) {
        assetLoadPromises.push(this.loadAsset(template.audio.background));
      }
      if (template.audio?.effects) {
        template.audio.effects.forEach((effect) => {
          assetLoadPromises.push(this.loadAsset(effect));
        });
      }

      await Promise.all(assetLoadPromises);

      // Render each scene
      const sceneBlobs = await Promise.all(
        template.scenes.map((scene) => this.renderScene(scene))
      );

      // Combine scenes and add audio
      // This is a placeholder - actual implementation would depend on the video processing library used
      return new Blob(sceneBlobs, { type: "video/mp4" });
    } catch (error) {
      console.error("Error rendering template:", error);
      throw error;
    }
  }

  // YouTube-specific utilities
  protected getYouTubeResolution(
    quality: keyof typeof YOUTUBE_SPECS.RESOLUTIONS = "1080p"
  ) {
    return YOUTUBE_SPECS.RESOLUTIONS[quality];
  }

  protected getYouTubeBitrate(
    quality: keyof typeof YOUTUBE_SPECS.RECOMMENDED_BITRATES = "1080p"
  ) {
    return YOUTUBE_SPECS.RECOMMENDED_BITRATES[quality];
  }

  protected calculateAspectRatioDimensions(
    quality: keyof typeof YOUTUBE_SPECS.RESOLUTIONS = "1080p"
  ): { width: number; height: number } {
    return YOUTUBE_SPECS.RESOLUTIONS[quality];
  }

  // Export with YouTube recommended settings
  async exportVideo(
    template: VideoTemplate,
    format: string = "mp4",
    quality: keyof typeof YOUTUBE_SPECS.RESOLUTIONS = "1080p"
  ): Promise<Blob> {
    const videoBlob = await this.renderTemplate(template);
    const resolution = this.getYouTubeResolution(quality);
    const bitrate = this.getYouTubeBitrate(quality);

    // Here you would implement video processing to match YouTube specs
    // For now, we'll just return the rendered video
    console.log(
      `Exporting video at ${quality} (${resolution.width}x${resolution.height}) with target bitrate ${bitrate.min}-${bitrate.max}kbps`
    );

    return videoBlob;
  }

  // Utility methods
  protected generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
