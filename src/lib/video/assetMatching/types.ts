export type AssetType = "video" | "image" | "audio";

export type VisualStyle =
  | "cinematic"
  | "documentary"
  | "animated"
  | "corporate"
  | "casual"
  | "artistic"
  | "minimal";

export interface AssetProvider {
  name: string;
  types: AssetType[];
  requiresAuth: boolean;
  apiKey?: string;
}

export interface SceneElement {
  type: "character" | "location" | "object";
  description: string;
  importance: number; // 0-1 score
  attributes: {
    [key: string]: string | number | boolean;
  };
}

export interface VisualSearchCriteria {
  sceneDescription: string;
  style: VisualStyle;
  duration?: number;
  elements: SceneElement[];
  colorScheme?: string[];
  mood?: string;
  excludeKeywords?: string[];
}

export interface AssetSearchResult {
  url: string;
  thumbnailUrl: string;
  type: AssetType;
  provider: string;
  confidence: number; // 0-1 score
  metadata: {
    title: string;
    description?: string;
    duration?: number;
    resolution?: string;
    tags: string[];
    [key: string]: any;
  };
  license: {
    type: string;
    requiresAttribution: boolean;
    restrictions?: string[];
  };
}

export interface ProviderConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  apiEndpoint?: string;
  priority: number; // Higher number = higher priority
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
}
