"use client";

import { useState } from "react";
import Image from "next/image";
import { VideoStyle } from "../../app/lib/video/templates/base/types";

interface VideoStyleOption {
  id: VideoStyle;
  name: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  preview: string;
}

const videoStyles: VideoStyleOption[] = [
  {
    id: "stock",
    name: "Stock Footage",
    description:
      "Professional video clips with text overlays and smooth transitions",
    features: [
      "High-quality stock footage",
      "Text animations",
      "Ken Burns effects",
      "Multiple layouts",
      "Custom overlays",
    ],
    icon: (
      <svg
        className="w-6 h-6"
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
    ),
    preview: "/previews/stock.svg",
  },
  {
    id: "kinetic",
    name: "Kinetic Typography",
    description: "Dynamic text animations with motion graphics",
    features: [
      "Animated text",
      "Motion graphics",
      "Dynamic backgrounds",
      "Modern transitions",
      "Bold typography",
    ],
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
    preview: "/previews/kinetic.svg",
  },
  {
    id: "whiteboard",
    name: "Digital Whiteboard",
    description: "Educational style with hand-drawn animations",
    features: [
      "Drawing animations",
      "Step-by-step reveals",
      "Clean design",
      "Educational style",
      "Diagram support",
    ],
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    preview: "/previews/whiteboard.svg",
  },
  {
    id: "character",
    name: "Character Animation",
    description: "Engaging character-based explainer videos",
    features: [
      "Animated characters",
      "Expression changes",
      "Scene transitions",
      "Character interactions",
      "Custom poses",
    ],
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    preview: "/previews/character.svg",
  },
];

interface VideoStyleSelectorProps {
  onSelect: (style: VideoStyle) => void;
  selectedStyle?: VideoStyle;
}

export default function VideoStyleSelector({
  onSelect,
  selectedStyle,
}: VideoStyleSelectorProps) {
  const [hoveredStyle, setHoveredStyle] = useState<VideoStyle | null>(null);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {}
  );

  const handleImageLoad = (styleId: string) => {
    setLoadingImages((prev) => ({ ...prev, [styleId]: false }));
  };

  const handleImageLoadStart = (styleId: string) => {
    setLoadingImages((prev) => ({ ...prev, [styleId]: true }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {videoStyles.map((style) => (
        <button
          key={style.id}
          onClick={() => onSelect(style.id)}
          onMouseEnter={() => setHoveredStyle(style.id)}
          onMouseLeave={() => setHoveredStyle(null)}
          className={`relative group p-6 rounded-lg transition-all duration-200 ${
            selectedStyle === style.id
              ? "bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500"
              : "bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="flex flex-col space-y-4">
            {/* Preview Image with Loading State */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
              {loadingImages[style.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <Image
                src={style.preview}
                alt={`${style.name} preview`}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  loadingImages[style.id] ? "opacity-0" : "opacity-100"
                }`}
                priority
                onLoadingComplete={() => handleImageLoad(style.id)}
                onLoad={() => handleImageLoad(style.id)}
                onLoadStart={() => handleImageLoadStart(style.id)}
              />
            </div>

            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-lg ${
                  selectedStyle === style.id
                    ? "bg-purple-500 text-white"
                    : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                }`}
              >
                {style.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {style.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {style.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {style.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                    >
                      <svg
                        className="w-4 h-4 mr-2 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {hoveredStyle === style.id && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <span className="text-white font-medium">Select Style</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
