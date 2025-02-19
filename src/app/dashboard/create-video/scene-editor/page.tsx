"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AssetMatchingService } from "@/lib/video/assetMatching/AssetMatchingService";
import type { Scene } from "@/lib/ai/scriptAnalysis";
import type { AssetSearchResult } from "@/lib/video/assetMatching/types";
import type {
  TransitionConfig,
  SceneTransitionMetadata,
} from "@/lib/video/transitions/types";
import VoiceCustomizer from "@/app/components/narration/VoiceCustomizer";
import TransitionSelector from "@/app/components/transitions/TransitionSelector";
import Link from "next/link";

interface SceneAssets {
  suggested: AssetSearchResult[];
  selected: AssetSearchResult | null;
}

interface SceneEditorState {
  [sceneIndex: number]: SceneAssets;
}

const editorTools = [
  {
    name: "Story",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14"
        />
      </svg>
    ),
  },
  {
    name: "Visuals",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    name: "Audio",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828"
        />
      </svg>
    ),
  },
  {
    name: "Styles",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
  },
  {
    name: "Text",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    name: "Branding",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
  },
];

export default function SceneEditorPage() {
  const searchParams = useSearchParams();
  const [script, setScript] = useState<{
    title: string;
    scenes: {
      content: string;
      keywords?: string[];
      visualStyle?: {
        lighting?: string;
        mood?: string;
      };
      transition?: TransitionConfig;
    }[];
  } | null>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [sceneAssets, setSceneAssets] = useState<SceneEditorState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AssetSearchResult[]>([]);
  const [error, setError] = useState("");
  const [narrationUrl, setNarrationUrl] = useState<string | null>(null);
  const [narrationError, setNarrationError] = useState<string | null>(null);
  const [currentTransition, setCurrentTransition] =
    useState<TransitionConfig | null>(null);

  const assetMatcher = new AssetMatchingService();

  useEffect(() => {
    const scriptParam = searchParams.get("script");
    if (scriptParam) {
      try {
        const decodedScript = JSON.parse(decodeURIComponent(scriptParam));
        // Transform the script data to match our expected structure
        const formattedScript = {
          title: decodedScript.title || "Untitled Project",
          scenes: Array.isArray(decodedScript.sections)
            ? decodedScript.sections.map((section: any) => ({
                content: section.content || "",
                keywords: section.scene?.keywords || [],
                visualStyle: {
                  lighting: section.scene?.visualStyle?.lighting || "natural",
                  mood: section.scene?.sentiment?.mood || "neutral",
                },
                transition: section.transition || null,
              }))
            : [],
        };
        setScript(formattedScript);
        // Load assets for the first scene
        loadAssetsForScene(0, formattedScript);
      } catch (err) {
        console.error("Failed to parse script:", err);
        setError("Failed to load script data");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (script?.scenes?.[currentScene]?.transition) {
      setCurrentTransition(script.scenes[currentScene].transition);
    }
  }, [script, currentScene]);

  const loadAssetsForScene = async (sceneIndex: number, scriptData: any) => {
    if (!scriptData?.scenes?.[sceneIndex]) return;

    setIsLoading(true);
    try {
      const scene = scriptData.scenes[sceneIndex];

      // Only fetch if we haven't already loaded assets for this scene
      if (!sceneAssets[sceneIndex]) {
        let searchCriteria;

        if (scene.visualStyle) {
          // Use existing scene analysis
          searchCriteria = {
            style: scene.visualStyle.lighting || "natural",
            mood: scene.visualStyle.mood || "neutral",
            elements:
              scene.keywords?.map((keyword: string) => ({
                type: "object",
                description: keyword,
                importance: 1,
                attributes: {},
              })) || [],
          };
        } else {
          // Get new scene analysis
          try {
            const analysisResponse = await fetch("/api/scene/analyze", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sceneDescription: scene.content,
              }),
            });

            if (!analysisResponse.ok) {
              throw new Error("Failed to analyze scene");
            }

            searchCriteria = await analysisResponse.json();
          } catch (err) {
            console.error("Scene analysis failed:", err);
            // Fallback to basic search if analysis fails
            searchCriteria = {
              sceneDescription: scene.content,
            };
          }
        }

        // Search for assets using the criteria
        const assets = await assetMatcher.findAssets(
          scene.content,
          searchCriteria
        );

        setSceneAssets((prev) => ({
          ...prev,
          [sceneIndex]: {
            suggested: assets,
            selected: assets.length > 0 ? assets[0] : null,
          },
        }));
      }
    } catch (err) {
      console.error("Failed to load assets:", err);
      setError(
        "Failed to load scene assets. Please check your API configuration in settings."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const results = await assetMatcher.findAssets(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to search for assets");
    } finally {
      setIsLoading(false);
    }
  };

  const selectAsset = (asset: AssetSearchResult) => {
    setSceneAssets((prev) => ({
      ...prev,
      [currentScene]: {
        ...prev[currentScene],
        selected: asset,
      },
    }));
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSceneChange = (newIndex: number) => {
    if (script && newIndex >= 0 && newIndex < script.scenes.length) {
      setCurrentScene(newIndex);
      loadAssetsForScene(newIndex, script);
    }
  };

  const updateSceneContent = (content: string) => {
    if (!script) return;

    const updatedScenes = [...script.scenes];
    updatedScenes[currentScene] = {
      ...updatedScenes[currentScene],
      content,
    };

    setScript({
      ...script,
      scenes: updatedScenes,
    });
  };

  // Update the getCompleteScript function to format with empty lines as scene separators
  const getCompleteScript = () => {
    if (!script?.scenes) return "";
    return script.scenes.map((scene) => scene.content).join("\n\n");
  };

  // Add new function to handle script updates
  const handleScriptChange = (newContent: string) => {
    if (!script) return;

    // Split content by double newlines to get scenes
    const sceneContents = newContent
      .split(/\n\s*\n/)
      .map((content) => content.trim())
      .filter((content) => content.length > 0);

    // Create new scenes array with existing metadata
    const updatedScenes = sceneContents.map((content, index) => {
      const existingScene = script.scenes[index] || {
        keywords: [],
        visualStyle: {
          lighting: "natural",
          mood: "neutral",
        },
      };

      return {
        ...existingScene,
        content,
      };
    });

    setScript({
      ...script,
      scenes: updatedScenes,
    });

    // If current scene index is out of bounds, update it
    if (currentScene >= updatedScenes.length) {
      setCurrentScene(Math.max(0, updatedScenes.length - 1));
    }

    // Load assets for the current scene if needed
    loadAssetsForScene(currentScene, { ...script, scenes: updatedScenes });
  };

  if (!script) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-200">
            No Script Found
          </h2>
          <p className="mt-2 text-gray-400">Please generate a script first.</p>
          <Link
            href="/dashboard/create-video"
            className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create New Video
          </Link>
        </div>
      </div>
    );
  }

  const currentSceneData = script?.scenes?.[currentScene] || {
    content: "",
    keywords: [],
    visualStyle: {
      lighting: "natural",
      mood: "neutral",
    },
  };
  const totalDuration = "5m 13s"; // This should be calculated from all scenes
  const currentSceneDuration = "13.5s"; // This should be calculated from current scene

  return (
    <div className="h-screen overflow-hidden bg-[#111827]">
      {/* Left Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-16 bg-[#111827] flex flex-col items-center py-4 space-y-8 z-10 border-r border-gray-700">
        {editorTools.map((tool) => (
          <button
            key={tool.name}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-[#1F2937] rounded-lg transition-colors"
            title={tool.name}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-col pl-16 h-screen">
        {/* Top Bar */}
        <div className="h-16 bg-[#111827] border-b border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1F2937] border border-gray-700 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200 placeholder-gray-400"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-purple-400 border-2 border-purple-500 rounded-lg hover:bg-purple-600 hover:text-white transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Preview video
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Download
            </button>
          </div>
        </div>

        {/* Scene Info Bar */}
        <div className="h-14 bg-[#111827] border-b border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                Scene {currentScene + 1} of {script.scenes.length}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">
                Video duration: {totalDuration}
              </span>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 p-6 flex space-x-6 overflow-hidden">
          {/* Left Column - Text Editor */}
          <div className="w-1/2 bg-[#1F2937] rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Complete Script (Separate scenes with empty lines)
              </label>
              <textarea
                value={getCompleteScript()}
                onChange={(e) => handleScriptChange(e.target.value)}
                className="w-full h-[calc(100vh-380px)] p-4 bg-[#111827] text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                placeholder="Enter your script here...&#10;&#10;Separate scenes with empty lines..."
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Current Scene Keywords
                </label>
                <div className="space-y-2">
                  {currentSceneData.keywords?.map(
                    (keyword: string, index: number) => (
                      <div
                        key={index}
                        className="inline-block mr-2 mb-2 px-3 py-1 bg-[#111827] text-gray-200 rounded-full text-sm"
                      >
                        {keyword}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {script.scenes.length}{" "}
                {script.scenes.length === 1 ? "Scene" : "Scenes"}
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="w-1/2 bg-[#1F2937] rounded-lg shadow-sm p-4 flex flex-col">
            <div className="aspect-video bg-[#111827] rounded-lg overflow-hidden relative">
              {sceneAssets[currentScene]?.selected ? (
                <img
                  src={sceneAssets[currentScene].selected.url}
                  alt="Selected scene asset"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-purple-600/10 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex space-x-4">
                    <button className="p-2 text-white/80 hover:text-white">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                        />
                      </svg>
                    </button>
                    <button className="p-2 text-white/80 hover:text-white">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                    <button className="p-2 text-white/80 hover:text-white">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.334-4zm8 0a1 1 0 000-1.6L14.6 7.2A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800">
                <div className="h-full w-1/3 bg-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Timeline */}
        <div className="h-32 bg-[#1F2937] border-t border-gray-700 p-4">
          <div className="flex items-center space-x-4 h-full">
            <button
              onClick={() => handleSceneChange(currentScene - 1)}
              disabled={currentScene === 0}
              className={`p-2 rounded-lg transition-colors ${
                currentScene === 0
                  ? "text-gray-600"
                  : "text-gray-400 hover:text-white hover:bg-[#111827]"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex-1 flex space-x-3 overflow-x-auto py-2 px-1">
              {script.scenes.map((scene, index) => (
                <button
                  key={index}
                  onClick={() => handleSceneChange(index)}
                  className={`flex-shrink-0 w-40 h-full rounded-lg border-2 ${
                    currentScene === index
                      ? "border-purple-600"
                      : "border-gray-700"
                  } overflow-hidden relative group hover:border-purple-600 transition-colors`}
                >
                  {sceneAssets[index]?.selected ? (
                    <img
                      src={sceneAssets[index].selected.url}
                      alt={`Scene ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#111827] flex items-center justify-center">
                      <span className="text-gray-400">Scene {index + 1}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1.5 px-3">
                    Scene {index + 1}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => handleSceneChange(currentScene + 1)}
              disabled={currentScene === script.scenes.length - 1}
              className={`p-2 rounded-lg transition-colors ${
                currentScene === script.scenes.length - 1
                  ? "text-gray-600"
                  : "text-gray-400 hover:text-white hover:bg-[#111827]"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
