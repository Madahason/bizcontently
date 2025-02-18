"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AssetMatchingService } from "@/lib/video/assetMatching/AssetMatchingService";
import type { Scene } from "@/lib/ai/scriptAnalysis";
import type { AssetSearchResult } from "@/lib/video/assetMatching/types";
import VoiceCustomizer from "@/app/components/narration/VoiceCustomizer";
import TransitionSelector from "@/app/components/transitions/TransitionSelector";

interface SceneAssets {
  suggested: AssetSearchResult[];
  selected: AssetSearchResult | null;
}

interface SceneEditorState {
  [sceneIndex: number]: SceneAssets;
}

export default function SceneEditorPage() {
  const searchParams = useSearchParams();
  const [script, setScript] = useState<any>(null);
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
        setScript(decodedScript);
        loadAssetsForScene(0, decodedScript);
      } catch (err) {
        console.error("Failed to parse script:", err);
        setError("Failed to load script data");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (script?.sections?.[currentScene]?.transition) {
      setCurrentTransition(script.sections[currentScene].transition);
    }
  }, [script, currentScene]);

  const loadAssetsForScene = async (sceneIndex: number, scriptData: any) => {
    if (!scriptData?.sections?.[sceneIndex]) return;

    setIsLoading(true);
    try {
      const section = scriptData.sections[sceneIndex];

      // Only fetch if we haven't already loaded assets for this scene
      if (!sceneAssets[sceneIndex]) {
        let searchCriteria;

        if (section.scene) {
          // Use existing scene analysis
          searchCriteria = {
            style: section.scene.visualStyle.lighting,
            mood: section.scene.sentiment.mood,
            elements: section.scene.keywords.map((keyword: string) => ({
              type: "object",
              description: keyword,
              importance: 1,
              attributes: {},
            })),
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
                sceneDescription: section.content,
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
              sceneDescription: section.content,
            };
          }
        }

        // Search for assets using the criteria
        const assets = await assetMatcher.findAssets(
          section.content,
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

  const handleTransitionChange = (config: TransitionConfig) => {
    setCurrentTransition(config);
    if (script?.sections?.[currentScene]) {
      const updatedSection = {
        ...script.sections[currentScene],
        transition: config,
      };
      const updatedScript = {
        ...script,
        sections: {
          ...script.sections,
          [currentScene]: updatedSection,
        },
      };
      setScript(updatedScript);
    }
  };

  if (!script) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            No Script Found
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please generate a script first.
          </p>
        </div>
      </div>
    );
  }

  const currentSection = script.sections[currentScene];
  const currentAssets = sceneAssets[currentScene];

  return (
    <div className="space-y-8 p-6 pt-40">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Scene {currentScene + 1} of {script.sections.length}
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              if (currentScene > 0) {
                setCurrentScene((prev) => prev - 1);
                loadAssetsForScene(currentScene - 1, script);
              }
            }}
            disabled={currentScene === 0}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
          >
            Previous Scene
          </button>
          <button
            onClick={() => {
              if (currentScene < script.sections.length - 1) {
                setCurrentScene((prev) => prev + 1);
                loadAssetsForScene(currentScene + 1, script);
              }
            }}
            disabled={currentScene === script.sections.length - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Next Scene
          </button>
        </div>
      </div>

      {/* Scene Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">{currentSection.type}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {currentSection.content}
        </p>
        {currentSection.scene && (
          <div className="flex flex-wrap gap-2">
            {currentSection.scene.keywords.map((keyword: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Voice Narration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Scene Narration</h3>
        <VoiceCustomizer
          text={currentSection.content}
          onGenerate={(url) => {
            setNarrationUrl(url);
            setNarrationError(null);
          }}
          onError={(error) => {
            setNarrationError(error);
            setNarrationUrl(null);
          }}
        />
        {narrationError && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {narrationError}
          </div>
        )}
      </div>

      {/* Asset Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suggested Assets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Suggested Assets</h3>
          <div className="grid grid-cols-2 gap-4">
            {currentAssets?.suggested.map((asset) => (
              <div
                key={asset.url}
                className={`relative rounded-lg overflow-hidden cursor-pointer ${
                  currentAssets.selected?.url === asset.url
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
                onClick={() => selectAsset(asset)}
              >
                {asset.type === "video" ? (
                  <video
                    src={asset.url}
                    className="w-full h-32 object-cover"
                    muted
                    loop
                    onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                  />
                ) : (
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.metadata.title}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                  {asset.metadata.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            Search Replacement Assets
          </h3>
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for assets..."
              className="flex-1 px-4 py-2 border rounded-lg"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Search
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {searchResults.map((asset) => (
              <div
                key={asset.url}
                className="relative rounded-lg overflow-hidden cursor-pointer"
                onClick={() => selectAsset(asset)}
              >
                {asset.type === "video" ? (
                  <video
                    src={asset.url}
                    className="w-full h-32 object-cover"
                    muted
                    loop
                    onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                  />
                ) : (
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.metadata.title}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                  {asset.metadata.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {currentSection && (
        <div className="mt-6">
          <h3 className="mb-4 text-lg font-semibold">Scene Transition</h3>
          <TransitionSelector
            onTransitionSelect={handleTransitionChange}
            initialConfig={currentTransition || undefined}
            sceneMetadata={{
              pace: currentSection.content.length > 200 ? "slow" : "fast",
              mood: "neutral", // You can customize this based on content analysis
              contentType: "dialogue", // You can customize this based on scene type
            }}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      )}
    </div>
  );
}
