"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import type { Scene } from "@/lib/ai/scriptAnalysis";

interface ScriptSection {
  type: string;
  content: string;
  notes: string;
  scene?: Scene;
}

interface YouTubeScript {
  title: string;
  hook: string;
  sections: ScriptSection[];
  callToAction: string;
  thumbnailIdeas: string[];
  metadata: {
    description: string;
    tags: string[];
    category: string;
  };
}

interface ApiError {
  error: string;
  details?: string;
  timestamp?: string;
}

export default function CreateVideoPage() {
  const searchParams = useSearchParams();
  const [script, setScript] = useState<YouTubeScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [viewMode, setViewMode] = useState<"document" | "sections">("document");
  const [documentContent, setDocumentContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<ApiError | null>(null);

  useEffect(() => {
    const scriptParam = searchParams.get("script");
    if (scriptParam) {
      try {
        const decodedScript = JSON.parse(decodeURIComponent(scriptParam));
        setScript(decodedScript);
        // Initialize document content
        const content = formatScriptToDocument(decodedScript);
        setDocumentContent(content);
      } catch (err) {
        console.error("Failed to parse script:", err);
        setError("Failed to load script data");
      }
    }
  }, [searchParams]);

  const formatScriptToDocument = (script: YouTubeScript): string => {
    return `Title: ${script.title}

Hook:
${script.hook}

${script.sections
  .map(
    (section) => `[${section.type}]
${section.content}
Notes: ${section.notes}
`
  )
  .join("\n")}
Call to Action:
${script.callToAction}

Metadata:
Description: ${script.metadata.description}
Tags: ${script.metadata.tags.join(", ")}
Category: ${script.metadata.category}`;
  };

  const parseDocumentToScript = (document: string): YouTubeScript | null => {
    try {
      const lines = document.split("\n");
      let currentScript: Partial<YouTubeScript> = {
        sections: [],
        metadata: {
          tags: [],
          description: "",
          category: "",
        },
      };

      let currentSection: Partial<ScriptSection> | null = null;
      let mode: "none" | "hook" | "section" | "cta" | "metadata" = "none";

      for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        if (line.startsWith("Title:")) {
          currentScript.title = line.replace("Title:", "").trim();
        } else if (line === "Hook:") {
          mode = "hook";
          currentScript.hook = "";
        } else if (line.startsWith("[") && line.endsWith("]")) {
          if (currentSection) {
            (currentScript.sections as ScriptSection[]).push(
              currentSection as ScriptSection
            );
          }
          mode = "section";
          currentSection = {
            type: line.slice(1, -1),
            content: "",
            notes: "",
          };
        } else if (line === "Call to Action:") {
          if (currentSection) {
            (currentScript.sections as ScriptSection[]).push(
              currentSection as ScriptSection
            );
            currentSection = null;
          }
          mode = "cta";
          currentScript.callToAction = "";
        } else if (line === "Metadata:") {
          mode = "metadata";
        } else {
          switch (mode) {
            case "hook":
              currentScript.hook = (currentScript.hook || "") + line + "\n";
              break;
            case "section":
              if (line.startsWith("Notes:")) {
                if (currentSection) {
                  currentSection.notes = line.replace("Notes:", "").trim();
                }
              } else {
                if (currentSection) {
                  currentSection.content =
                    (currentSection.content || "") + line + "\n";
                }
              }
              break;
            case "cta":
              currentScript.callToAction =
                (currentScript.callToAction || "") + line + "\n";
              break;
            case "metadata":
              if (line.startsWith("Description:")) {
                currentScript.metadata!.description = line
                  .replace("Description:", "")
                  .trim();
              } else if (line.startsWith("Tags:")) {
                currentScript.metadata!.tags = line
                  .replace("Tags:", "")
                  .split(",")
                  .map((tag) => tag.trim());
              } else if (line.startsWith("Category:")) {
                currentScript.metadata!.category = line
                  .replace("Category:", "")
                  .trim();
              }
              break;
          }
        }
      }

      // Add the last section if exists
      if (currentSection) {
        (currentScript.sections as ScriptSection[]).push(
          currentSection as ScriptSection
        );
      }

      // Clean up multiline strings
      if (currentScript.hook) {
        currentScript.hook = currentScript.hook.trim();
      }
      if (currentScript.callToAction) {
        currentScript.callToAction = currentScript.callToAction.trim();
      }
      currentScript.sections = (currentScript.sections as ScriptSection[]).map(
        (section) => ({
          ...section,
          content: section.content.trim(),
        })
      );

      return currentScript as YouTubeScript;
    } catch (err) {
      console.error("Failed to parse document:", err);
      return null;
    }
  };

  const handleDocumentChange = (newContent: string) => {
    setDocumentContent(newContent);
    const newScript = parseDocumentToScript(newContent);
    if (newScript) {
      setScript(newScript);
    }
  };

  const handleScriptChange = (
    field: keyof YouTubeScript,
    value: string | ScriptSection[]
  ) => {
    if (!script) return;

    setScript((prev) => {
      if (!prev) return prev;
      const newScript = {
        ...prev,
        [field]: value,
      };
      // Update document content
      setDocumentContent(formatScriptToDocument(newScript));
      return newScript;
    });
  };

  const handleSectionChange = (
    index: number,
    field: keyof ScriptSection,
    value: string
  ) => {
    if (!script) return;

    const newSections = [...script.sections];
    newSections[index] = {
      ...newSections[index],
      [field]: value,
    };

    handleScriptChange("sections", newSections);
  };

  const handleGenerateVideo = async () => {
    if (!script) return;

    setIsGenerating(true);
    setError("");
    setGenerationProgress(0);

    try {
      // Prepare enhanced video generation payload
      const videoGenerationPayload = {
        script,
        style: "modern",
        sceneSettings: script.sections
          .map((section) => {
            if (!section.scene) return null;

            return {
              type: section.scene.type,
              visualStyle: {
                lighting: section.scene.visualStyle.lighting,
                pace: section.scene.visualStyle.pace,
                colorScheme: section.scene.visualStyle.colorScheme,
              },
              music: {
                genre: section.scene.suggestedMusic.genre,
                tempo: section.scene.suggestedMusic.tempo,
                mood: section.scene.suggestedMusic.mood,
              },
              sentiment: {
                mood: section.scene.sentiment.mood,
                intensity: section.scene.sentiment.intensity,
              },
              keywords: section.scene.keywords,
            };
          })
          .filter(Boolean), // Remove null values for unanalyzed sections
      };

      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(videoGenerationPayload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate video");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to read response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        try {
          const data = JSON.parse(chunk);
          if (data.progress) {
            setGenerationProgress(data.progress);
          }
          if (data.url) {
            setVideoUrl(data.url);
          }
        } catch (e) {
          console.error("Failed to parse chunk:", e);
        }
      }
    } catch (err) {
      console.error("Video generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeScriptContent = async () => {
    if (!script) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      console.log("Preparing script for analysis");
      const scriptContent = formatScriptToDocument(script);

      const response = await fetch("/api/script/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script: scriptContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Analysis request failed:", data);
        throw new Error(
          data.details || data.error || "Failed to analyze script"
        );
      }

      if (!data.scenes || !Array.isArray(data.scenes)) {
        console.error("Invalid analysis response:", data);
        throw new Error("Invalid analysis response format");
      }

      // Update sections with scene analysis
      const updatedSections = script.sections.map((section, index) => ({
        ...section,
        scene: data.scenes[index],
      }));

      handleScriptChange("sections", updatedSections);
    } catch (err) {
      console.error("Script analysis error:", err);
      setAnalysisError({
        error: "Analysis Failed",
        details:
          err instanceof Error ? err.message : "An unexpected error occurred",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsAnalyzing(false);
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
            Please generate a script from the Viral Hub first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Video
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Edit your script and generate a video
        </p>
      </div>

      {/* View Mode Toggle and Analysis Button */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode("document")}
            className={`px-4 py-2 rounded-md ${
              viewMode === "document"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Document View
          </button>
          <button
            onClick={() => setViewMode("sections")}
            className={`px-4 py-2 rounded-md ${
              viewMode === "sections"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Sections View
          </button>
        </div>
        <button
          onClick={analyzeScriptContent}
          disabled={isAnalyzing}
          className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Analyzing Script...
            </>
          ) : (
            "Analyze Script"
          )}
        </button>
      </div>

      {analysisError && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <h3 className="font-medium">{analysisError.error}</h3>
          {analysisError.details && (
            <p className="mt-1 text-sm">{analysisError.details}</p>
          )}
          {analysisError.timestamp && (
            <p className="mt-2 text-xs text-red-500">
              {new Date(analysisError.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        {viewMode === "document" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Script Document
            </label>
            <textarea
              value={documentContent}
              onChange={(e) => handleDocumentChange(e.target.value)}
              rows={20}
              className="w-full font-mono text-sm rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </div>
        ) : (
          <>
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                value={script.title}
                onChange={(e) => handleScriptChange("title", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Hook */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hook
              </label>
              <textarea
                value={script.hook}
                onChange={(e) => handleScriptChange("hook", e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sections
              </label>
              {script.sections.map((section, index) => (
                <div
                  key={index}
                  className="rounded-md border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </label>
                      <input
                        type="text"
                        value={section.type}
                        onChange={(e) =>
                          handleSectionChange(index, "type", e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Content
                      </label>
                      <textarea
                        value={section.content}
                        onChange={(e) =>
                          handleSectionChange(index, "content", e.target.value)
                        }
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notes
                      </label>
                      <textarea
                        value={section.notes}
                        onChange={(e) =>
                          handleSectionChange(index, "notes", e.target.value)
                        }
                        rows={2}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Scene Analysis Results */}
                    {section.scene && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-4">
                          Scene Analysis Results
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {/* Contextual Understanding */}
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Scene Type & Context
                            </label>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">
                                {section.scene.type}
                              </span>
                              {section.content}
                            </div>
                          </div>

                          {/* Sentiment Analysis */}
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Emotional Analysis
                            </label>
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Mood: {section.scene.sentiment.mood}
                                </div>
                                <div className="mt-1 relative pt-1">
                                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                                    <div
                                      style={{
                                        width: `${Math.round(
                                          section.scene.sentiment.intensity *
                                            100
                                        )}%`,
                                      }}
                                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                                    ></div>
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Intensity:{" "}
                                    {Math.round(
                                      section.scene.sentiment.intensity * 100
                                    )}
                                    %
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Keywords */}
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Extracted Keywords
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {section.scene.keywords.map((keyword, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Visual Style */}
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Visual Style Recommendations
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Lighting
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {section.scene.visualStyle.lighting}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Pace
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {section.scene.visualStyle.pace}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Color Scheme
                                </div>
                                <div className="flex gap-2 mt-1">
                                  {section.scene.visualStyle.colorScheme.map(
                                    (color, i) => (
                                      <span
                                        key={i}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                      >
                                        {color}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Music Suggestions */}
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Music Recommendations
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Genre
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {section.scene.suggestedMusic.genre}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Tempo
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {section.scene.suggestedMusic.tempo}
                                </div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Mood
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {section.scene.suggestedMusic.mood}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Call to Action
              </label>
              <textarea
                value={script.callToAction}
                onChange={(e) =>
                  handleScriptChange("callToAction", e.target.value)
                }
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </>
        )}

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerateVideo}
            disabled={isGenerating}
            className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-400"
          >
            {isGenerating ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating Video ({generationProgress}%)
              </>
            ) : (
              "Generate Video"
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Video Preview */}
      {videoUrl && (
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Generated Video
          </h2>
          <video
            controls
            className="aspect-video w-full rounded-lg"
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}
