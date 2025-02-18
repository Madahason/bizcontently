"use client";

import { useState, useEffect } from "react";
import { TransitionsService } from "@/lib/video/transitions/TransitionsService";
import {
  TransitionConfig,
  TransitionPreset,
  SceneTransitionMetadata,
} from "@/lib/video/transitions/types";

interface TransitionSelectorProps {
  onTransitionSelect: (config: TransitionConfig) => void;
  sceneMetadata?: SceneTransitionMetadata;
  initialConfig?: TransitionConfig;
}

export default function TransitionSelector({
  onTransitionSelect,
  sceneMetadata,
  initialConfig,
}: TransitionSelectorProps) {
  const [transitionsService] = useState(() => new TransitionsService());
  const [selectedPreset, setSelectedPreset] = useState<TransitionPreset | null>(
    null
  );
  const [customConfig, setCustomConfig] = useState<TransitionConfig | null>(
    null
  );
  const [presets, setPresets] = useState<TransitionPreset[]>([]);
  const [suggestions, setSuggestions] = useState<TransitionPreset[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    // Load all presets
    const allPresets = transitionsService.getTransitionPresets();
    setPresets(allPresets);

    // Load suggestions if metadata is provided
    if (sceneMetadata) {
      const suggestedPresets =
        transitionsService.suggestTransitions(sceneMetadata);
      setSuggestions(suggestedPresets);
    }

    // Set initial config if provided
    if (initialConfig) {
      const matchingPreset = allPresets.find(
        (preset) => preset.config.type === initialConfig.type
      );
      if (matchingPreset) {
        setSelectedPreset(matchingPreset);
        setCustomConfig(initialConfig);
      }
    }
  }, [sceneMetadata, initialConfig]);

  useEffect(() => {
    // Generate preview when config changes
    if (customConfig) {
      transitionsService
        .generateTransitionPreview(customConfig)
        .then(setPreviewUrl);
    }
  }, [customConfig]);

  const handlePresetSelect = (preset: TransitionPreset) => {
    setSelectedPreset(preset);
    setCustomConfig(preset.config);
    onTransitionSelect(preset.config);
  };

  const handleCustomization = (updates: Partial<TransitionConfig>) => {
    if (!customConfig) return;

    const newConfig = transitionsService.customizeTransition(
      customConfig,
      updates
    );
    setCustomConfig(newConfig);
    onTransitionSelect(newConfig);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Suggested Transitions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Suggested Transitions</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {suggestions.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  selectedPreset?.id === preset.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200"
                }`}
              >
                <div className="font-medium">{preset.name}</div>
                <div className="text-sm text-gray-500">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Presets */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">All Transitions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                selectedPreset?.id === preset.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-200"
              }`}
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-sm text-gray-500">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Customization Controls */}
      {customConfig && (
        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold">Customize Transition</h3>

          {/* Duration Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (seconds)</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={customConfig.duration}
              onChange={(e) =>
                handleCustomization({ duration: parseFloat(e.target.value) })
              }
              className="w-full"
            />
            <div className="text-sm text-gray-500">
              {customConfig.duration}s
            </div>
          </div>

          {/* Timing Function */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Timing</label>
            <select
              value={customConfig.timing}
              onChange={(e) => handleCustomization({ timing: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="linear">Linear</option>
              <option value="easeIn">Ease In</option>
              <option value="easeOut">Ease Out</option>
              <option value="easeInOut">Ease In Out</option>
            </select>
          </div>

          {/* Direction (if applicable) */}
          {"direction" in customConfig && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Direction</label>
              <select
                value={customConfig.direction}
                onChange={(e) =>
                  handleCustomization({ direction: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="up">Up</option>
                <option value="down">Down</option>
              </select>
            </div>
          )}

          {/* Intensity (if applicable) */}
          {"intensity" in customConfig && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Intensity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={customConfig.intensity}
                onChange={(e) =>
                  handleCustomization({
                    intensity: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
              <div className="text-sm text-gray-500">
                {customConfig.intensity * 100}%
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Preview</h3>
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            <video
              src={previewUrl}
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
            />
          </div>
        </div>
      )}
    </div>
  );
}
