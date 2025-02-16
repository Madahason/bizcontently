import {
  TemplateConfig,
  AnimationPreset,
  AspectRatio,
} from "../templates/base/types";

const defaultAnimations: AnimationPreset[] = [
  {
    id: "fade-in",
    name: "Fade In",
    duration: 0.5,
    type: "in",
    properties: {
      opacity: [0, 1],
      ease: "easeInOut",
    },
  },
  {
    id: "fade-out",
    name: "Fade Out",
    duration: 0.5,
    type: "out",
    properties: {
      opacity: [1, 0],
      ease: "easeInOut",
    },
  },
  {
    id: "slide-in-right",
    name: "Slide In Right",
    duration: 0.7,
    type: "in",
    properties: {
      x: ["100%", "0%"],
      ease: "easeOut",
    },
  },
  {
    id: "scale-up",
    name: "Scale Up",
    duration: 0.5,
    type: "emphasis",
    properties: {
      scale: [1, 1.2],
      ease: "easeInOut",
    },
  },
];

const defaultTransitions: AnimationPreset[] = [
  {
    id: "cross-fade",
    name: "Cross Fade",
    duration: 1,
    type: "transition",
    properties: {
      opacity: [1, 0],
      ease: "easeInOut",
    },
  },
  {
    id: "slide-left",
    name: "Slide Left",
    duration: 0.8,
    type: "transition",
    properties: {
      x: ["0%", "-100%"],
      ease: "easeInOut",
    },
  },
];

export const defaultConfig: TemplateConfig = {
  maxDuration: 600, // 10 minutes (YouTube standard)
  supportedAspectRatios: ["16:9"], // Only 16:9 for YouTube
  defaultBranding: {
    colors: ["#1a1a1a", "#ffffff", "#6b46c1", "#38a169"],
    fonts: ["Inter", "Roboto", "Poppins"],
  },
  animations: defaultAnimations,
  transitions: defaultTransitions,
};

// Style-specific configurations
export const stockConfig: Partial<TemplateConfig> = {
  maxDuration: 180, // 3 minutes
  defaultBranding: {
    colors: ["#1a1a1a", "#ffffff", "#3182ce", "#38a169"],
    fonts: ["Inter", "Roboto"],
  },
};

export const kineticConfig: Partial<TemplateConfig> = {
  maxDuration: 60, // 1 minute
  defaultBranding: {
    colors: ["#1a1a1a", "#ffffff", "#6b46c1", "#e53e3e"],
    fonts: ["Poppins", "Montserrat"],
  },
};

export const whiteboardConfig: Partial<TemplateConfig> = {
  maxDuration: 300, // 5 minutes
  defaultBranding: {
    colors: ["#ffffff", "#1a1a1a", "#4299e1", "#48bb78"],
    fonts: ["Comic Sans MS", "Marker Felt"],
  },
};

export const characterConfig: Partial<TemplateConfig> = {
  maxDuration: 120, // 2 minutes
  defaultBranding: {
    colors: ["#1a1a1a", "#ffffff", "#ed8936", "#4299e1"],
    fonts: ["Nunito", "Quicksand"],
  },
};

// Remove aspect ratio overrides from style configs since we only support 16:9
export function getTemplateConfig(style: string): TemplateConfig {
  const styleConfigs = {
    stock: stockConfig,
    kinetic: kineticConfig,
    whiteboard: whiteboardConfig,
    character: characterConfig,
  };

  const config = {
    ...defaultConfig,
    ...(styleConfigs[style as keyof typeof styleConfigs] || {}),
  };

  // Force 16:9 aspect ratio regardless of style
  config.supportedAspectRatios = ["16:9"];

  return config;
}
