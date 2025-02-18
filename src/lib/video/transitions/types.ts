export type TransitionType =
  | "fade"
  | "crossDissolve"
  | "wipe"
  | "slide"
  | "zoom"
  | "blur"
  | "lumaFade"
  | "objectMorph"
  | "glitch"
  | "whip";

export type TransitionDirection = "left" | "right" | "up" | "down";

export type TransitionTiming = "linear" | "easeIn" | "easeOut" | "easeInOut";

export interface BaseTransitionConfig {
  type: TransitionType;
  duration: number;
  timing: TransitionTiming;
}

export interface DirectionalTransitionConfig extends BaseTransitionConfig {
  direction: TransitionDirection;
}

export interface IntensityTransitionConfig extends BaseTransitionConfig {
  intensity: number;
}

export interface CustomParamsTransitionConfig extends BaseTransitionConfig {
  customParams: Record<string, any>;
}

export type TransitionConfig = BaseTransitionConfig &
  Partial<DirectionalTransitionConfig> &
  Partial<IntensityTransitionConfig> &
  Partial<CustomParamsTransitionConfig>;

export interface TransitionPreset {
  id: string;
  name: string;
  category: string;
  config: TransitionConfig;
  description: string;
  recommendedFor?: string[];
}

export interface SceneTransitionMetadata {
  pace: "slow" | "fast";
  mood: string;
  contentType: string;
}
