"use client";

import { useEffect, useRef } from "react";
import { TextOverlayService } from "@/lib/video/overlays/TextOverlayService";
import type {
  TextOverlayConfig,
  TextHighlight,
} from "@/lib/video/overlays/types";

interface TextOverlayPreviewProps {
  config: TextOverlayConfig;
  width?: number;
  height?: number;
}

export default function TextOverlayPreview({
  config,
  width = 1920,
  height = 1080,
}: TextOverlayPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const service = new TextOverlayService();

  useEffect(() => {
    if (!containerRef.current) return;

    // Apply animation styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = service.getAnimationCSS(config.animation);
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, [config.animation]);

  const getPositionStyles = () => {
    const padding = 40;
    const styles: React.CSSProperties = {
      position: "absolute",
    };

    switch (config.placement) {
      case "top-left":
        styles.top = padding;
        styles.left = padding;
        break;
      case "top":
        styles.top = padding;
        styles.left = "50%";
        styles.transform = "translateX(-50%)";
        break;
      case "top-right":
        styles.top = padding;
        styles.right = padding;
        break;
      case "center-left":
        styles.top = "50%";
        styles.left = padding;
        styles.transform = "translateY(-50%)";
        break;
      case "center":
        styles.top = "50%";
        styles.left = "50%";
        styles.transform = "translate(-50%, -50%)";
        break;
      case "center-right":
        styles.top = "50%";
        styles.right = padding;
        styles.transform = "translateY(-50%)";
        break;
      case "bottom-left":
        styles.bottom = padding;
        styles.left = padding;
        break;
      case "bottom":
        styles.bottom = padding;
        styles.left = "50%";
        styles.transform = "translateX(-50%)";
        break;
      case "bottom-right":
        styles.bottom = padding;
        styles.right = padding;
        break;
    }

    return styles;
  };

  const renderHighlightedText = () => {
    if (!config.highlights || config.highlights.length === 0) {
      return config.text;
    }

    // Sort highlights by start index to handle overlapping highlights
    const sortedHighlights = [...config.highlights].sort(
      (a, b) => a.startIndex - b.startIndex
    );

    let result = [];
    let currentIndex = 0;

    for (const highlight of sortedHighlights) {
      // Add non-highlighted text before this highlight
      if (currentIndex < highlight.startIndex) {
        result.push(
          <span key={`text-${currentIndex}`}>
            {config.text.slice(currentIndex, highlight.startIndex)}
          </span>
        );
      }

      // Add highlighted text
      result.push(
        <span
          key={`highlight-${highlight.startIndex}`}
          style={service.getHighlightStyles(highlight) as React.CSSProperties}
          className="relative"
        >
          {config.text.slice(highlight.startIndex, highlight.endIndex)}
        </span>
      );

      currentIndex = highlight.endIndex;
    }

    // Add any remaining non-highlighted text
    if (currentIndex < config.text.length) {
      result.push(
        <span key={`text-${currentIndex}`}>
          {config.text.slice(currentIndex)}
        </span>
      );
    }

    return result;
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-gray-900"
      style={{
        width: width,
        height: height,
        maxWidth: "100%",
        aspectRatio: `${width}/${height}`,
      }}
    >
      <div
        style={{
          ...getPositionStyles(),
          ...config.style,
          maxWidth: "80%",
        }}
      >
        {renderHighlightedText()}
      </div>
    </div>
  );
}
