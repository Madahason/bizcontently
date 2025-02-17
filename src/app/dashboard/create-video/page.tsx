"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VideoStyleSelector from "../../components/VideoStyleSelector";
import { VideoStyle } from "../../lib/video/templates/base/types";
import { StockTemplateEngine } from "../../lib/video/engines/StockTemplateEngine";
import LoadingSpinner from "@/app/components/LoadingSpinner";

interface SceneNotes {
  setup: string;
  shots: string[];
  visualElements: string[];
  transitions: string;
}

interface ScriptSection {
  type: string;
  content: string;
  notes: string;
  sceneNotes?: SceneNotes;
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
    estimatedDuration: string;
  };
}

interface GenerationStatus {
  status: "idle" | "generating" | "completed" | "error";
  progress: number;
  currentStep: string;
  error?: string;
}

interface GenerationResponse {
  status: string;
  videos: string[];
  previewUrl: string;
  progress: number;
  error?: string;
}

function VideoGenerationContent({
  script,
  selectedStyle,
  onComplete,
}: {
  script: YouTubeScript;
  selectedStyle: VideoStyle | undefined;
  onComplete: (videos: string[]) => void;
}) {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    status: "idle",
    progress: 0,
    currentStep: "",
  });

  const handleGenerateVideo = async () => {
    if (!script || !selectedStyle) {
      setGenerationStatus({
        status: "error",
        progress: 0,
        currentStep: "Missing script or style selection",
      });
      return;
    }

    setGenerationStatus({
      status: "generating",
      progress: 0,
      currentStep: "Initializing video generation...",
    });

    try {
      const requestBody = {
        script,
        style: selectedStyle,
      };

      // Log the request body for debugging
      console.log("Request body:", {
        contentType: "application/json",
        bodyLength: JSON.stringify(requestBody).length,
        script: {
          title: script.title,
          sectionsCount: script.sections.length,
        },
        style: selectedStyle,
      });

      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || "Failed to generate video");
        } catch (parseError) {
          throw new Error(`Server error: ${errorText}`);
        }
      }

      const data: GenerationResponse = await response.json();

      if (data.videos && data.videos.length > 0) {
        onComplete(data.videos);
        setGenerationStatus({
          status: "completed",
          progress: 100,
          currentStep: "Video generation completed!",
        });
      } else {
        throw new Error("No videos were generated");
      }
    } catch (error) {
      console.error("Video generation error:", error);
      setGenerationStatus({
        status: "error",
        progress: 0,
        currentStep: "Generation failed",
        error: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={handleGenerateVideo}
        disabled={generationStatus.status === "generating"}
        className="px-6 py-3 rounded-lg font-medium flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generationStatus.status === "generating" ? (
          <>
            <LoadingSpinner />
            <span>Generating...</span>
          </>
        ) : (
          <span>Generate Video</span>
        )}
      </button>

      {generationStatus.status === "error" && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {generationStatus.error}
        </div>
      )}

      {generationStatus.status === "generating" && (
        <div className="p-4 bg-purple-50 text-purple-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <LoadingSpinner />
            <span>{generationStatus.currentStep}</span>
          </div>
          <div className="mt-2 h-2 bg-purple-200 rounded-full">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${generationStatus.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateVideoPage() {
  const searchParams = useSearchParams();
  const [script, setScript] = useState<YouTubeScript | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle | null>(null);
  const [videos, setVideos] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const scriptParam = searchParams.get("script");
    if (scriptParam) {
      try {
        const decodedScript = JSON.parse(decodeURIComponent(scriptParam));
        setScript(decodedScript);
      } catch (error) {
        console.error("Failed to parse script data:", error);
      }
    }
  }, [searchParams]);

  const handleVideoGenerated = (generatedVideos: string[]) => {
    setVideos(generatedVideos);
    if (generatedVideos.length > 0) {
      setPreviewUrl(generatedVideos[0]);
      setCurrentVideoIndex(0);
    }
  };

  if (!script) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Script Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please generate a script first before creating a video.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Create Video: {script.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            First, select a video style that best fits your content.
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <div className="py-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Choose Your Style
            </h2>
            <VideoStyleSelector
              onSelect={setSelectedStyle}
              selectedStyle={selectedStyle || undefined}
            />
          </div>

          {selectedStyle && (
            <div className="space-y-8 pt-6">
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <VideoGenerationContent
                  script={script}
                  selectedStyle={selectedStyle}
                  onComplete={handleVideoGenerated}
                />

                {previewUrl && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Preview
                    </h3>
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
                      <video
                        src={previewUrl}
                        className="w-full h-full"
                        controls
                        autoPlay
                        onEnded={() => {
                          if (videos.length > currentVideoIndex + 1) {
                            setCurrentVideoIndex((prev) => prev + 1);
                            setPreviewUrl(videos[currentVideoIndex + 1]);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}
