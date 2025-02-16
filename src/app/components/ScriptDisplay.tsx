"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [viewMode, setViewMode] = useState<"script" | "scene">("script");
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const formatScriptForCopy = () => {
    const parts = [
      `Title: ${script.title}\n`,
      `Hook:\n${script.hook}\n`,
      ...script.sections.map(
        (section) =>
          `${section.type}:\n${section.content}\n\nNotes:\n${section.notes}\n`
      ),
      `Call to Action:\n${script.callToAction}\n`,
    ];
    return parts.join("\n");
  };

  const formatSceneNotesForCopy = () => {
    const parts = [
      `Title: ${script.title}\n`,
      ...script.sections
        .map((section) => {
          if (!section.sceneNotes) return "";
          return (
            `${section.type} - Scene Setup:\n\n` +
            `Setup:\n${section.sceneNotes.setup}\n\n` +
            `Shots:\n${section.sceneNotes.shots
              .map((shot) => `- ${shot}`)
              .join("\n")}\n\n` +
            `Visual Elements:\n${section.sceneNotes.visualElements
              .map((element) => `- ${element}`)
              .join("\n")}\n\n` +
            `Transitions:\n${section.sceneNotes.transitions}\n`
          );
        })
        .filter(Boolean),
    ];
    return parts.join("\n");
  };

  const handleCopy = async (type: "script" | "scene") => {
    try {
      const content =
        type === "script" ? formatScriptForCopy() : formatSceneNotesForCopy();
      await navigator.clipboard.writeText(content);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          {script.title}
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("script")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                viewMode === "script"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Script
            </button>
            <button
              onClick={() => setViewMode("scene")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                viewMode === "scene"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Scene Notes
            </button>
          </div>
          <button
            onClick={() => handleCopy(viewMode)}
            className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {copySuccess === viewMode ? (
              <>
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                Copy {viewMode === "script" ? "Script" : "Scene Notes"}
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6 max-h-[50vh] overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
        >
          {viewMode === "script" ? (
            // Script View
            <>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Hook
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {script.hook}
                </p>
              </div>

              {script.sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                >
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 capitalize">
                    {section.type}
                  </h3>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {section.content}
                    </p>
                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 italic">
                      {section.notes}
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Call to Action
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {script.callToAction}
                </p>
              </div>
            </>
          ) : (
            // Scene Notes View
            <>
              {script.sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                >
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 capitalize">
                    {section.type} - Scene Setup
                  </h3>
                  {section.sceneNotes ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Setup
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {section.sceneNotes.setup}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Shots
                        </h4>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1">
                          {section.sceneNotes.shots.map((shot, i) => (
                            <li key={i}>{shot}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Visual Elements
                        </h4>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1">
                          {section.sceneNotes.visualElements.map(
                            (element, i) => (
                              <li key={i}>{element}</li>
                            )
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Transitions
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {section.sceneNotes.transitions}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No scene notes available for this section
                    </p>
                  )}
                </div>
              ))}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
            Thumbnail Ideas
          </h3>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
            {script.thumbnailIdeas.map((idea, index) => (
              <li key={index}>{idea}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
            Metadata
          </h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-medium">Duration:</span>{" "}
              {script.metadata.estimatedDuration}
            </p>
            <p>
              <span className="font-medium">Category:</span>{" "}
              {script.metadata.category}
            </p>
            <p>
              <span className="font-medium">Tags:</span>{" "}
              {script.metadata.tags.join(", ")}
            </p>
            <div>
              <span className="font-medium">Description:</span>
              <p className="mt-1 whitespace-pre-wrap">
                {script.metadata.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
