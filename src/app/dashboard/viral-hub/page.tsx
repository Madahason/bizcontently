"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface VideoStatistics {
  viewCount: number;
  likeCount: string;
  commentCount: string;
}

interface ViralMetrics {
  subscriberCount: number;
  averageChannelViews: number;
  viewsToSubscriberRatio: string;
  viewsToAverageRatio: string;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  statistics: VideoStatistics;
  viralMetrics: ViralMetrics;
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
  speakers: {
    text: string;
    start: number;
    end: number;
    speaker: number;
  }[];
}

export default function ViralHubPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError("");
    setVideos([]);

    try {
      const response = await fetch("/api/youtube/viral-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchTerm }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch viral videos");
      }

      setVideos(data.videos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalyzeClick = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Construct the video URL
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(videoUrl);
      setCopySuccess(videoId);

      // Clear success message after 2 seconds
      setTimeout(() => setCopySuccess(null), 2000);

      // Navigate to transcribe page
      router.push("/dashboard/transcribe");
    } catch (err) {
      console.error("Failed to copy URL:", err);
      // If clipboard fails, just navigate
      router.push("/dashboard/transcribe");
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Viral Video Hub
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover viral videos and create trending content
        </p>
      </div>

      {/* Search Form */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label
              htmlFor="searchTerm"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Search for viral videos
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="searchTerm"
                name="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400"
                placeholder="e.g. productivity tips, cooking hacks"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!searchTerm.trim() || isSearching}
            className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-400"
          >
            {isSearching ? (
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
                Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {isSearching && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800"
            >
              <div className="aspect-video animate-pulse bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {!isSearching &&
            videos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="group overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
              >
                {/* Thumbnail with Actions Overlay */}
                <div className="relative aspect-video overflow-hidden">
                  <div className="absolute inset-0 z-10 flex items-center justify-center space-x-4 bg-black bg-opacity-0 transition-all group-hover:bg-opacity-30">
                    {/* Play Button */}
                    <button
                      onClick={() => setSelectedVideo(video)}
                      className="rounded-full bg-purple-600 p-3 text-white opacity-0 transition-all hover:bg-purple-700 group-hover:opacity-100"
                    >
                      <svg
                        className="h-6 w-6"
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

                    {/* Analyze Button */}
                    <button
                      onClick={(e) => handleAnalyzeClick(video.id, e)}
                      className="rounded-full bg-purple-600 p-3 text-white opacity-0 transition-all hover:bg-purple-700 group-hover:opacity-100 disabled:bg-purple-400"
                    >
                      {copySuccess === video.id ? (
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-6 w-6"
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
                      )}
                    </button>
                  </div>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {video.title}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {video.channelTitle}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Views
                      </p>
                      <p className="text-purple-600 dark:text-purple-400">
                        {formatNumber(video.statistics.viewCount)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Channel Avg
                      </p>
                      <p className="text-purple-600 dark:text-purple-400">
                        {formatNumber(video.viralMetrics.averageChannelViews)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Subscribers
                      </p>
                      <p className="text-purple-600 dark:text-purple-400">
                        {formatNumber(video.viralMetrics.subscriberCount)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Viral Score
                      </p>
                      <p className="text-purple-600 dark:text-purple-400">
                        {Math.max(
                          parseFloat(video.viralMetrics.viewsToSubscriberRatio),
                          parseFloat(video.viralMetrics.viewsToAverageRatio)
                        ).toFixed(1)}
                        x
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!isSearching && !error && videos.length === 0 && (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Search for videos to discover viral content
          </p>
        </div>
      )}

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75"
              onClick={() => setSelectedVideo(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Video Player */}
              <div className="relative aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                  title={selectedVideo.title}
                  className="absolute inset-0 h-full w-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Info */}
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedVideo.title}
                </h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  {selectedVideo.channelTitle}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
