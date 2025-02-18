import { BaseAssetProvider } from "../BaseAssetProvider";
import {
  AssetSearchResult,
  VisualSearchCriteria,
  ProviderConfig,
  SceneElement,
} from "../types";
import axios from "axios";

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  image: string;
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }[];
  user: {
    name: string;
    url: string;
  };
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  videos: PexelsVideo[];
  prev_page?: string;
  next_page?: string;
}

export class PexelsProvider extends BaseAssetProvider {
  private baseUrl = "https://api.pexels.com/videos";

  constructor(config: ProviderConfig) {
    super({
      ...config,
      name: "Pexels",
      rateLimit: {
        requestsPerMinute: 100,
        requestsPerDay: 20000,
      },
    });
  }

  private buildSearchQuery(criteria: VisualSearchCriteria): string {
    const queryParts: string[] = [];

    // Add main elements based on importance
    criteria.elements
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3) // Take top 3 most important elements
      .forEach((element) => {
        switch (element.type) {
          case "character":
            queryParts.push(this.buildCharacterQuery(element));
            break;
          case "location":
            queryParts.push(this.buildLocationQuery(element));
            break;
          case "object":
            queryParts.push(this.buildObjectQuery(element));
            break;
        }
      });

    // Add style and mood
    if (criteria.style) {
      queryParts.push(criteria.style.toLowerCase());
    }
    if (criteria.mood) {
      queryParts.push(criteria.mood.toLowerCase());
    }

    return queryParts.join(" ");
  }

  private buildCharacterQuery(element: SceneElement): string {
    const { attributes } = element;
    const parts: string[] = [];

    if (attributes.gender) parts.push(attributes.gender as string);
    if (attributes.age) parts.push(attributes.age as string);
    parts.push(element.description);

    return parts.join(" ");
  }

  private buildLocationQuery(element: SceneElement): string {
    return element.description;
  }

  private buildObjectQuery(element: SceneElement): string {
    const { attributes } = element;
    const parts: string[] = [element.description];

    if (attributes.color) parts.unshift(attributes.color as string);
    if (attributes.size) parts.unshift(attributes.size as string);

    return parts.join(" ");
  }

  private mapPexelsResponse(
    video: PexelsVideo,
    criteria: VisualSearchCriteria
  ): AssetSearchResult {
    // Find the best quality video file
    const videoFile = video.video_files
      .sort((a, b) => b.height * b.width - a.height * a.width)
      .find((file) => file.file_type === "video/mp4");

    if (!videoFile) {
      throw new Error("No suitable video file found");
    }

    return {
      url: videoFile.link,
      thumbnailUrl: video.image,
      type: "video",
      provider: this.name,
      confidence: 0, // Will be calculated by base class
      metadata: {
        title: `Pexels Video ${video.id}`,
        description: "", // Pexels doesn't provide descriptions
        duration: video.duration,
        resolution: `${video.width}x${video.height}`,
        tags: [], // We'll enhance this with AI-generated tags
        style: criteria.style,
        mood: criteria.mood,
        attribution: {
          name: video.user.name,
          url: video.user.url,
        },
      },
      license: {
        type: "Pexels License",
        requiresAttribution: true,
        restrictions: [
          "No resale of the video itself",
          "Don't imply endorsement",
        ],
      },
    };
  }

  protected async searchAssets(
    criteria: VisualSearchCriteria
  ): Promise<AssetSearchResult[]> {
    const searchQuery = this.buildSearchQuery(criteria);

    try {
      const response = await axios.get<PexelsSearchResponse>(
        `${this.baseUrl}/search`,
        {
          params: {
            query: searchQuery,
            per_page: 15,
            orientation: "landscape",
            size: "large",
          },
          headers: {
            Authorization: this.apiKey,
          },
        }
      );

      return response.data.videos.map((video) =>
        this.mapPexelsResponse(video, criteria)
      );
    } catch (error) {
      console.error("Pexels API error:", error);
      throw new Error(
        `Failed to search Pexels: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
