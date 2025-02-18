import { BaseAssetProvider } from "./BaseAssetProvider";
import { PexelsProvider } from "./providers/PexelsProvider";
import { UnsplashProvider } from "./providers/UnsplashProvider";
import { SceneAnalyzer } from "./SceneAnalyzer";
import { ProviderAuthManager } from "./ProviderAuthManager";
import {
  AssetSearchResult,
  VisualSearchCriteria,
  ProviderConfig,
} from "./types";

export class AssetMatchingService {
  private providers: Map<string, BaseAssetProvider> = new Map();
  private authManager: ProviderAuthManager;

  constructor() {
    this.authManager = new ProviderAuthManager();
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize providers with environment variables
    if (process.env.PEXELS_API_KEY) {
      const pexelsConfig: ProviderConfig = {
        name: "Pexels",
        enabled: true,
        apiKey: process.env.PEXELS_API_KEY,
        priority: 1,
      };
      this.providers.set("Pexels", new PexelsProvider(pexelsConfig));
    }

    if (process.env.UNSPLASH_API_KEY) {
      const unsplashConfig: ProviderConfig = {
        name: "Unsplash",
        enabled: true,
        apiKey: process.env.UNSPLASH_API_KEY,
        priority: 2,
      };
      this.providers.set("Unsplash", new UnsplashProvider(unsplashConfig));
    }

    // Get any additional providers from the auth manager
    const additionalConfigs = this.authManager.getEnabledProviders();
    additionalConfigs.forEach((config) => {
      // Skip if we already initialized this provider from env vars
      if (this.providers.has(config.name)) return;

      let provider: BaseAssetProvider | null = null;
      switch (config.name.toLowerCase()) {
        case "pexels":
          provider = new PexelsProvider(config);
          break;
        case "unsplash":
          provider = new UnsplashProvider(config);
          break;
      }

      if (provider) {
        this.providers.set(config.name, provider);
      }
    });
  }

  public async findAssets(
    sceneDescription: string,
    options: Partial<VisualSearchCriteria> = {}
  ): Promise<AssetSearchResult[]> {
    try {
      // Call the scene analysis API endpoint instead of using SceneAnalyzer directly
      const response = await fetch("/api/scene/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sceneDescription }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to analyze scene");
      }

      const searchCriteria: VisualSearchCriteria = await response.json();

      // Merge with provided options
      const finalCriteria = {
        ...searchCriteria,
        ...options,
        sceneDescription,
      };

      // Search across all enabled providers
      const searchPromises = Array.from(this.providers.values()).map(
        (provider) => this.searchProvider(provider, finalCriteria)
      );

      const results = await Promise.allSettled(searchPromises);

      // Collect and sort all successful results
      const allAssets = results
        .filter(
          (result): result is PromiseFulfilledResult<AssetSearchResult[]> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value)
        .flat()
        .sort((a, b) => b.confidence - a.confidence);

      // Log any provider errors
      results
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected"
        )
        .forEach((result) => {
          console.error("Provider search failed:", result.reason);
        });

      return allAssets;
    } catch (error) {
      console.error("Error in findAssets:", error);
      throw error;
    }
  }

  private async searchProvider(
    provider: BaseAssetProvider,
    criteria: VisualSearchCriteria
  ): Promise<AssetSearchResult[]> {
    try {
      return await provider.search(criteria);
    } catch (error) {
      console.error(`Error searching ${provider.name}:`, error);
      return [];
    }
  }

  public async addProvider(config: ProviderConfig): Promise<boolean> {
    try {
      // Validate the configuration
      const isValid = await this.authManager.validateApiKey(
        config.name,
        config.apiKey || ""
      );

      if (!isValid) {
        throw new Error("Invalid API key");
      }

      // Test the connection
      const isConnected = await this.authManager.testConnection(config);

      if (!isConnected) {
        throw new Error("Failed to connect to provider");
      }

      // Save the configuration
      this.authManager.updateConfig(config);

      // Initialize the provider
      this.initializeProviders();

      return true;
    } catch (error) {
      console.error(`Failed to add provider ${config.name}:`, error);
      return false;
    }
  }

  public removeProvider(providerName: string): void {
    this.providers.delete(providerName);
    this.authManager.removeConfig(providerName);
  }

  public getProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  public getProviderConfigs(): ProviderConfig[] {
    return this.authManager.getAllConfigs();
  }
}
