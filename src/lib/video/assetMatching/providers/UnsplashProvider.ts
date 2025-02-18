import { BaseAssetProvider } from "../BaseAssetProvider";
import {
  AssetSearchResult,
  VisualSearchCriteria,
  ProviderConfig,
  SceneElement,
} from "../types";
import axios from "axios";

interface UnsplashImage {
  id: string;
  width: number;
  height: number;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  tags: {
    title: string;
  }[];
  color: string;
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

export class UnsplashProvider extends BaseAssetProvider {
  private baseUrl = "https://api.unsplash.com";

  constructor(config: ProviderConfig) {
    super({
      ...config,
      name: "Unsplash",
      rateLimit: {
        requestsPerMinute: 50,
        requestsPerDay: 5000,
      },
    });
    this.types = ["image"];
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

  private mapUnsplashResponse(
    image: UnsplashImage,
    criteria: VisualSearchCriteria
  ): AssetSearchResult {
    return {
      url: image.urls.full,
      thumbnailUrl: image.urls.thumb,
      type: "image",
      provider: this.name,
      confidence: 0, // Will be calculated by base class
      metadata: {
        title: `Unsplash Image ${image.id}`,
        description: image.tags.map((tag) => tag.title).join(", "),
        resolution: `${image.width}x${image.height}`,
        tags: image.tags.map((tag) => tag.title),
        style: criteria.style,
        mood: criteria.mood,
        color: image.color,
        attribution: {
          name: image.user.name,
          url: image.user.links.html,
        },
      },
      license: {
        type: "Unsplash License",
        requiresAttribution: true,
        restrictions: [
          "Don't sell unaltered copies",
          "Don't compile photos from Unsplash to replicate a similar service",
        ],
      },
    };
  }

  protected async searchAssets(
    criteria: VisualSearchCriteria
  ): Promise<AssetSearchResult[]> {
    const searchQuery = this.buildSearchQuery(criteria);

    try {
      const response = await axios.get<UnsplashSearchResponse>(
        `${this.baseUrl}/search/photos`,
        {
          params: {
            query: searchQuery,
            per_page: 15,
            orientation: "landscape",
          },
          headers: {
            Authorization: `Client-ID ${this.apiKey}`,
          },
        }
      );

      return response.data.results.map((image) =>
        this.mapUnsplashResponse(image, criteria)
      );
    } catch (error) {
      console.error("Unsplash API error:", error);
      throw new Error(
        `Failed to search Unsplash: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
