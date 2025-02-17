import { TemplateConfig, TextStyle } from "../templates/base/types";

const defaultTextStyles: { title: TextStyle; content: TextStyle } = {
  title: {
    fontSize: 36,
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
    position: "top",
  },
  content: {
    fontSize: 48,
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
    position: "center",
  },
};

export const defaultConfig: TemplateConfig = {
  maxDuration: 600, // 10 minutes (YouTube standard)
  supportedAspectRatios: ["16:9"], // Only 16:9 for YouTube
  defaultBranding: {
    colors: ["#1a1a1a", "#ffffff", "#3182ce", "#38a169"],
    fonts: ["Inter", "Roboto"],
  },
  defaultTextStyles,
  animations: [
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
      id: "slide-in",
      name: "Slide In",
      duration: 0.7,
      type: "in",
      properties: {
        x: ["-100%", "0%"],
        ease: "easeOut",
      },
    },
  ],
  transitions: [
    {
      id: "fade",
      name: "Fade",
      duration: 0.5,
      type: "transition",
      properties: {
        opacity: [1, 0],
        ease: "easeInOut",
      },
    },
    {
      id: "slide",
      name: "Slide",
      duration: 0.7,
      type: "transition",
      properties: {
        x: ["0%", "-100%"],
        ease: "easeInOut",
      },
    },
  ],
};

// Stock video configuration
export const stockConfig: Partial<TemplateConfig> = {
  maxDuration: 180, // 3 minutes
  defaultBranding: {
    colors: ["#1a1a1a", "#ffffff", "#3182ce", "#38a169"],
    fonts: ["Inter", "Roboto"],
  },
  defaultTextStyles: {
    title: {
      ...defaultTextStyles.title,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    content: {
      ...defaultTextStyles.content,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
  },
};

// Get template configuration
export function getTemplateConfig(style: string): TemplateConfig {
  return {
    ...defaultConfig,
    ...(style === "stock" ? stockConfig : {}),
  };
}
