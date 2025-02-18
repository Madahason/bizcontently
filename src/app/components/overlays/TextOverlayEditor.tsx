"use client";

import { useState, useEffect } from "react";
import { TextOverlayService } from "@/lib/video/overlays/TextOverlayService";
import type {
  TextOverlayConfig,
  TextTemplate,
  TextOverlayTheme,
  TextHighlight,
  TextAnimationType,
  TextPlacement,
} from "@/lib/video/overlays/types";

interface TextOverlayEditorProps {
  initialConfig?: Partial<TextOverlayConfig>;
  onConfigChange: (config: TextOverlayConfig) => void;
  frameData?: ImageData;
}

export default function TextOverlayEditor({
  initialConfig,
  onConfigChange,
  frameData,
}: TextOverlayEditorProps) {
  const [service] = useState(() => new TextOverlayService());
  const [config, setConfig] = useState<TextOverlayConfig>(() =>
    service.createOverlay(initialConfig || {})
  );
  const [templates, setTemplates] = useState<TextTemplate[]>([]);
  const [themes, setThemes] = useState<TextOverlayTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>("modern");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [highlightText, setHighlightText] = useState("");
  const [showHighlightOptions, setShowHighlightOptions] = useState(false);

  useEffect(() => {
    setTemplates(service.getTemplates());
    setThemes(service.getThemes());
  }, []);

  useEffect(() => {
    if (frameData && config.smartPlacement) {
      service.findOptimalPlacement(frameData, config).then((placement) => {
        handleConfigChange("placement", placement);
      });
    }
  }, [frameData, config.smartPlacement]);

  const handleConfigChange = (key: keyof TextOverlayConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleStyleChange = (key: string, value: any) => {
    handleConfigChange("style", { ...config.style, [key]: value });
  };

  const handleAnimationChange = (key: string, value: any) => {
    handleConfigChange("animation", { ...config.animation, [key]: value });
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setConfig(template.config);
      onConfigChange(template.config);
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    const newConfig = service.applyTheme(config, themeId, "body");
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleAddHighlight = () => {
    if (!highlightText) return;

    const textIndex = config.text.indexOf(highlightText);
    if (textIndex === -1) return;

    const highlight: TextHighlight = {
      text: highlightText,
      startIndex: textIndex,
      endIndex: textIndex + highlightText.length,
      style: themes.find((t) => t.id === selectedTheme)?.styles.highlight || {},
      animation: {
        type: "wave",
        duration: 0.8,
        delay: 0,
        easing: "ease-in-out",
      },
    };

    const newConfig = service.addHighlight(config, highlight);
    setConfig(newConfig);
    onConfigChange(newConfig);
    setHighlightText("");
    setShowHighlightOptions(false);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Templates */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Template
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                selectedTemplate === template.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-200"
              }`}
            >
              <div className="font-medium">{template.name}</div>
              <div className="text-sm text-gray-500">{template.category}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Themes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Theme</label>
        <select
          value={selectedTheme}
          onChange={(e) => handleThemeSelect(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>

      {/* Text Content */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Text</label>
        <textarea
          value={config.text}
          onChange={(e) => handleConfigChange("text", e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {/* Text Style */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Style</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Font
            </label>
            <select
              value={config.style.fontFamily}
              onChange={(e) => handleStyleChange("fontFamily", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Poppins">Poppins</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Size
            </label>
            <input
              type="number"
              value={config.style.fontSize}
              onChange={(e) =>
                handleStyleChange("fontSize", Number(e.target.value))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <input
              type="color"
              value={config.style.color}
              onChange={(e) => handleStyleChange("color", e.target.value)}
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Background
            </label>
            <input
              type="color"
              value={config.style.backgroundColor || "#000000"}
              onChange={(e) =>
                handleStyleChange("backgroundColor", e.target.value)
              }
              className="mt-1 block w-full"
            />
          </div>
        </div>
      </div>

      {/* Animation */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Animation</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              value={config.animation.type}
              onChange={(e) => handleAnimationChange("type", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="typewriter">Typewriter</option>
              <option value="bounce">Bounce</option>
              <option value="scale">Scale</option>
              <option value="wave">Wave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration
            </label>
            <input
              type="number"
              value={config.animation.duration}
              onChange={(e) =>
                handleAnimationChange("duration", Number(e.target.value))
              }
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Placement */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Placement
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            "top-left",
            "top",
            "top-right",
            "center-left",
            "center",
            "center-right",
            "bottom-left",
            "bottom",
            "bottom-right",
          ].map((placement) => (
            <button
              key={placement}
              onClick={() =>
                handleConfigChange("placement", placement as TextPlacement)
              }
              className={`aspect-square rounded border p-2 ${
                config.placement === placement
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="h-full w-full flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-current" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Highlights</h3>
          <button
            onClick={() => setShowHighlightOptions(!showHighlightOptions)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Add Highlight
          </button>
        </div>

        {showHighlightOptions && (
          <div className="space-y-2">
            <input
              type="text"
              value={highlightText}
              onChange={(e) => setHighlightText(e.target.value)}
              placeholder="Enter text to highlight"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              onClick={handleAddHighlight}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        )}

        {config.highlights && config.highlights.length > 0 && (
          <div className="space-y-2">
            {config.highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border border-gray-200 p-2"
              >
                <span>{highlight.text}</span>
                <button
                  onClick={() => {
                    const newHighlights = config.highlights?.filter(
                      (_, i) => i !== index
                    );
                    handleConfigChange("highlights", newHighlights);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
