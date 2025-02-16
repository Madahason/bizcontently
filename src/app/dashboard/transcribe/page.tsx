"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ContentAnalysis {
  hooks: {
    type: string;
    timestamp: string;
    description: string;
    effectiveness: number;
  }[];
  callToAction: {
    type: string;
    timestamp: string;
    text: string;
    context: string;
  }[];
  keyTalkingPoints: {
    topic: string;
    timestamp: string;
    keyPoints: string[];
    duration: string;
  }[];
  contentStructure: {
    section: string;
    timestamp: string;
    duration: string;
    purpose: string;
  }[];
  engagementTechniques: {
    technique: string;
    timestamp: string;
    description: string;
    effectiveness: number;
  }[];
  recommendations: {
    category: string;
    suggestion: string;
    reasoning: string;
  }[];
}

interface TranscriptionResult {
  transcript: string;
  paragraphs: {
    text: string;
    start: number;
    end: number;
  }[];
  summary: string;
  topics: string[];
  entities: {
    text: string;
    type: string;
  }[];
  timestamps: {
    text: string;
    start: number;
    end: number;
  }[];
}

interface YouTubeScript {
  title: string;
  hook: string;
  sections: {
    type: string;
    content: string;
    notes: string;
  }[];
  callToAction: string;
  thumbnailIdeas: string[];
  metadata: {
    description: string;
    tags: string[];
    category: string;
  };
}

