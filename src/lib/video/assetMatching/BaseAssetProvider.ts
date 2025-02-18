import {
  AssetProvider,
  AssetType,
  VisualSearchCriteria,
  AssetSearchResult,
  ProviderConfig,
} from "./types";

export abstract class BaseAssetProvider implements AssetProvider {
  name: string;
  types: AssetType[];
  requiresAuth: boolean;
  protected apiKey?: string;
  protected config: ProviderConfig;
  private lastRequestTime: number = 0;
  private requestsThisMinute: number = 0;
  private requestsToday: number = 0;
  private dayStartTime: number = Date.now();

  constructor(config: ProviderConfig) {
    this.config = config;
    this.name = config.name;
    this.apiKey = config.apiKey;
    this.requiresAuth = true;
    this.types = ["video", "image"];
  }

  protected async checkRateLimit(): Promise<boolean> {
    const now = Date.now();

    // Reset daily counter if it's a new day
    if (now - this.dayStartTime > 24 * 60 * 60 * 1000) {
      this.requestsToday = 0;
      this.dayStartTime = now;
    }

    // Reset minute counter if it's been more than a minute
    if (now - this.lastRequestTime > 60 * 1000) {
      this.requestsThisMinute = 0;
    }

    // Check rate limits
    if (this.config.rateLimit) {
      if (this.requestsThisMinute >= this.config.rateLimit.requestsPerMinute) {
        throw new Error(
          `Rate limit exceeded for ${this.name}: Too many requests per minute`
        );
      }
      if (this.requestsToday >= this.config.rateLimit.requestsPerDay) {
        throw new Error(
          `Rate limit exceeded for ${this.name}: Daily limit reached`
        );
      }
    }

    this.requestsThisMinute++;
    this.requestsToday++;
    this.lastRequestTime = now;
    return true;
  }

  protected validateAuth(): boolean {
    if (this.requiresAuth && !this.apiKey) {
      throw new Error(
        `${this.name} requires authentication. Please provide an API key.`
      );
    }
    return true;
  }

  protected abstract searchAssets(
    criteria: VisualSearchCriteria
  ): Promise<AssetSearchResult[]>;

  protected calculateConfidence(
    result: AssetSearchResult,
    criteria: VisualSearchCriteria
  ): number {
    let score = 0;
    const weights = {
      keywords: 0.3,
      style: 0.2,
      elements: 0.3,
      mood: 0.1,
      technical: 0.1,
    };

    // Check keywords match
    const keywords = criteria.elements
      .map((el) => el.description.toLowerCase().split(" "))
      .flat();
    const resultKeywords = result.metadata.tags.map((tag) => tag.toLowerCase());
    const keywordMatches = keywords.filter((k) =>
      resultKeywords.includes(k)
    ).length;
    score += (keywordMatches / keywords.length) * weights.keywords;

    // Check style match (if metadata includes style information)
    if (result.metadata.style && result.metadata.style === criteria.style) {
      score += weights.style;
    }

    // Check elements match
    const elementDescriptions = criteria.elements.map((el) =>
      el.description.toLowerCase()
    );
    const descriptionMatches = elementDescriptions.some((desc) =>
      result.metadata.description?.toLowerCase().includes(desc)
    );
    if (descriptionMatches) {
      score += weights.elements;
    }

    // Check mood match
    if (criteria.mood && result.metadata.mood === criteria.mood) {
      score += weights.mood;
    }

    // Technical quality (resolution, duration match if specified)
    if (criteria.duration && result.metadata.duration) {
      const durationDiff = Math.abs(
        criteria.duration - result.metadata.duration
      );
      if (durationDiff < 2) {
        // Within 2 seconds
        score += weights.technical;
      }
    }

    return Math.min(1, score);
  }

  public async search(
    criteria: VisualSearchCriteria
  ): Promise<AssetSearchResult[]> {
    this.validateAuth();
    await this.checkRateLimit();

    const results = await this.searchAssets(criteria);

    // Calculate confidence scores and sort by score
    return results
      .map((result) => ({
        ...result,
        confidence: this.calculateConfidence(result, criteria),
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }
}
