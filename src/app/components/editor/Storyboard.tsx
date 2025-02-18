import { useVideoEditor } from "@/lib/contexts/VideoEditorContext";
import { TransitionIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useMemo } from "react";

export default function Storyboard() {
  const { state, dispatch } = useVideoEditor();

  const handleSceneClick = (index: number) => {
    dispatch({ type: "SET_CURRENT_SCENE", index });
  };

  const renderSceneThumbnail = (sceneIndex: number) => {
    const scene = state.scenes[sceneIndex];
    const isSelected = sceneIndex === state.currentSceneIndex;

    return (
      <div className="relative">
        <button
          onClick={() => handleSceneClick(sceneIndex)}
          className={`group relative aspect-video w-48 overflow-hidden rounded-lg border-2 transition-all ${
            isSelected
              ? "border-blue-500 shadow-lg"
              : "border-gray-200 hover:border-blue-300"
          }`}
        >
          {/* Scene Thumbnail */}
          {scene.assets.selected ? (
            <Image
              src={scene.assets.selected.thumbnailUrl}
              alt={`Scene ${sceneIndex + 1}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-sm text-gray-400">No asset selected</span>
            </div>
          )}

          {/* Text Overlay Preview */}
          {scene.textOverlay && (
            <div
              className="absolute inset-0 flex items-center justify-center p-2 text-center"
              style={{
                fontSize: "8px",
                ...scene.textOverlay.style,
                textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              {scene.textOverlay.text}
            </div>
          )}

          {/* Scene Number */}
          <div className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
            {sceneIndex + 1}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
        </button>

        {/* Transition Indicator */}
        {scene.transition && sceneIndex < state.scenes.length - 1 && (
          <div className="absolute -right-4 top-1/2 z-10 -translate-y-1/2">
            <TransitionIcon className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Storyboard</h2>
        <div className="text-sm text-gray-500">
          {state.currentSceneIndex + 1} of {state.scenes.length} scenes
        </div>
      </div>

      <div className="relative">
        <div className="flex space-x-8 overflow-x-auto pb-4">
          {state.scenes.map((_, index) => (
            <div key={index}>{renderSceneThumbnail(index)}</div>
          ))}
        </div>

        {/* Scroll Indicators */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />
      </div>
    </div>
  );
}
