import { useState, useEffect } from "react";

const TUTORIAL_COMPLETED_KEY = "tutorial_completed";

export const tutorialSteps = [
  {
    target: '[data-tutorial="storyboard"]',
    title: "Storyboard View",
    content:
      "This is your visual timeline. Click on any scene to edit its content, transitions, and text overlays.",
    position: "bottom" as const,
  },
  {
    target: '[data-tutorial="text-overlay"]',
    title: "Text Overlays",
    content:
      "Add and customize text overlays with different animations, styles, and highlights.",
    position: "left" as const,
  },
  {
    target: '[data-tutorial="transitions"]',
    title: "Scene Transitions",
    content:
      "Choose from a variety of transitions to smoothly connect your scenes.",
    position: "right" as const,
  },
  {
    target: '[data-tutorial="preview"]',
    title: "Real-time Preview",
    content:
      "See how your video looks as you make changes. The preview updates automatically.",
    position: "top" as const,
  },
];

export function useTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    if (!completed) {
      setIsOpen(true);
    } else {
      setHasCompletedTutorial(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, "true");
    setHasCompletedTutorial(true);
    setIsOpen(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem(TUTORIAL_COMPLETED_KEY);
    setHasCompletedTutorial(false);
    setIsOpen(true);
  };

  return {
    isOpen,
    hasCompletedTutorial,
    handleComplete,
    resetTutorial,
    steps: tutorialSteps,
  };
}
