"use client";

import { useState } from "react";

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

interface ScriptDisplayProps {
  script: YouTubeScript;
}

export default function ScriptDisplay({ script }: ScriptDisplayProps) {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const formatScript = () => {
    const parts = [
      `Title: ${script.title}\n`,
      `Hook:\n${script.hook}\n`,
      ...script.sections.map(
        (section) =>
          `${section.type}:\n${section.content}\n\nNotes:\n${section.notes}\n`
      ),
      `Call to Action:\n${script.callToAction}\n`,
      `\nThumbnail Ideas:\n${script.thumbnailIdeas
        .map((idea) => `- ${idea}`)
        .join("\n")}\n`,
      `\nMetadata:\n`,
      `Duration: ${script.metadata.estimatedDuration}`,
      `Category: ${script.metadata.category}`,
      `Tags: ${script.metadata.tags.join(", ")}`,
      `\nDescription:\n${script.metadata.description}`,
    ];
    return parts.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatScript());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header with Title and Actions */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          {script.title}
        </h2>
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            <span>{copySuccess ? "Copied!" : "Copy Script"}</span>
          </button>
          <button
            onClick={() =>
              (window.location.href = `/dashboard/create-video?script=${encodeURIComponent(
                JSON.stringify(script)
              )}`)
            }
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>Create Video</span>
          </button>
        </div>
      </div>

      {/* Script Editor */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-mono text-sm leading-relaxed">
            {formatScript()}
          </pre>
        </div>
      </div>
    </div>
  );
}
