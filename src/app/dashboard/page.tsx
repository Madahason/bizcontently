"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface KeywordData {
  text: string;
  clicks: number;
  impressions: number;
  ctr: string;
  position: string;
}

export default function DashboardPage() {
  const [keyword, setKeyword] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordData, setKeywordData] = useState<KeywordData[]>([]);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError("");
    setKeywordData([]);

    try {
      const response = await fetch("/api/keyword-research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch keyword data");
      }

      setKeywordData(data.keywords);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPositionColor = (position: string) => {
    const pos = parseFloat(position);
    if (pos <= 3) return "text-green-600 dark:text-green-400";
    if (pos <= 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Search Performance Analysis
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Analyze your website's search performance using real Google Search
          Console data
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Let&apos;s start by analyzing your target keywords
        </p>
      </div>

      {/* Search Form */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label
              htmlFor="keyword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Enter a keyword to analyze
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="keyword"
                name="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400"
                placeholder="e.g. content marketing, social media strategy"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!keyword.trim() || isAnalyzing}
            className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-400"
          >
            {isAnalyzing ? (
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
                Analyzing...
              </>
            ) : (
              "Analyze"
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

      {/* Results Section */}
      {keywordData.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {keywordData.map((data, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                {data.text}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Clicks:</span>{" "}
                    {data.clicks.toLocaleString()}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Impressions:</span>{" "}
                    {data.impressions.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-blue-600 dark:text-blue-400">
                    <span className="font-medium">CTR:</span> {data.ctr}
                  </p>
                  <p className={getPositionColor(data.position)}>
                    <span className="font-medium">Position:</span>{" "}
                    {data.position}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        !isAnalyzing &&
        !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
              >
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
