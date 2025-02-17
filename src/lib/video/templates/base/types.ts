import { StaticImageData } from "next/image";

export type VideoStyle = "stock";

export type AspectRatio = "16:9";

export interface VideoAsset {
  id: string;
  type: "image" | "video" | "audio" | "font" | "icon";
  url: string;
  duration?: number;
  thumbnail?: string | StaticImageData;
  metadata?: Record<string, any>;
}

export interface TextStyle {
  fontSize: number;
  fontWeight: string;
  color: string;
  backgroundColor?: string;
  padding?: number;
  position: "top" | "center" | "bottom";
}

export interface VideoSection {
  id: string;
  type: string;
  content: string;
  textStyle: TextStyle;
  stockFootage: VideoAsset;
  duration: number;
  transition?: "fade" | "dissolve" | "slide";
}

export interface AnimationPreset {
  id: string;
  name: string;
  duration: number;
  type: "in" | "out" | "emphasis" | "transition";
  properties: Record<string, any>;
}

export interface SceneElement {
  id: string;
  type: "text" | "media" | "shape" | "overlay";
  content: string | VideoAsset;
  position: { x: number; y: number };
  size: { width: number; height: number };
  animation?: AnimationPreset;
  style?: Record<string, any>;
  duration?: number;
  startTime: number;
}

export interface VideoScene {
  id: string;
  duration: number;
  elements: SceneElement[];
  background?: VideoAsset;
  transition?: AnimationPreset;
}

export interface VideoTemplate {
  id: string;
  name: string;
  style: VideoStyle;
  aspectRatio: AspectRatio;
  scenes: VideoScene[];
  duration: number;
  audio?: {
    voiceover?: VideoAsset;
    background?: VideoAsset;
    effects?: VideoAsset[];
  };
  branding?: {
    colors: string[];
    fonts: string[];
    logo?: VideoAsset;
    watermark?: VideoAsset;
  };
}

export interface TemplateConfig {
  maxDuration: number;
  supportedAspectRatios: AspectRatio[];
  defaultBranding: {
    colors: string[];
    fonts: string[];
  };
  defaultTextStyles: {
    title: TextStyle;
    content: TextStyle;
  };
  animations: AnimationPreset[];
  transitions: AnimationPreset[];
}

export interface TemplateEngine {
  createScene(content: string, style: Record<string, any>): Promise<VideoScene>;
  renderScene(scene: VideoScene): Promise<Blob>;
  renderTemplate(template: VideoTemplate): Promise<Blob>;
  previewScene(scene: VideoScene): Promise<string>;
  exportVideo(template: VideoTemplate, format: string): Promise<Blob>;
}
