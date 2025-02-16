"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  speakers: {
    text: string;
    start: number;
    end: number;
    speaker: number;
  }[];
}

export default function TranscribePage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] =
    useState<string>("");
  const [transcriptionResult, setTranscriptionResult] =
    useState<TranscriptionResult | null>(null);
  const [transcriptionError, setTranscriptionError] = useState("");

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
        speakers: data.speakers || [],
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

  // Group speakers' text into paragraphs
  const groupedSpeakers = transcriptionResult?.speakers.reduce<{
    [key: number]: { text: string; start: number; end: number }[];
  }>((acc, curr) => {
    if (!acc[curr.speaker]) {
      acc[curr.speaker] = [];
    }
    acc[curr.speaker].push(curr);
    return acc;
  }, {});

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

            {/* Speaker Timeline */}
            {groupedSpeakers && Object.keys(groupedSpeakers).length > 1 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Speaker Timeline
                </h3>
                <div className="mt-2 space-y-4">
                  {Object.entries(groupedSpeakers).map(
                    ([speaker, utterances]) => (
                      <div key={speaker} className="space-y-2">
                        <h4 className="font-medium text-purple-600 dark:text-purple-400">
                          Speaker {parseInt(speaker) + 1}
                        </h4>
                        {utterances.map((utterance, index) => (
                          <div
                            key={index}
                            className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50"
                          >
                            <div className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                              {Math.floor(utterance.start)}s -{" "}
                              {Math.floor(utterance.end)}s
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                              {utterance.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
