import { createContext, useContext, useReducer, ReactNode } from "react";
import { Scene } from "@/lib/ai/scriptAnalysis";
import { TextOverlayConfig } from "@/lib/video/overlays/types";
import { TransitionConfig } from "@/lib/video/transitions/types";
import { AssetSearchResult } from "@/lib/video/assetMatching/types";

interface SceneState {
  content: string;
  assets: {
    selected: AssetSearchResult | null;
    suggestions: AssetSearchResult[];
  };
  textOverlay: TextOverlayConfig | null;
  transition: TransitionConfig | null;
  analysis: Scene | null;
}

interface EditorState {
  scenes: SceneState[];
  currentSceneIndex: number;
  history: {
    past: EditorState[];
    future: EditorState[];
  };
}

type EditorAction =
  | { type: "SET_SCENE_ASSET"; sceneIndex: number; asset: AssetSearchResult }
  | {
      type: "SET_SCENE_OVERLAY";
      sceneIndex: number;
      overlay: TextOverlayConfig;
    }
  | {
      type: "SET_SCENE_TRANSITION";
      sceneIndex: number;
      transition: TransitionConfig;
    }
  | { type: "UPDATE_SCENE_ANALYSIS"; sceneIndex: number; analysis: Scene }
  | { type: "SET_CURRENT_SCENE"; index: number }
  | { type: "UNDO" }
  | { type: "REDO" };

const initialState: EditorState = {
  scenes: [],
  currentSceneIndex: 0,
  history: {
    past: [],
    future: [],
  },
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  let newState: EditorState;

  switch (action.type) {
    case "SET_SCENE_ASSET":
      newState = {
        ...state,
        scenes: state.scenes.map((scene, index) =>
          index === action.sceneIndex
            ? {
                ...scene,
                assets: {
                  ...scene.assets,
                  selected: action.asset,
                },
              }
            : scene
        ),
      };
      break;

    case "SET_SCENE_OVERLAY":
      newState = {
        ...state,
        scenes: state.scenes.map((scene, index) =>
          index === action.sceneIndex
            ? {
                ...scene,
                textOverlay: action.overlay,
              }
            : scene
        ),
      };
      break;

    case "SET_SCENE_TRANSITION":
      newState = {
        ...state,
        scenes: state.scenes.map((scene, index) =>
          index === action.sceneIndex
            ? {
                ...scene,
                transition: action.transition,
              }
            : scene
        ),
      };
      break;

    case "UPDATE_SCENE_ANALYSIS":
      newState = {
        ...state,
        scenes: state.scenes.map((scene, index) =>
          index === action.sceneIndex
            ? {
                ...scene,
                analysis: action.analysis,
              }
            : scene
        ),
      };
      break;

    case "SET_CURRENT_SCENE":
      newState = {
        ...state,
        currentSceneIndex: action.index,
      };
      break;

    case "UNDO":
      if (state.history.past.length === 0) return state;
      const previous = state.history.past[state.history.past.length - 1];
      newState = {
        ...previous,
        history: {
          past: state.history.past.slice(0, -1),
          future: [state, ...state.history.future],
        },
      };
      break;

    case "REDO":
      if (state.history.future.length === 0) return state;
      const next = state.history.future[0];
      newState = {
        ...next,
        history: {
          past: [...state.history.past, state],
          future: state.history.future.slice(1),
        },
      };
      break;

    default:
      return state;
  }

  // Don't store history for undo/redo actions
  if (action.type !== "UNDO" && action.type !== "REDO") {
    newState.history = {
      past: [...state.history.past, state],
      future: [],
    };
  }

  return newState;
}

interface VideoEditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  canUndo: boolean;
  canRedo: boolean;
}

const VideoEditorContext = createContext<VideoEditorContextType | undefined>(
  undefined
);

export function VideoEditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const value = {
    state,
    dispatch,
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
  };

  return (
    <VideoEditorContext.Provider value={value}>
      {children}
    </VideoEditorContext.Provider>
  );
}

export function useVideoEditor() {
  const context = useContext(VideoEditorContext);
  if (context === undefined) {
    throw new Error("useVideoEditor must be used within a VideoEditorProvider");
  }
  return context;
}