export default function TranscribePage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] =
    useState<string>("");
  const [transcriptionResult, setTranscriptionResult] =
    useState<TranscriptionResult | null>(null);
  const [contentAnalysis, setContentAnalysis] =
    useState<ContentAnalysis | null>(null);
  const [transcriptionError, setTranscriptionError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptResult, setScriptResult] = useState<YouTubeScript | null>(null);
  const [scriptError, setScriptError] = useState("");

  // Try to paste URL from clipboard on mount
  useEffect(() => {
    const pasteFromClipboard = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText.includes("youtube.com/watch?v=")) {
          setVideoUrl(clipboardText);
        }
      } catch (err) {
        console.log("Could not access clipboard");
      }
    };

    pasteFromClipboard();
  }, []);

  const handleTranscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setIsTranscribing(true);
    setTranscriptionError("");
    setTranscriptionResult(null);
    setTranscriptionProgress("Initializing transcription...");

    try {
      console.log("Starting transcription for video:", videoUrl);
      setTranscriptionProgress("Extracting audio from video...");

      const response = await fetch("/api/deepgram/transcribe-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to transcribe video");
      }

      setTranscriptionProgress("Processing transcription results...");

      // Format the response into our expected format
      const formattedResult: TranscriptionResult = {
        transcript: data.transcript,
        paragraphs: data.paragraphs || [],
        summary: data.summary || "Summary not available",
        topics: data.topics || [],
        entities: data.entities || [],
        timestamps: data.timestamps || [],
      };

      setTranscriptionResult(formattedResult);
    } catch (err) {
      console.error("Transcription error:", err);
      let errorMessage =
        "An unexpected error occurred while transcribing the video";

      if (err instanceof Error) {
        // Clean up the error message
        const message = err.message.replace(/Error: /g, "").trim();
        errorMessage = message || "Failed to transcribe video";
      }

      setTranscriptionError(errorMessage);
    } finally {
      setIsTranscribing(false);
      setTranscriptionProgress("");
    }
  };

  const analyzeContent = async () => {
    if (!transcriptionResult) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/content-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcriptionResult.transcript,
          timestamps: transcriptionResult.timestamps,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze content");
      }

      const analysis = await response.json();
      setContentAnalysis(analysis);
    } catch (err) {
      console.error("Content analysis error:", err);
      setTranscriptionError(
        err instanceof Error ? err.message : "Failed to analyze content"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateYouTubeScript = async () => {
    if (!transcriptionResult || !contentAnalysis) return;

    setIsGeneratingScript(true);
    setScriptError("");
    try {
      const response = await fetch("/api/anthropic/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcriptionResult.transcript,
          contentAnalysis,
          topic: transcriptionResult.topics[0] || "content creation",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate script");
      }

      const script = await response.json();
      setScriptResult(script);
    } catch (err) {
      console.error("Script generation error:", err);
      setScriptError(
        err instanceof Error ? err.message : "Failed to generate script"
      );
    } finally {
      setIsGeneratingScript(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Video Transcription
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Transcribe and analyze YouTube videos with Deepgram AI
        </p>
      </div>

      {/* Input Form */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <form onSubmit={handleTranscribe} className="space-y-4">
          <div>
            <label
              htmlFor="videoUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              YouTube Video URL
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="videoUrl"
                name="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!videoUrl.trim() || isTranscribing}
            className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-400"
          >
            {isTranscribing ? (
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
                Transcribing...
              </>
            ) : (
              "Start Transcription"
            )}
          </button>
        </form>

        {/* Progress Indicator */}
        {transcriptionProgress && (
          <div className="mt-4 flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="h-1 w-1 animate-ping rounded-full bg-purple-500"></div>
            <span>{transcriptionProgress}</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {transcriptionError && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {transcriptionError}
        </div>
      )}

      {/* Loading Skeleton */}
      {isTranscribing && !transcriptionResult && (
        <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="space-y-3">
            <div className="h-6 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="space-y-3">
            <div className="h-6 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transcription Results */}
      <AnimatePresence>
        {transcriptionResult && !isTranscribing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            {/* Full Transcript */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Full Transcript
              </h3>
              <div className="mt-2 max-h-96 space-y-4 overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                {transcriptionResult.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-gray-600 dark:text-gray-400">
                    {paragraph.text}
                  </p>
                ))}
              </div>
            </div>

            {/* Topics */}
            {transcriptionResult.topics.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Main Topics
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {transcriptionResult.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Entities */}
            {transcriptionResult.entities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detected Entities
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {transcriptionResult.entities.map((entity, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      title={entity.type}
                    >
                      {entity.text}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {transcriptionResult.summary && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Summary
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {transcriptionResult.summary}
                </p>
              </div>
            )}

            {/* Content Analysis Button */}
            {!contentAnalysis && !isAnalyzing && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={analyzeContent}
                  className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-400"
                >
                  Analyze Content Structure
                </button>
              </div>
            )}

            {/* Analysis Loading */}
            {isAnalyzing && (
              <div className="flex items-center justify-center space-x-2 pt-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Analyzing content structure...
                </span>
              </div>
            )}

            {/* Content Analysis Results */}
            {contentAnalysis && (
              <div className="space-y-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                {/* Hooks */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Hooks & Attention Grabbers
                  </h3>
                  <div className="mt-4 space-y-4">
                    {contentAnalysis.hooks.map((hook, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-purple-600 dark:text-purple-400">
                            {hook.type}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {hook.timestamp}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                          {hook.description}
                        </p>
                        <div className="mt-2 flex items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Effectiveness:
                          </span>
                          <div className="ml-2 h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className="h-2 rounded-full bg-purple-500"
                              style={{
                                width: `${(hook.effectiveness / 10) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                            {hook.effectiveness}/10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call-to-Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Call-to-Actions
                  </h3>
                  <div className="mt-4 space-y-4">
                    {contentAnalysis.callToAction.map((cta, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded-full px-2 py-1 text-sm font-medium ${
                              cta.type === "explicit"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {cta.type}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {cta.timestamp}
                          </span>
                        </div>
                        <p className="mt-2 font-medium text-gray-900 dark:text-white">
                          "{cta.text}"
                        </p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {cta.context}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Talking Points */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Key Talking Points
                  </h3>
                  <div className="mt-4 space-y-4">
                    {contentAnalysis.keyTalkingPoints.map((point, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {point.topic}
                          </span>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{point.timestamp}</span>
                            <span>({point.duration})</span>
                          </div>
                        </div>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600 dark:text-gray-400">
                          {point.keyPoints.map((keyPoint, idx) => (
                            <li key={idx}>{keyPoint}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Structure */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Content Structure
                  </h3>
                  <div className="mt-4">
                    <div className="relative">
                      {contentAnalysis.contentStructure.map(
                        (section, index) => (
                          <div
                            key={index}
                            className="mb-4 flex items-start space-x-4"
                          >
                            <div className="flex-shrink-0">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-grow rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {section.section}
                                </span>
                                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span>{section.timestamp}</span>
                                  <span>({section.duration})</span>
                                </div>
                              </div>
                              <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {section.purpose}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Engagement Techniques */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Engagement Techniques
                  </h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {contentAnalysis.engagementTechniques.map(
                      (technique, index) => (
                        <div
                          key={index}
                          className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-purple-600 dark:text-purple-400">
                              {technique.technique}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {technique.timestamp}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {technique.description}
                          </p>
                          <div className="mt-2 flex items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Effectiveness:
                            </span>
                            <div className="ml-2 h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                              <div
                                className="h-2 rounded-full bg-purple-500"
                                style={{
                                  width: `${
                                    (technique.effectiveness / 10) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                              {technique.effectiveness}/10
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Strategic Recommendations
                  </h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {contentAnalysis.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50"
                      >
                        <div className="mb-2 inline-block rounded-full bg-purple-100 px-2 py-1 text-sm font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                          {rec.category}
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {rec.suggestion}
                        </p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {rec.reasoning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Add after Content Analysis Results */}
            {contentAnalysis && !scriptResult && !isGeneratingScript && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={generateYouTubeScript}
                  className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-400"
                >
                  Generate YouTube Script
                </button>
              </div>
            )}

            {/* Script Generation Loading */}
            {isGeneratingScript && (
              <div className="flex items-center justify-center space-x-2 pt-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Generating YouTube script...
                </span>
              </div>
            )}

            {/* Script Error */}
            {scriptError && (
              <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {scriptError}
              </div>
            )}

            {/* Script Results */}
            {scriptResult && (
              <div className="space-y-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  YouTube Script
                </h2>

                {/* Title */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Title Options
                  </h3>
                  <p className="mt-2 text-lg font-medium text-purple-600 dark:text-purple-400">
                    {scriptResult.title}
                  </p>
                </div>

                {/* Hook */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Opening Hook
                  </h3>
                  <div className="mt-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                    <p className="text-gray-600 dark:text-gray-400">
                      {scriptResult.hook}
                    </p>
                  </div>
                </div>

                {/* Main Content */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Main Content
                  </h3>
                  <div className="mt-4 space-y-6">
                    {scriptResult.sections.map((section, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50"
                      >
                        <div className="mb-2 inline-block rounded-full bg-purple-100 px-2 py-1 text-sm font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                          {section.type}
                        </div>
                        <div className="mt-2 space-y-2">
                          <p className="text-gray-600 dark:text-gray-400">
                            {section.content}
                          </p>
                          {section.notes && (
                            <p className="text-sm italic text-gray-500 dark:text-gray-400">
                              Note: {section.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Call to Action
                  </h3>
                  <div className="mt-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                    <p className="text-gray-600 dark:text-gray-400">
                      {scriptResult.callToAction}
                    </p>
                  </div>
                </div>

                {/* Thumbnail Ideas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Thumbnail Ideas
                  </h3>
                  <div className="mt-2 space-y-2">
                    {scriptResult.thumbnailIdeas.map((idea, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50"
                      >
                        <p className="text-gray-600 dark:text-gray-400">
                          {idea}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Video Metadata
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Description
                      </h4>
                      <div className="mt-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                        <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                          {scriptResult.metadata.description}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Tags
                      </h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {scriptResult.metadata.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Category
                      </h4>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {scriptResult.metadata.category}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
