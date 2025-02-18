import {
  TransitionConfig,
  TransitionPreset,
  SceneTransitionMetadata,
  TransitionType,
} from "./types";

export class TransitionsService {
  private transitionPresets: TransitionPreset[] = [
    {
      id: "smooth-fade",
      name: "Smooth Fade",
      category: "minimal",
      config: {
        type: "fade",
        duration: 1,
        timing: "easeInOut",
      },
      description:
        "A gentle fade transition suitable for emotional or calm scenes",
      recommendedFor: ["dialogue", "emotional"],
    },
    {
      id: "dynamic-slide",
      name: "Dynamic Slide",
      category: "dynamic",
      config: {
        type: "slide",
        duration: 0.7,
        direction: "left",
        timing: "easeOut",
      },
      description: "A smooth sliding transition for dynamic scene changes",
      recommendedFor: ["action", "energetic"],
    },
    {
      id: "cinematic-blur",
      name: "Cinematic Blur",
      category: "creative",
      config: {
        type: "blur",
        duration: 1.2,
        intensity: 0.7,
        timing: "easeInOut",
      },
      description: "A cinematic blur transition for dramatic effect",
      recommendedFor: ["dramatic", "emotional"],
    },
    {
      id: "luma-wave",
      name: "Luma Wave",
      category: "creative",
      config: {
        type: "lumaFade",
        duration: 1,
        customParams: {
          pattern: "wave",
          frequency: 2,
        },
      },
      description: "A creative wave-like transition using luma patterns",
      recommendedFor: ["creative", "music"],
    },
    {
      id: "quick-cut",
      name: "Quick Cut",
      category: "energetic",
      config: {
        type: "fade",
        duration: 0.3,
        timing: "linear",
      },
      description: "A quick cut transition for high-energy sequences",
      recommendedFor: ["action", "fast-paced"],
    },
    // Add more presets as needed
  ];

  public getTransitionPresets(): TransitionPreset[] {
    return this.transitionPresets;
  }

  public getPresetsByCategory(category: string): TransitionPreset[] {
    return this.transitionPresets.filter(
      (preset) => preset.category === category
    );
  }

  public suggestTransitions(
    metadata: SceneTransitionMetadata
  ): TransitionPreset[] {
    const suggestions: TransitionPreset[] = [];

    // Suggest based on pace
    if (metadata.pace === "fast") {
      suggestions.push(
        ...this.transitionPresets.filter(
          (p) =>
            p.config.duration <= 0.5 || p.recommendedFor?.includes("fast-paced")
        )
      );
    } else if (metadata.pace === "slow") {
      suggestions.push(
        ...this.transitionPresets.filter(
          (p) =>
            p.config.duration >= 1 || p.recommendedFor?.includes("emotional")
        )
      );
    }

    // Suggest based on mood
    if (metadata.mood === "dramatic" || metadata.mood === "emotional") {
      suggestions.push(
        ...this.transitionPresets.filter(
          (p) =>
            p.category === "emotional" || p.recommendedFor?.includes("dramatic")
        )
      );
    }

    // Suggest based on content type
    if (metadata.contentType === "action") {
      suggestions.push(
        ...this.transitionPresets.filter(
          (p) =>
            p.category === "energetic" || p.recommendedFor?.includes("action")
        )
      );
    } else if (metadata.contentType === "dialogue") {
      suggestions.push(
        ...this.transitionPresets.filter(
          (p) =>
            p.category === "minimal" || p.recommendedFor?.includes("dialogue")
        )
      );
    }

    // Remove duplicates
    const uniqueSuggestions = Array.from(new Set(suggestions));

    // Sort by relevance (more matching criteria = higher relevance)
    return uniqueSuggestions.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, metadata);
      const scoreB = this.calculateRelevanceScore(b, metadata);
      return scoreB - scoreA;
    });
  }

  private calculateRelevanceScore(
    preset: TransitionPreset,
    metadata: SceneTransitionMetadata
  ): number {
    let score = 0;

    // Score based on pace match
    if (metadata.pace === "fast" && preset.config.duration <= 0.5) score += 2;
    if (metadata.pace === "slow" && preset.config.duration >= 1) score += 2;

    // Score based on mood/content matches in recommendedFor
    if (preset.recommendedFor) {
      if (preset.recommendedFor.includes(metadata.mood)) score += 3;
      if (preset.recommendedFor.includes(metadata.contentType)) score += 3;
    }

    // Score based on category appropriateness
    if (metadata.contentType === "action" && preset.category === "energetic")
      score += 2;
    if (metadata.contentType === "dialogue" && preset.category === "minimal")
      score += 2;

    return score;
  }

  public customizeTransition(
    baseConfig: TransitionConfig,
    customizations: Partial<TransitionConfig>
  ): TransitionConfig {
    return {
      ...baseConfig,
      ...customizations,
      customParams: {
        ...baseConfig.customParams,
        ...customizations.customParams,
      },
    };
  }

  public async generateTransitionPreview(
    config: TransitionConfig
  ): Promise<string> {
    // This would be implemented to generate a preview video/animation of the transition
    // For now, return a placeholder URL
    return `/transitions/previews/${config.type}.mp4`;
  }

  public getDefaultConfigForType(type: TransitionType): TransitionConfig {
    const defaults: Record<TransitionType, TransitionConfig> = {
      fade: {
        type: "fade",
        duration: 1,
        timing: "easeInOut",
      },
      crossDissolve: {
        type: "crossDissolve",
        duration: 1,
        timing: "linear",
      },
      wipe: {
        type: "wipe",
        duration: 0.8,
        direction: "left",
        timing: "easeInOut",
      },
      slide: {
        type: "slide",
        duration: 0.7,
        direction: "left",
        timing: "easeOut",
      },
      zoom: {
        type: "zoom",
        duration: 0.9,
        timing: "easeInOut",
        customParams: { scale: 1.5 },
      },
      blur: {
        type: "blur",
        duration: 1.2,
        intensity: 0.7,
        timing: "easeInOut",
      },
      lumaFade: {
        type: "lumaFade",
        duration: 1,
        timing: "linear",
        customParams: { pattern: "gradient" },
      },
      objectMorph: {
        type: "objectMorph",
        duration: 1.5,
        timing: "easeInOut",
        customParams: { matchPoints: 8 },
      },
      glitch: {
        type: "glitch",
        duration: 0.5,
        intensity: 0.6,
        timing: "easeInOut",
      },
      whip: {
        type: "whip",
        duration: 0.4,
        direction: "left",
        timing: "easeInOut",
        intensity: 0.8,
      },
    };

    return defaults[type];
  }
}
