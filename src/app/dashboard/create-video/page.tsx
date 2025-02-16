"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

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

export default function CreateVideoPage() {
  const searchParams = useSearchParams();
  const [script, setScript] = useState<YouTubeScript | null>(null);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [recordingStatus, setRecordingStatus] = useState<
    "idle" | "recording" | "paused"
  >("idle");

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

  const allSections = [
    { type: "Hook", content: script.hook },
    ...script.sections.map((section) => ({
      type: section.type,
      content: section.content,
    })),
    { type: "Call to Action", content: script.callToAction },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create Video: {script.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Record your video section by section using the script below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Script Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Script Sections
            </h2>
            <div className="space-y-4">
              {allSections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSection(index)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    activeSection === index
                      ? "bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500"
                      : "bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900/70"
                  }`}
                >
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {section.type}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {section.content}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recording Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recording
            </h2>
            <div className="aspect-video bg-gray-900 rounded-lg mb-4">
              {/* Video preview will go here */}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() =>
                  setRecordingStatus(
                    recordingStatus === "recording" ? "paused" : "recording"
                  )
                }
                className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                  recordingStatus === "recording"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                {recordingStatus === "recording" ? (
                  <>
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
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Pause</span>
                  </>
                ) : (
                  <>
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
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Record</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scene Notes (if available) */}
          {script.sections[activeSection]?.sceneNotes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Scene Notes
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Setup
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {script.sections[activeSection].sceneNotes?.setup}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Shots
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {script.sections[activeSection].sceneNotes?.shots.map(
                      (shot, index) => (
                        <li key={index}>{shot}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Visual Elements
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {script.sections[
                      activeSection
                    ].sceneNotes?.visualElements.map((element, index) => (
                      <li key={index}>{element}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
