import {
  TextOverlayConfig,
  TextTemplate,
  TextOverlayTheme,
  TextStyle,
  TextAnimationConfig,
  TextPlacement,
  TextHighlight,
} from "./types";

export class TextOverlayService {
  private templates: TextTemplate[] = [
    {
      id: "title-reveal",
      name: "Title Reveal",
      category: "titles",
      config: {
        text: "Sample Title",
        style: {
          fontFamily: "Inter",
          fontSize: 48,
          fontWeight: "bold",
          color: "#FFFFFF",
          opacity: 1,
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          padding: 20,
        },
        placement: "center",
        animation: {
          type: "reveal",
          duration: 1,
          delay: 0,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          params: {
            direction: "up",
          },
        },
      },
    },
    {
      id: "caption-typewriter",
      name: "Caption Typewriter",
      category: "captions",
      config: {
        text: "Sample Caption",
        style: {
          fontFamily: "Roboto",
          fontSize: 24,
          fontWeight: "normal",
          color: "#FFFFFF",
          opacity: 0.9,
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: 12,
          borderRadius: 4,
        },
        placement: "bottom",
        animation: {
          type: "typewriter",
          duration: 1.5,
          delay: 0.2,
          easing: "linear",
        },
      },
    },
    // Add more templates as needed
  ];

  private themes: TextOverlayTheme[] = [
    {
      id: "modern",
      name: "Modern",
      styles: {
        heading: {
          fontFamily: "Inter",
          fontSize: 48,
          fontWeight: "bold",
          color: "#FFFFFF",
          opacity: 1,
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          padding: 20,
        },
        body: {
          fontFamily: "Roboto",
          fontSize: 24,
          fontWeight: "normal",
          color: "#FFFFFF",
          opacity: 0.9,
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: 12,
          borderRadius: 4,
        },
        caption: {
          fontFamily: "Roboto",
          fontSize: 18,
          fontWeight: "normal",
          color: "#FFFFFF",
          opacity: 0.8,
          backgroundColor: "rgba(0,0,0,0.3)",
          padding: 8,
          borderRadius: 2,
        },
        highlight: {
          backgroundColor: "rgba(255,255,0,0.3)",
          color: "#FFFFFF",
          fontWeight: "bold",
        },
      },
      animations: {
        entrance: {
          type: "fade",
          duration: 0.5,
          delay: 0,
          easing: "ease-out",
        },
        emphasis: {
          type: "wave",
          duration: 0.8,
          delay: 0,
          easing: "ease-in-out",
        },
        exit: {
          type: "fade",
          duration: 0.5,
          delay: 0,
          easing: "ease-in",
        },
      },
    },
    // Add more themes as needed
  ];

  public getTemplates(category?: string): TextTemplate[] {
    if (category) {
      return this.templates.filter(
        (template) => template.category === category
      );
    }
    return this.templates;
  }

  public getThemes(): TextOverlayTheme[] {
    return this.themes;
  }

  public createOverlay(config: Partial<TextOverlayConfig>): TextOverlayConfig {
    const defaultConfig: TextOverlayConfig = {
      text: "",
      style: this.themes[0].styles.body,
      placement: "center",
      animation: this.themes[0].animations.entrance,
    };

    return { ...defaultConfig, ...config };
  }

  public applyTheme(
    config: TextOverlayConfig,
    themeId: string,
    type: "heading" | "body" | "caption"
  ): TextOverlayConfig {
    const theme = this.themes.find((t) => t.id === themeId);
    if (!theme) throw new Error(`Theme ${themeId} not found`);

    return {
      ...config,
      style: { ...theme.styles[type], ...config.style },
      animation: { ...theme.animations.entrance, ...config.animation },
    };
  }

  public addHighlight(
    config: TextOverlayConfig,
    highlight: TextHighlight
  ): TextOverlayConfig {
    return {
      ...config,
      highlights: [...(config.highlights || []), highlight],
    };
  }

  public async findOptimalPlacement(
    frame: ImageData,
    config: TextOverlayConfig
  ): Promise<TextPlacement> {
    if (!config.smartPlacement) return config.placement;

    // This would be implemented with computer vision to:
    // 1. Detect faces and important objects
    // 2. Analyze brightness/contrast
    // 3. Find areas with good contrast for text
    // 4. Return the optimal placement

    // For now, return the configured placement
    return config.placement;
  }

  public generateAnimationKeyframes(config: TextAnimationConfig): string {
    // Generate CSS keyframes for the animation
    switch (config.type) {
      case "fade":
        return `
          @keyframes fadeAnimation {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `;
      case "slide":
        const direction = config.params?.direction || "left";
        const offset = "50px";
        return `
          @keyframes slideAnimation {
            from {
              transform: translate${
                direction === "left" || direction === "right" ? "X" : "Y"
              }(${
          direction === "left" || direction === "up" ? offset : `-${offset}`
        });
              opacity: 0;
            }
            to {
              transform: translate${
                direction === "left" || direction === "right" ? "X" : "Y"
              }(0);
              opacity: 1;
            }
          }
        `;
      // Add more animation types
      default:
        return "";
    }
  }

  public getAnimationCSS(config: TextAnimationConfig): string {
    const keyframes = this.generateAnimationKeyframes(config);
    return `
      ${keyframes}
      animation: ${config.type}Animation ${config.duration}s ${config.easing} ${config.delay}s forwards;
    `;
  }

  public getHighlightStyles(
    highlight: TextHighlight
  ): Partial<CSSStyleDeclaration> {
    return {
      backgroundColor: highlight.style.backgroundColor || "rgba(255,255,0,0.3)",
      color: highlight.style.color || "inherit",
      fontWeight: highlight.style.fontWeight?.toString() || "inherit",
      transition: "all 0.3s ease",
      // Add more style properties as needed
    };
  }
}
