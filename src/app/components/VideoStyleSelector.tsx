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
    name: "Professional Stock Video",
    description:
      "Create engaging videos using high-quality stock footage with professional text overlays and transitions",
    features: [
      "High-quality stock footage",
      "Professional text overlays",
      "Smooth transitions",
      "Multiple layouts",
      "Background music options",
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

  // Auto-select the stock style since it's the only option
  if (!selectedStyle) {
    onSelect("stock");
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {videoStyles.map((style) => (
        <div
          key={style.id}
          className={`relative p-6 rounded-lg transition-all duration-200 ${
            selectedStyle === style.id
              ? "bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              <div className="flex-1">
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
        </div>
      ))}
    </div>
  );
}
