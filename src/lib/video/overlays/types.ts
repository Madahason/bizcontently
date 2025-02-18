export type TextAnimationType =
  | "fade"
  | "slide"
  | "typewriter"
  | "bounce"
  | "scale"
  | "wave"
  | "highlight"
  | "glitch"
  | "reveal";

export type TextPlacement =
  | "top"
  | "bottom"
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center-left"
  | "center-right"
  | "smart";

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: "normal" | "bold" | number;
  color: string;
  backgroundColor?: string;
  opacity: number;
  letterSpacing?: number;
  lineHeight?: number;
  textShadow?: string;
  padding?: number;
  borderRadius?: number;
}

export interface TextAnimationConfig {
  type: TextAnimationType;
  duration: number;
  delay: number;
  easing: string;
  params?: {
    direction?: "left" | "right" | "up" | "down";
    intensity?: number;
    speed?: number;
    [key: string]: any;
  };
}

export interface TextHighlight {
  text: string;
  startIndex: number;
  endIndex: number;
  style: Partial<TextStyle>;
  animation?: TextAnimationConfig;
}

export interface TextOverlayConfig {
  text: string;
  style: TextStyle;
  placement: TextPlacement;
  animation: TextAnimationConfig;
  highlights?: TextHighlight[];
  smartPlacement?: {
    avoidFaces: boolean;
    avoidBrightAreas: boolean;
    maintainContrast: boolean;
    padding: number;
  };
}

export interface TextTemplate {
  id: string;
  name: string;
  category: string;
  config: TextOverlayConfig;
  preview?: string;
}

export interface TextOverlayTheme {
  id: string;
  name: string;
  styles: {
    heading: TextStyle;
    body: TextStyle;
    caption: TextStyle;
    highlight: Partial<TextStyle>;
  };
  animations: {
    entrance: TextAnimationConfig;
    emphasis: TextAnimationConfig;
    exit: TextAnimationConfig;
  };
}
