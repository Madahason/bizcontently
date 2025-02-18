import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface TutorialStep {
  target: string;
  title: string;
  content: string;
  position: "top" | "right" | "bottom" | "left";
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onComplete: () => void;
  isOpen: boolean;
}

export default function TutorialOverlay({
  steps,
  onComplete,
  isOpen,
}: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const step = steps[currentStep];
      const element = document.querySelector(step.target);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const tooltipWidth = 280;
      const tooltipHeight = 120;
      const padding = 12;

      let top = 0;
      let left = 0;

      switch (step.position) {
        case "top":
          top = rect.top - tooltipHeight - padding;
          left = rect.left + (rect.width - tooltipWidth) / 2;
          break;
        case "right":
          top = rect.top + (rect.height - tooltipHeight) / 2;
          left = rect.right + padding;
          break;
        case "bottom":
          top = rect.bottom + padding;
          left = rect.left + (rect.width - tooltipWidth) / 2;
          break;
        case "left":
          top = rect.top + (rect.height - tooltipHeight) / 2;
          left = rect.left - tooltipWidth - padding;
          break;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [currentStep, steps, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      onComplete();
      setCurrentStep(0);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    setCurrentStep(0);
  };

  const step = steps[currentStep];

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50" />

      {/* Tooltip */}
      <div
        className="fixed z-50 w-[280px] space-y-3 rounded-lg bg-white p-4 shadow-lg"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="space-y-1">
          <h3 className="font-medium">{step.title}</h3>
          <p className="text-sm text-gray-600">{step.content}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-x-1">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  index === currentStep ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="space-x-2">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
            >
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
